(function () {
  "use strict";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  window.WeddingCountdown = {
    start(config) {
      const date = new Date(config.wedding.dateISO).getTime();
      const grid = document.getElementById("countdownGrid");
      const reveal = document.getElementById("ceremonyReveal");
      const ceremonyKey = "wedding-started-" + date;
      let hasRevealed = false;

      const celebrate = () => {
        if (hasRevealed) return;
        hasRevealed = true;
        localStorage.setItem(ceremonyKey, "true");

        const showReveal = () => {
          if (grid) grid.style.display = "none";
          if (reveal) reveal.style.display = "block";

          if (window.gsap && reveal) {
            gsap.fromTo(
              reveal,
              { y: 24, opacity: 0, scale: 0.98, filter: "blur(12px)" },
              { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.15, ease: "power4.out" }
            );
            gsap.fromTo(
              reveal.querySelectorAll(".eyebrow, h3, .section-rule, p, span"),
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.85, stagger: 0.09, delay: 0.18, ease: "power4.out" }
            );
          }

          window.WeddingAudio?.playChime();

          if (window.confetti) {
            confetti({
              particleCount: 58,
              spread: 78,
              startVelocity: 18,
              gravity: 0.55,
              scalar: 0.72,
              ticks: 190,
              origin: { y: 0.58 },
              colors: [config.colors.gold, config.colors.champagne, config.colors.ivory, config.colors.beige]
            });
          }
        };

        if (window.gsap && grid) {
          gsap.to(grid.children, {
            y: -18,
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.75,
            stagger: 0.06,
            ease: "power3.inOut",
            onComplete: () => window.setTimeout(showReveal, 420)
          });
        } else {
          showReveal();
        }
      };

      const update = () => {
        const diff = date - Date.now();

        if (diff <= 0) {
          celebrate();
          return false;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff / 3600000) % 24);
        const minutes = Math.floor((diff / 60000) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        [
          ["cd-days", days],
          ["cd-hours", hours],
          ["cd-minutes", minutes],
          ["cd-seconds", seconds]
        ].forEach(([id, value]) => setText(id, pad(value)));

        return true;
      };

      if (localStorage.getItem(ceremonyKey) === "true") {
        if (grid) grid.style.display = "none";
        if (reveal) reveal.style.display = "block";
        hasRevealed = true;
      }

      if (update()) {
        window.setInterval(update, 1000);
      }
    }
  };
})();
