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
  setExternalLink("[data-link='sponsor-interest']", links.sponsorInterestUrl, "contact.html");
  setExternalLink("[data-link='sponsor-packet']", links.sponsorPacketUrl, "sponsors.html#sponsor-packet-needed");
  setExternalLink("[data-link='military-heroes']", beneficiaries.militaryHeroes, "#");
  setExternalLink("[data-link='arlington-firefighters']", beneficiaries.arlingtonFirefighters, "#");

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
