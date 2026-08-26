/**
 * Steps of Valor Check-In Desk
 *
 * Install this as a container-bound Google Apps Script inside the Google Sheet
 * receiving registration submissions. It adds a private staff sidebar for fast
 * search and one-tap event check-in.
 */

var SOV_CHECKIN = {
  scriptProperties: {
    sheetName: "SOV_REGISTRATION_SHEET_NAME",
    passcode: "SOV_CHECKIN_PASSCODE",
    staffEmails: "SOV_STAFF_EMAILS"
  },
  preferredSheetNames: [
    "Registrations",
    "Form responses 1",
    "Sheet1"
  ],
  checkInHeaders: {
    checkedIn: "Checked In",
    checkInTime: "Check-in Time",
    checkedInBy: "Checked In By",
    notes: "Check-in Notes"
  },
  aliases: {
    fullName: ["full name", "name", "participant name", "registrant name"],
    firstName: ["first name", "first"],
    lastName: ["last name", "last", "surname"],
    email: ["email address", "email", "e mail"],
    phone: ["phone number", "phone", "mobile", "cell"],
    organization: ["organization", "organisation", "team", "team or organization", "company", "department"],
    checkedIn: ["checked in"],
    checkInTime: ["check in time", "check-in time"],
    checkedInBy: ["checked in by"],
    notes: ["check in notes", "check-in notes", "notes"]
  },
  searchLimit: 30
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Steps of Valor")
    .addItem("Open Check-In Desk", "openCheckInDesk")
    .addItem("Prepare Check-In Columns", "setupCheckInSheet")
    .addToUi();
}

function openCheckInDesk() {
  var template = HtmlService.createTemplateFromFile("Index");
  template.appMode = "sidebar";

  var html = template
    .evaluate()
    .setTitle("Steps of Valor Check-In");

  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Optional phone/tablet mode.
 *
 * Do not deploy as a public web app unless SOV_CHECKIN_PASSCODE is set in
 * Apps Script Project Settings > Script properties.
 */
function doGet() {
  if (!getScriptProperty_(SOV_CHECKIN.scriptProperties.passcode)) {
    return HtmlService.createHtmlOutput(
      "<h1>Check-in web app is not enabled</h1>" +
      "<p>Set the SOV_CHECKIN_PASSCODE script property before using web-app mode.</p>"
    ).setTitle("Steps of Valor Check-In");
  }

  var template = HtmlService.createTemplateFromFile("Index");
  template.appMode = "web";

  return template
    .evaluate()
    .setTitle("Steps of Valor Check-In")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function setupCheckInSheet(passcode) {
  verifyAccess_(passcode);

  var sheet = getRegistrationSheet_();
  ensureCheckInColumns_(sheet);
  sheet.setFrozenRows(1);

  try {
    if (!sheet.getFilter() && sheet.getLastRow() > 1 && sheet.getLastColumn() > 0) {
      sheet.getDataRange().createFilter();
    }
  } catch (error) {
    // Filters are a convenience, not required for check-in.
  }

  return getInitialState(passcode);
}

function getInitialState(passcode) {
  verifyAccess_(passcode);

  var table = getTable_(true);
  return {
    appName: "Steps of Valor Check-In",
    sheetName: table.sheet.getName(),
    spreadsheetName: table.spreadsheet.getName(),
    stats: getStats_(table),
    hasPasscode: Boolean(getScriptProperty_(SOV_CHECKIN.scriptProperties.passcode)),
    generatedAt: formatDateTime_(new Date())
  };
}

function searchRegistrants(query, passcode) {
  verifyAccess_(passcode);

  var normalizedQuery = normalizeSearch_(query);
  if (normalizedQuery.length < 2) {
    return {
      query: query || "",
      results: [],
      stats: getStats_(getTable_(true)),
      message: "Type at least 2 characters to search."
    };
  }

  var tokens = normalizedQuery.split(" ").filter(Boolean);
  var table = getTable_(true);
  var results = [];
  var totalMatches = 0;

  for (var r = 1; r < table.values.length; r += 1) {
    var row = table.values[r];
    if (!rowHasData_(row)) continue;

    var haystack = normalizeSearch_(row.map(formatCellForSearch_).join(" "));
    var isMatch = tokens.every(function (token) {
      return haystack.indexOf(token) !== -1;
    });

    if (isMatch) {
      totalMatches += 1;
      if (results.length < SOV_CHECKIN.searchLimit) {
        results.push(rowToRegistrant_(row, r + 1, table));
      }
    }
  }

  return {
    query: query || "",
    results: results,
    totalMatches: totalMatches,
    limited: totalMatches > results.length,
    stats: getStats_(table),
    message: results.length ? "" : "No matching registrations found."
  };
}

function checkInRegistrant(rowNumber, staffName, notes, passcode) {
  verifyAccess_(passcode);

  rowNumber = Number(rowNumber);
  if (!rowNumber || rowNumber < 2) {
    throw new Error("Invalid row selected for check-in.");
  }

  var lock = LockService.getDocumentLock();
  lock.waitLock(5000);

  try {
    var table = getTable_(true);
    if (rowNumber > table.sheet.getLastRow()) {
      throw new Error("That registration row no longer exists.");
    }

    var columns = table.columns;
    var checkedCell = table.sheet.getRange(rowNumber, columns.checkedIn + 1);
    var checkedValue = checkedCell.getValue();

    if (!isCheckedIn_(checkedValue)) {
      checkedCell.setValue(true);
      table.sheet.getRange(rowNumber, columns.checkInTime + 1).setValue(new Date());
      table.sheet.getRange(rowNumber, columns.checkedInBy + 1).setValue(getStaffLabel_(staffName));
      if (notes) {
        table.sheet.getRange(rowNumber, columns.notes + 1).setValue(String(notes).trim());
      }
    }

    SpreadsheetApp.flush();
    table = getTable_(false);

    return {
      registrant: rowToRegistrant_(table.values[rowNumber - 1], rowNumber, table),
      stats: getStats_(table)
    };
  } finally {
    lock.releaseLock();
  }
}

function undoCheckIn(rowNumber, passcode) {
  verifyAccess_(passcode);

  rowNumber = Number(rowNumber);
  if (!rowNumber || rowNumber < 2) {
    throw new Error("Invalid row selected for undo.");
  }

  var lock = LockService.getDocumentLock();
  lock.waitLock(5000);

  try {
    var table = getTable_(true);
    if (rowNumber > table.sheet.getLastRow()) {
      throw new Error("That registration row no longer exists.");
    }

    var columns = table.columns;
    table.sheet.getRange(rowNumber, columns.checkedIn + 1).clearContent();
    table.sheet.getRange(rowNumber, columns.checkInTime + 1).clearContent();
    table.sheet.getRange(rowNumber, columns.checkedInBy + 1).clearContent();
    table.sheet.getRange(rowNumber, columns.notes + 1).clearContent();

    SpreadsheetApp.flush();
    table = getTable_(false);

    return {
      registrant: rowToRegistrant_(table.values[rowNumber - 1], rowNumber, table),
      stats: getStats_(table)
    };
  } finally {
    lock.releaseLock();
  }
}

function getRegistrationSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No active spreadsheet found. Install this script inside the registration Google Sheet.");
  }

  var configuredName = getScriptProperty_(SOV_CHECKIN.scriptProperties.sheetName);
  if (configuredName) {
    var configuredSheet = spreadsheet.getSheetByName(configuredName);
    if (configuredSheet) return configuredSheet;
  }

  for (var i = 0; i < SOV_CHECKIN.preferredSheetNames.length; i += 1) {
    var namedSheet = spreadsheet.getSheetByName(SOV_CHECKIN.preferredSheetNames[i]);
    if (namedSheet) return namedSheet;
  }

  return spreadsheet.getSheets()[0];
}

