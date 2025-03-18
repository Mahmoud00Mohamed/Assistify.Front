document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");

  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    menuToggle.classList.toggle("active"); // إضافة كلاس لتغيير اللون
  });

  document.addEventListener("click", function (event) {
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove("active");
      menuToggle.classList.remove("active"); // إزالة اللون عند إغلاق القائمة
    }
  });
});
