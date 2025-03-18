const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

gsap.registerPlugin(ScrollTrigger);

gsap.from("header h1", {
  opacity: 0,
  y: 50,
  duration: 1,
  scrollTrigger: {
    trigger: "header",
    start: "top 80%",
  },
});

gsap.from("header p", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 0.5,
  scrollTrigger: {
    trigger: "header",
    start: "top 80%",
  },
});

gsap.from("header a", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 1,
  scrollTrigger: {
    trigger: "header",
    start: "top 80%",
  },
});

gsap.from(".card", {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.3,
  scrollTrigger: {
    trigger: ".card",
    start: "top 80%",
  },
});

gsap.from("section h2", {
  opacity: 0,
  y: 50,
  duration: 1,
  scrollTrigger: {
    trigger: "section h2",
    start: "top 80%",
  },
});

gsap.from("section p", {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.3,
  scrollTrigger: {
    trigger: "section p",
    start: "top 80%",
  },
});

gsap.from("section a", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 0.5,
  scrollTrigger: {
    trigger: "section a",
    start: "top 80%",
  },
});
