(function () {
  "use strict";

  function formToObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  window.WeddingRSVP = {
    init(config) {
      const form = document.getElementById("rsvpForm");
      const status = document.getElementById("rsvpStatus");
      if (!form) return;

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = {
          type: "rsvp",
          ...formToObject(form),
          submittedAt: new Date().toISOString(),
          couple: config.couple.bride + " & " + config.couple.groom
        };

        status.textContent = "Sending your RSVP...";

        if (!config.rsvp.googleAppsScriptUrl) {
          status.textContent = "RSVP is almost ready. Add the Google Apps Script URL in js/config.js.";
          return;
        }

        try {
          await fetch(config.rsvp.googleAppsScriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data)
          });

          status.textContent = "Thank you. Your RSVP has been received.";
          form.reset();
        } catch (error) {
          status.textContent = "Could not submit right now. Please try again in a moment.";
        }
      });
    }
  };
})();
