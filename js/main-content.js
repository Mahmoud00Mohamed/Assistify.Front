document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("loading");

  setTimeout(() => {
    document.body.classList.replace("loading", "loaded");

    setTimeout(() => {
      document.body.classList.remove("loaded");
      document.body.classList.add("ready"); // يضمن إزالة التأثير نهائيًا
    }, 1000);
  }, 100);
});