function getTable_(ensureColumns) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getRegistrationSheet_();

  if (ensureColumns) {
    ensureCheckInColumns_(sheet);
  }

  var values = sheet.getDataRange().getValues();
  if (!values.length || !rowHasData_(values[0])) {
    sheet.getRange(1, 1, 1, 5).setValues([[
      "Submitted at",
      "Full name",
      "Email address",
      "Phone number",
      "Organization"
    ]]);
    ensureCheckInColumns_(sheet);
    values = sheet.getDataRange().getValues();
  }

  var headers = values[0].map(function (header) {
    return String(header || "").trim();
  });
  var index = buildHeaderIndex_(headers);
  var columns = identifyColumns_(index);

  return {
    spreadsheet: spreadsheet,
    sheet: sheet,
    values: values,
    headers: headers,
    index: index,
    columns: columns
  };
}

function ensureCheckInColumns_(sheet) {
  var requiredHeaders = [
    SOV_CHECKIN.checkInHeaders.checkedIn,
    SOV_CHECKIN.checkInHeaders.checkInTime,
    SOV_CHECKIN.checkInHeaders.checkedInBy,
    SOV_CHECKIN.checkInHeaders.notes
  ];

  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([[
      "Submitted at",
      "Full name",
      "Email address",
      "Phone number",
      "Organization"
    ]]);
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var normalized = headers.map(normalizeHeader_);
  var nextColumn = sheet.getLastColumn() + 1;

  requiredHeaders.forEach(function (header) {
    if (normalized.indexOf(normalizeHeader_(header)) === -1) {
      sheet.getRange(1, nextColumn).setValue(header);
      normalized.push(normalizeHeader_(header));
      nextColumn += 1;
    }
  });
}

function buildHeaderIndex_(headers) {
  var index = {};
  headers.forEach(function (header, i) {
    var normalized = normalizeHeader_(header);
    if (normalized && index[normalized] === undefined) {
      index[normalized] = i;
    }
  });
  return index;
}

