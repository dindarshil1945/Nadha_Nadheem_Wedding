(function () {
  "use strict";

  const config = window.WEDDING_CONFIG;

  function setAll(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  }

  function applyConfigColors() {
    const root = document.documentElement;
    Object.entries(config.colors || {}).forEach(([key, value]) => root.style.setProperty("--" + key, value));
  }

  function getGuestGreeting() {
    const guest = new URLSearchParams(window.location.search).get("guest");
    return guest ? "Welcome " + guest.trim() + " & Family" : "";
  }

  function renderBaseContent() {
    const coupleShort = config.couple.bride + " & " + config.couple.groom;

    document.title = coupleShort + " | Wedding Invitation";
    setAll("[data-bride]", config.couple.bride);
    setAll("[data-groom]", config.couple.groom);
    setAll("[data-couple-short]", coupleShort);
    setAll("[data-wedding-date]", config.wedding.displayDate);
    setAll("[data-wedding-time]", config.wedding.displayTime);
    setAll("[data-wedding-city]", config.wedding.city);
    setAll("[data-welcome-line]", config.couple.welcomeLine);
    setAll("[data-couple-quote]", config.couple.quote);
    setAll("[data-story-title]", config.couple.storyTitle);
    setAll("[data-story-subtitle]", config.couple.storySubtitle);
    setAll("[data-credit-name]", config.contact.creditName);

    const greeting = document.getElementById("guestGreeting");
    if (greeting) greeting.textContent = getGuestGreeting();
    const subGreeting = document.getElementById("guestSubGreeting");
    if (subGreeting) subGreeting.textContent = getGuestGreeting() ? "We reserved a special place for you." : "";

    const storyImage = document.getElementById("storyImage");
    if (storyImage) storyImage.src = config.couple.storyImage;

    const storyText = document.getElementById("storyText");
    if (storyText) storyText.innerHTML = config.couple.story.map((text) => "<p>" + text + "</p>").join("");

    const music = document.getElementById("weddingMusic");
    if (music && config.music.enabled) music.src = config.music.src;
  }

  function renderEvents() {
    const grid = document.getElementById("eventsGrid");
    if (!grid) return;

    grid.innerHTML = config.venues.map((event, index) => `
      <div class="col-12 col-md-6 col-xl-4" data-aos="fade-up" data-aos-delay="${index * 90}">
        <article class="event-card">
          <iframe src="${event.embedUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="${event.title} map"></iframe>
          <div class="event-body">
            <h3>${event.title}</h3>
            <p>${event.date} · ${event.time}</p>
            <p>${event.name}<br>${event.address}</p>
            <a href="${event.mapUrl}" target="_blank" rel="noopener">View on Map</a>
          </div>
        </article>
      </div>
    `).join("");
  }

  function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const captions = ["First Glance", "Golden Hour", "Quiet Joy", "Sacred Promise", "Family Grace", "Forever Begins"];

    grid.innerHTML = config.gallery.map((src, index) => `
      <button class="gallery-item" type="button" data-src="${src}" data-caption="${captions[index] || "Memory"}" aria-label="Open gallery image ${index + 1}">
        <img src="${src}" alt="Wedding gallery moment ${index + 1}" loading="lazy">
        <span>${captions[index] || "Memory"}</span>
      </button>
    `).join("");
  }

  function renderFamilies() {
    const grid = document.getElementById("familiesGrid");
    const blessing = document.getElementById("familyBlessing");
    if (!grid) return;

    const families = [config.families.bride, config.families.groom];
    grid.innerHTML = families.map((family) => `
      <article class="family-card" data-aos="fade-up">
        <h3>${family.label}</h3>
        <span class="family-divider"></span>
        <p class="family-support">With love and blessings</p>
        <p><strong>${family.parents[0]}</strong><br>&<br><strong>${family.parents[1]}</strong></p>
      </article>
    `).join("");

    if (blessing) blessing.textContent = config.families.blessing;
  }

  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const image = document.getElementById("lightboxImg");
    const close = document.getElementById("lightboxClose");
    if (!lightbox || !image) return;
    let activeIndex = 0;
    let touchStartX = 0;

    const items = () => Array.from(document.querySelectorAll(".gallery-item"));
    const showAt = (index) => {
      const galleryItems = items();
      if (!galleryItems.length) return;
      activeIndex = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[activeIndex];
      image.src = item.dataset.src;
      image.alt = item.dataset.caption || "Wedding gallery image";
      if (window.gsap) {
        gsap.fromTo(image, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" });
      }
    };

    document.getElementById("galleryGrid")?.addEventListener("click", (event) => {
      const item = event.target.closest(".gallery-item");
      if (!item) return;
      activeIndex = items().indexOf(item);
      showAt(activeIndex);
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-active");
    });

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("lightbox-active");
      image.src = "";
    };

    lightbox.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (event) => {
      const diff = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) < 48) return;
      showAt(activeIndex + (diff < 0 ? 1 : -1));
    }, { passive: true });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    close?.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
      if (lightbox.classList.contains("is-open") && event.key === "ArrowRight") showAt(activeIndex + 1);
      if (lightbox.classList.contains("is-open") && event.key === "ArrowLeft") showAt(activeIndex - 1);
    });
  }

  function initMusic() {
    const button = document.getElementById("musicToggle");
    const floating = document.getElementById("floatingMusicToggle");
    const audio = document.getElementById("weddingMusic");
    if (!button || !audio || !config.music.enabled) return;

    audio.volume = 0;
    let audioContext;
    const desiredVolume = 0.72;

    const setActive = (active) => {
      button.textContent = active ? "Pause Music" : "Play Music";
      floating?.classList.toggle("is-muted", !active);
      floating?.setAttribute("aria-pressed", String(active));
    };

    const fadeTo = (volume, onComplete) => {
      if (!window.gsap) {
        audio.volume = volume;
        onComplete?.();
        return;
      }

      gsap.to(audio, {
        volume,
        duration: (config.music.fadeMs || 1400) / 1000,
        ease: "power2.out",
        onComplete
      });
    };

    const getAudioContext = () => {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      return audioContext;
    };

    const playTone = (frequency, duration, type) => {
      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration + 0.02);
      } catch (error) {
        // Audio accents are enhancement-only.
      }
    };

    window.WeddingAudio = {
      async startAfterIntro() {
        floating?.classList.add("is-visible");
        try {
          await audio.play();
          fadeTo(desiredVolume);
          setActive(true);
        } catch (error) {
          setActive(false);
        }
      },
      playPaper() {
        playTone(520, 0.08, "triangle");
        window.setTimeout(() => playTone(240, 0.12, "sine"), 70);
      },
      playChime() {
        playTone(660, 0.5, "sine");
        window.setTimeout(() => playTone(880, 0.7, "triangle"), 140);
      },
      toggle() {
        if (audio.paused || audio.volume === 0) {
          audio.play().then(() => {
            fadeTo(desiredVolume);
            setActive(true);
          }).catch(() => setActive(false));
        } else {
          fadeTo(0, () => audio.pause());
          setActive(false);
        }
      }
    };

    button.addEventListener("click", () => window.WeddingAudio.toggle());
    floating?.addEventListener("click", () => window.WeddingAudio.toggle());
    setActive(false);
  }

  function initIntro() {
    document.body.classList.add("intro-active");
    document.getElementById("openInvite")?.addEventListener("click", () => {
      window.WeddingAnimations.openInvitation();
    }, { once: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyConfigColors();
    renderBaseContent();
    renderEvents();
    renderGallery();
    renderFamilies();
    initLightbox();
    initMusic();
    window.WeddingWishes?.init(config);
    initIntro();

    window.WeddingCountdown.start(config);
    window.WeddingRSVP.init(config);
    window.WeddingAnimations.init(config);
  });
})();
