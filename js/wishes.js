(function () {
  "use strict";

  const fallbackWishes = [
    { name: "Family", message: "May this beautiful journey be filled with warmth, laughter, and endless mercy." },
    { name: "Friends", message: "Wishing you both a lifetime of quiet joy and grand little moments." }
  ];

  function normalizeWish(wish) {
    return {
      name: wish.name || wish.guestName || "Guest",
      message: wish.message || wish.wish || wish.text || ""
    };
  }

  function animateCards() {
    if (!window.gsap) return;
    gsap.fromTo(
      ".wish-card",
      { y: 18, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, stagger: 0.045, ease: "power4.out" }
    );
  }

  window.WeddingWishes = {
    init(config) {
      const form = document.getElementById("wishForm");
      const wall = document.getElementById("wishesWall");
      const status = document.getElementById("wishStatus");
      const endpoint = config.wishes?.googleAppsScriptUrl;
      const limit = config.wishes?.limit || 20;
      if (!form || !wall) return;

      let wishes = [];

      const render = (items) => {
        const clean = items.map(normalizeWish).filter((wish) => wish.message).slice(0, limit);
        wall.innerHTML = clean.map((wish) => `
          <article class="wish-card">
            <p>${wish.message}</p>
            <strong>${wish.name}</strong>
          </article>
        `).join("");
        animateCards();
      };

      const load = async () => {
        if (!endpoint) {
          wishes = fallbackWishes;
          render(wishes);
          return;
        }

        try {
          const response = await fetch(`${endpoint}?action=wishes&limit=${limit}`, { cache: "no-store" });
          const payload = await response.json();
          const list = Array.isArray(payload) ? payload : payload.wishes || payload.data || fallbackWishes;
          wishes = list.length ? list : fallbackWishes;
          render(wishes);
        } catch (error) {
          if (!wishes.length) {
            wishes = fallbackWishes;
            render(wishes);
          }
        }
      };

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("wishName").value.trim();
        const message = document.getElementById("wishText").value.trim();
        if (!name || !message) return;

        const wish = {
          type: "wish",
          name,
          message,
          submittedAt: new Date().toISOString(),
          couple: config.couple.bride + " & " + config.couple.groom
        };

        wishes = [wish, ...wishes].slice(0, limit);
        render(wishes);
        form.reset();
        if (status) status.textContent = "Your wish has been added.";

        if (!endpoint) return;

        try {
          await fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(wish)
          });
          window.setTimeout(load, 1800);
        } catch (error) {
          if (status) status.textContent = "Saved here for now. Please try again if it does not appear later.";
        }
      });

      load();
      if (endpoint && config.wishes?.refreshMs) {
        window.setInterval(load, config.wishes.refreshMs);
      }
    }
  };
})();