function identifyColumns_(index) {
  return {
    fullName: firstColumn_(index, SOV_CHECKIN.aliases.fullName),
    firstName: firstColumn_(index, SOV_CHECKIN.aliases.firstName),
    lastName: firstColumn_(index, SOV_CHECKIN.aliases.lastName),
    email: firstColumn_(index, SOV_CHECKIN.aliases.email),
    phone: firstColumn_(index, SOV_CHECKIN.aliases.phone),
    organization: firstColumn_(index, SOV_CHECKIN.aliases.organization),
    checkedIn: firstColumn_(index, SOV_CHECKIN.aliases.checkedIn),
    checkInTime: firstColumn_(index, SOV_CHECKIN.aliases.checkInTime),
    checkedInBy: firstColumn_(index, SOV_CHECKIN.aliases.checkedInBy),
    notes: firstColumn_(index, SOV_CHECKIN.aliases.notes)
  };
}

function firstColumn_(index, aliases) {
  for (var i = 0; i < aliases.length; i += 1) {
    var key = normalizeHeader_(aliases[i]);
    if (index[key] !== undefined) return index[key];
  }
  return -1;
}

function rowToRegistrant_(row, rowNumber, table) {
  var columns = table.columns;
  var first = getCell_(row, columns.firstName);
  var last = getCell_(row, columns.lastName);
  var fullName = getCell_(row, columns.fullName) || [first, last].filter(Boolean).join(" ");
  var checkedIn = isCheckedIn_(getCell_(row, columns.checkedIn));

  return {
    rowNumber: rowNumber,
    name: fullName || "(No name)",
    email: getCell_(row, columns.email),
    phone: getCell_(row, columns.phone),
    organization: getCell_(row, columns.organization),
    checkedIn: checkedIn,
    checkInTime: checkedIn ? formatDateTime_(getCell_(row, columns.checkInTime)) : "",
    checkedInBy: getCell_(row, columns.checkedInBy),
    notes: getCell_(row, columns.notes)
  };
}

function getStats_(table) {
  var registered = 0;
  var checkedIn = 0;

  for (var r = 1; r < table.values.length; r += 1) {
    var row = table.values[r];
    if (!rowHasData_(row)) continue;

    registered += 1;
    if (isCheckedIn_(getCell_(row, table.columns.checkedIn))) {
      checkedIn += 1;
    }
  }

  return {
    registered: registered,
    checkedIn: checkedIn,
    remaining: Math.max(registered - checkedIn, 0)
  };
}

function verifyAccess_(passcode) {
  var staffEmails = getScriptProperty_(SOV_CHECKIN.scriptProperties.staffEmails);
  if (staffEmails) {
    var allowed = staffEmails
      .split(",")
      .map(function (email) { return email.trim().toLowerCase(); })
      .filter(Boolean);

    if (allowed.length) {
      var activeEmail = "";
      try {
        activeEmail = String(Session.getActiveUser().getEmail() || "").toLowerCase();
      } catch (error) {
        activeEmail = "";
      }

      if (!activeEmail || allowed.indexOf(activeEmail) === -1) {
        throw new Error("This Google account is not on the check-in staff list.");
      }
    }
  }

  var requiredPasscode = getScriptProperty_(SOV_CHECKIN.scriptProperties.passcode);
  if (requiredPasscode && String(passcode || "") !== requiredPasscode) {
    throw new Error("Passcode required. Enter the staff passcode to continue.");
  }
}

function getStaffLabel_(staffName) {
  var trimmedName = String(staffName || "").trim();
  if (trimmedName) return trimmedName;

  try {
    var email = Session.getActiveUser().getEmail();
    if (email) return email;
  } catch (error) {
    // Fall through to a generic label.
  }

  return "Event staff";
}

function getScriptProperty_(key) {
  return String(PropertiesService.getScriptProperties().getProperty(key) || "").trim();
}

function getCell_(row, index) {
  if (index < 0 || index >= row.length) return "";
  var value = row[index];
  if (value instanceof Date) return value;
  return String(value || "").trim();
}

function rowHasData_(row) {
  return row.some(function (value) {
    return String(value || "").trim() !== "";
  });
}

function isCheckedIn_(value) {
  if (value === true) return true;
  if (value instanceof Date) return true;

  var normalized = normalizeHeader_(value);
  return ["true", "yes", "y", "checked", "checked in", "x"].indexOf(normalized) !== -1;
}

function normalizeHeader_(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeSearch_(value) {
  var text = String(value || "").toLowerCase();
  try {
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (error) {
    // normalize() is available in Apps Script V8; keep a safe fallback.
  }

  return text.replace(/[^a-z0-9@.]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatCellForSearch_(value) {
  if (value instanceof Date) {
    return formatDateTime_(value);
  }
  return String(value || "");
}

function formatDateTime_(value) {
  if (!value) return "";
  if (!(value instanceof Date)) return String(value || "");

  var timezone = Session.getScriptTimeZone() || "America/Chicago";
  return Utilities.formatDate(value, timezone, "MMM d, yyyy h:mm a");
}
