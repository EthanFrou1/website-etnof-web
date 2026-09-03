const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const yearTarget = document.getElementById("current-year");
const revealItems = document.querySelectorAll("[data-reveal]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-track]");
  if (!target || typeof window.umami === "undefined") return;

  const eventName = target.getAttribute("data-track");
  const props = {};
  for (const attr of target.attributes) {
    if (attr.name.startsWith("data-track-")) {
      const key = attr.name.slice("data-track-".length).replace(/-/g, "_");
      props[key] = attr.value;
    }
  }

  window.umami.track(eventName, props);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
