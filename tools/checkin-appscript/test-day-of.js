const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const rows = [
  ["Submission ID", "Respondent ID", "Submitted at", "Full name", "Email address", "Phone number", "Organization", "Event agreement", "Event agreement copy", "Checked In", "Check-in Time", "Checked In By", "Check-in Notes", "Internal Notes"],
  ["advance", "one", new Date("2026-09-10T12:00:00-05:00"), "Advance Registrant", "advance@example.org", "", "", "Yes", "", "", "", "", "", ""],
  ["dayof", "two", new Date("2026-09-11T06:50:00-05:00"), "Day-of Registrant", "dayof@example.org", "", "", "Yes", "", "", "", "", "", ""],
  ["checked", "three", new Date("2026-09-11T07:00:00-05:00"), "Already Checked", "checked@example.org", "", "", "Yes", "", true, new Date("2026-09-11T07:01:00-05:00"), "Event staff", "", ""]
];

function range(row, column, rowCount = 1, columnCount = 1) {
  return {
    getValues() {
      return rows.slice(row - 1, row - 1 + rowCount).map((sourceRow) =>
        sourceRow.slice(column - 1, column - 1 + columnCount)
      );
    },
    getValue() {
      return rows[row - 1][column - 1];
    },
    setValue(value) {
      rows[row - 1][column - 1] = value;
      return this;
    },
    setValues(values) {
      values.forEach((valueRow, rowOffset) => {
        valueRow.forEach((value, columnOffset) => {
          rows[row - 1 + rowOffset][column - 1 + columnOffset] = value;
        });
      });
      return this;
    },
    setNumberFormat() {
      return this;
    },
    clearContent() {
      rows[row - 1][column - 1] = "";
      return this;
    }
  };
}

const sheet = {
  getName: () => "Registrations",
  getLastRow: () => rows.length,
  getLastColumn: () => rows[0].length,
  getDataRange: () => ({getValues: () => rows.map((row) => row.slice())}),
  getRange: range,
  setFrozenRows: () => {},
  getFilter: () => ({})
};

const spreadsheet = {
  getName: () => "Steps of Valor 2026 Registration + Check-In",
  getSheetByName: (name) => name === "Registrations" ? sheet : null,
  getSheets: () => [sheet],
  toast: () => {}
};

function formatDate(date, timezone, pattern) {
  if (pattern === "yyyy-MM-dd") {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date).reduce((map, part) => ({...map, [part.type]: part.value}), {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  return date.toISOString();
}

const context = {
  console,
  Date,
  Math,
  String,
  Number,
  Boolean,
  Array,
  Object,
  RegExp,
  JSON,
  Error,
  isNaN,
  SpreadsheetApp: {
    getActiveSpreadsheet: () => spreadsheet,
    flush: () => {},
    getUi: () => ({createMenu: () => ({addItem() { return this; }, addSeparator() { return this; }, addToUi() { return this; }})})
  },
  LockService: {getDocumentLock: () => ({waitLock: () => {}, releaseLock: () => {}})},
  Utilities: {formatDate},
  Session: {getScriptTimeZone: () => "America/Chicago", getActiveUser: () => ({getEmail: () => "staff@example.org"})},
  PropertiesService: {getScriptProperties: () => ({getProperty: () => ""})},
  ScriptApp: {getProjectTriggers: () => [], newTrigger: () => ({timeBased() { return this; }, everyMinutes() { return this; }, create() { return this; }})},
  HtmlService: {}
};

vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + "/Code.gs", "utf8"), context);

const result = context.processDayOfRegistrations();

assert.equal(result.updatedCount, 1);
assert.equal(JSON.stringify(result.updatedRows), "[3]");
assert.equal(rows[1][9], "", "advance registrants must remain unchecked");
assert.equal(rows[2][9], true, "day-of registrant should be checked in");
assert.equal(rows[2][10].toISOString(), "2026-09-11T11:50:00.000Z");
assert.equal(rows[2][11], "Day-of QR registration");
assert.equal(rows[2][12], "Automatically checked in from day-of registration.");
assert.equal(rows[3][11], "Event staff", "existing check-in data must remain unchanged");

console.log("Day-of auto check-in test passed.");
