(function () {
  var config = window.SOV_CONFIG || {};
  var links = config.links || {};
  var contact = config.contact || {};
  var beneficiaries = config.beneficiaries || {};
  var menuButton = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  function setExternalLink(selector, value, fallback) {
    document.querySelectorAll(selector).forEach(function (element) {
      if (value) {
        element.href = value;
        element.removeAttribute("aria-disabled");
        if (/^https?:\/\//.test(value) || /\.pdf(?:$|\?)/i.test(value)) {
          element.target = "_blank";
          element.rel = "noopener";
        }
      } else if (fallback) {
        element.href = fallback;
      }
    });
  }

  setExternalLink("[data-link='donation']", links.donationUrl, "contact.html");
  setExternalLink("[data-link='registration']", links.registrationFormUrl, "register.html");
  setExternalLink("[data-link='uta-waiver']", links.utaWaiverUrl, "register.html");
  setExternalLink("[data-link='sponsor-interest']", links.sponsorInterestUrl, "contact.html");
  setExternalLink("[data-link='sponsor-packet']", links.sponsorPacketUrl, "sponsors.html#sponsor-packet-needed");
  setExternalLink("[data-link='military-heroes']", beneficiaries.militaryHeroes, "#");
  setExternalLink("[data-link='arlington-firefighters']", beneficiaries.arlingtonFirefighters, "#");

  function toTallyEmbedUrl(value) {
    if (!value) return "";

    try {
      var url = new URL(value, window.location.href);
      var hostname = url.hostname.replace(/^www\./, "");
      if (hostname !== "tally.so") return "";

      if (url.pathname.indexOf("/r/") === 0) {
        url.pathname = url.pathname.replace("/r/", "/embed/");
      }

      if (url.pathname.indexOf("/embed/") !== 0) return "";

      url.searchParams.set("alignLeft", "1");
      url.searchParams.set("hideTitle", "1");
      url.searchParams.set("transparentBackground", "1");
      url.searchParams.set("dynamicHeight", "1");
      return url.toString();
    } catch (error) {
      return "";
    }
  }

  function loadTallyEmbed() {
    var embed = document.querySelector("[data-tally-registration]");
    if (!embed) return;

    var iframe = embed.querySelector("iframe");
    var placeholder = document.querySelector("[data-registration-placeholder]");
    var externalLink = document.querySelector("[data-registration-open]");
    var embedUrl = toTallyEmbedUrl(links.registrationFormUrl);

    if (!embedUrl || !iframe) {
      embed.hidden = true;
      if (placeholder) placeholder.hidden = false;
      return;
    }

    iframe.setAttribute("data-tally-src", embedUrl);
    iframe.setAttribute("src", embedUrl);
    embed.hidden = false;
    if (placeholder) placeholder.hidden = true;
    if (externalLink) {
      externalLink.href = links.registrationFormUrl;
      externalLink.hidden = false;
      externalLink.target = "_blank";
      externalLink.rel = "noopener";
    }

    if (window.Tally && typeof window.Tally.loadEmbeds === "function") {
      window.Tally.loadEmbeds();
      return;
    }

    if (!document.querySelector("script[src='https://tally.so/widgets/embed.js']")) {
      var script = document.createElement("script");
      script.src = "https://tally.so/widgets/embed.js";
      script.async = true;
      script.onload = function () {
        if (window.Tally && typeof window.Tally.loadEmbeds === "function") {
          window.Tally.loadEmbeds();
        }
      };
      document.body.appendChild(script);
    }
  }

  loadTallyEmbed();

  try {
    if (new URLSearchParams(window.location.search).get("source") === "day-of") {
      document.querySelectorAll("[data-day-of-registration-notice]").forEach(function (notice) {
        notice.hidden = false;
      });
    }
  } catch (error) {
    // The standard registration page works even if URLSearchParams is unavailable.
  }

  function scrollToWaiverStep() {
    var waiverStep = document.querySelector("[data-waiver-step]");
    if (!waiverStep) return;

    waiverStep.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(function () {
      waiverStep.focus({ preventScroll: true });
    }, 650);
  }

  window.addEventListener("message", function (event) {
    if (!event.origin || event.origin.replace(/^https?:\/\//, "").replace(/^www\./, "") !== "tally.so") return;

    var eventName = "";
    if (typeof event.data === "string") {
      if (event.data.indexOf("Tally.FormSubmitted") !== -1) {
        eventName = "Tally.FormSubmitted";
      }
    } else if (event.data && typeof event.data === "object") {
      eventName = event.data.event || event.data.type || event.data.name || "";
    }

    if (eventName === "Tally.FormSubmitted") {
      scrollToWaiverStep();
    }
  });

  window.addEventListener("Tally.FormSubmitted", scrollToWaiverStep);

  document.querySelectorAll("[data-email='contact']").forEach(function (element) {
    element.href = "mailto:" + (contact.email || "Thaddeus@stepsofvalor.org");
    element.textContent = contact.email || "Thaddeus@stepsofvalor.org";
  });

  document.querySelectorAll("[data-email='chapter']").forEach(function (element) {
    element.href = "mailto:" + (contact.chapterEmail || "kappasiguta@gmail.com");
    element.textContent = contact.chapterEmail || "kappasiguta@gmail.com";
  });

  setExternalLink("[data-link='instagram']", contact.instagramUrl, "contact.html");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("menu-open", isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  document.querySelectorAll("[data-current]").forEach(function (link) {
    var path = window.location.pathname.split("/").pop() || "index.html";
    if (link.getAttribute("href") === path) {
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll("[data-current-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
})();
