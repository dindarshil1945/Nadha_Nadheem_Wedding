(function () {
  "use strict";

  function initParticles(config) {
    if (!window.tsParticles) return;

    const heroParticleOptions = {
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { value: 42, density: { enable: true, area: 920 } },
        color: { value: [config.colors.champagne, config.colors.gold, "#ffffff"] },
        opacity: {
          value: { min: 0.08, max: 0.34 },
          animation: { enable: true, speed: 0.18, minimumValue: 0.06, sync: false }
        },
        size: {
          value: { min: 0.8, max: 3.2 },
          animation: { enable: true, speed: 0.34, minimumValue: 0.7, sync: false }
        },
        links: {
          enable: true,
          distance: 96,
          color: config.colors.champagne,
          opacity: 0.055,
          width: 0.55
        },
        move: {
          enable: true,
          speed: { min: 0.035, max: 0.16 },
          direction: "top",
          drift: 0.12,
          random: true,
          straight: false,
          outModes: "out"
        },
        shape: { type: "circle" },
        twinkle: {
          particles: { enable: true, frequency: 0.08, opacity: 0.82 }
        }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: { repulse: { distance: 70, duration: 0.55 } }
      },
      detectRetina: true
    };

    const introParticleOptions = {
      ...heroParticleOptions,
      particles: {
        ...heroParticleOptions.particles,
        number: { value: 24 },
        links: { enable: false },
        move: { enable: true, speed: 0.08, direction: "top", drift: 0.08, random: true, outModes: "out" }
      }
    };

    tsParticles.load("heroParticles", heroParticleOptions);
    tsParticles.load("introParticles", introParticleOptions);
  }

  function initSmoothScroll() {
    if (!window.Lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.18,
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.05
    });

    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -12, duration: 1.35 });
      });
    });
  }

  window.WeddingAnimations = {
    init(config) {
      initParticles(config);

      if (window.AOS) {
        AOS.init({ duration: 900, once: true, offset: 80, easing: "ease-out-cubic" });
      }

      if (!window.gsap) return;
      gsap.registerPlugin(ScrollTrigger);
      initSmoothScroll();

      gsap.to(".site-loader", {
        autoAlpha: 0,
        duration: 0.55,
        delay: 0.2,
        onComplete: () => document.querySelector(".site-loader")?.remove()
      });

      gsap.from(".envelope", { y: 24, opacity: 0, duration: 1.45, ease: "power4.out" });
      gsap.from(".tap-copy", { opacity: 0, y: 12, duration: 1.1, delay: 0.55, ease: "power4.out" });

      gsap.utils.toArray(".parallax-card").forEach((card) => {
        gsap.to(card, {
          yPercent: -5,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.2 }
        });
      });

      gsap.utils.toArray(".gallery-item").forEach((item, index) => {
        gsap.from(item, {
          y: 64,
          rotate: index % 2 === 0 ? -1.8 : 1.8,
          opacity: 0,
          clipPath: "inset(18% 0 18% 0)",
          duration: 1,
          delay: index * 0.04,
          ease: "power4.out",
          scrollTrigger: { trigger: item, start: "top 88%" }
        });

        item.addEventListener("pointermove", (event) => {
          const rect = item.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(item, {
            rotateY: x * 7,
            rotateX: y * -7,
            y: -8,
            duration: 0.45,
            ease: "power2.out"
          });
        });

        item.addEventListener("pointerleave", () => {
          gsap.to(item, {
            rotateY: 0,
            rotateX: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.55)"
          });
        });
      });

      gsap.to(".hero-bg", {
        scale: 1,
        yPercent: 5,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.6 }
      });

      gsap.to(".hero-particles", {
        yPercent: -4,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 }
      });

      gsap.to(".hero-content", {
        yPercent: 1.5,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.8 }
      });
    },

    openInvitation() {
      if (!window.gsap) {
        document.body.classList.remove("intro-active");
        document.getElementById("envelopeIntro")?.remove();
        document.getElementById("mainSite")?.style.setProperty("visibility", "visible");
        document.getElementById("mainSite")?.style.setProperty("opacity", "1");
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          document.body.classList.remove("intro-active");
          document.getElementById("envelopeIntro")?.remove();
          ScrollTrigger.refresh();
        }
      });

      navigator.vibrate?.(18);
      window.WeddingAudio?.playPaper();
      window.WeddingAudio?.startAfterIntro();

      timeline
        .set(".envelope", { overflow: "visible" })
        .to(".wax-seal", { scale: 0, opacity: 0, duration: 0.48, ease: "back.in(1.4)" })
        .to(".envelope-flap", { rotateX: -182, duration: 1.18, ease: "power4.inOut" }, "+=0.08")
        .set(".envelope-flap", { zIndex: 1 })
        .set(".letter", { zIndex: 8 })
        .to(".envelope-front", { y: 10, duration: 0.78, ease: "power3.inOut" }, "+=0.06")
        .to(".letter", { y: -162, scale: 1.045, duration: 1.25, ease: "expo.out" }, "-=0.38")
        .to(".envelope", { y: 86, scale: 0.94, opacity: 0, duration: 0.95, ease: "power4.inOut" }, "+=0.16")
        .to("#envelopeIntro", { autoAlpha: 0, duration: 1.05, ease: "power3.inOut" }, "-=0.32")
        .set("#mainSite", { visibility: "visible" }, "-=0.72")
        .to("#mainSite", { opacity: 1, duration: 1.35, ease: "power3.out" }, "-=0.62")
        .from(".hero-monogram, .hero-eyebrow, .guest-greeting, .hero-names span, .hero-names i, .ornament, .hero-date, .hero-quote, .countdown-mini, .hero-actions, .scroll-cue", {
          y: 28,
          opacity: 0,
          filter: "blur(8px)",
          duration: 1.05,
          stagger: 0.075,
          ease: "power4.out"
        }, "-=0.45");
    }
  };
})();
