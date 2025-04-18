gsap.registerPlugin(ScrollTrigger);

gsap.from("header h1", {
  opacity: 0,
  y: 30,
  duration: 1,
  ease: "power4.out",
});

gsap.from("header p", {
  opacity: 0,
  y: 20,
  duration: 1,
  delay: 0.2,
  ease: "power4.out",
});

gsap.from("header .btn-primary", {
  opacity: 0,
  scale: 0.95,
  duration: 1,
  delay: 0.4,
  ease: "power4.out",
});

gsap.from(".preview-container", {
  opacity: 0,
  y: 50,
  duration: 1.2,
  delay: 0.6,
  ease: "power4.out",
});

gsap.from(".preview-project", {
  opacity: 0,
  y: 20,
  duration: 0.8,
  stagger: 0.1,
  ease: "power4.out",
  scrollTrigger: { trigger: ".preview-container", start: "top 90%" },
});

gsap.from(".card-bg", {
  opacity: 0,
  y: 20,
  duration: 0.8,
  stagger: 0.15,
  ease: "power4.out",
  scrollTrigger: { trigger: ".card-bg", start: "top 85%" },
});
document.addEventListener("DOMContentLoaded", async () => {
  const lastPing = localStorage.getItem("lastPing");
  const now = Date.now();

  // إرسال الطلب فقط إذا لم يتم إرسال ping خلال الـ 5 دقائق الأخيرة
  if (!lastPing || now - parseInt(lastPing) > 5 * 60 * 1000) {
    try {
      const response = await fetch("https://api.assistify.site/api/auth/ping", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        localStorage.setItem("lastPing", now.toString());
      }
      // في حال فشل الطلب، لا نقوم بإظهار شيء في الواجهة
    } catch (error) {
      // نتجاهل الخطأ بصمت
    }
  }
});
