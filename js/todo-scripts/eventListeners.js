taskTagsInput.addEventListener("input", () => {
  const tags = taskTagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== ""); // إزالة القيم الفارغة

  taskTagsPreview.innerHTML = tags
    .map(
      (tag) =>
        `<span class="px-2 py-1 bg-blue-500 text-white rounded text-xs">${tag}</span>`
    )
    .join("");
});
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault(); //  منع الإغلاق الافتراضي
  await saveTask(); //  فقط حفظ المهمة، دون إغلاق المودال عند الخطأ
});
newTaskBtn.addEventListener("click", () => {
  taskIdInput.value = "";
  taskForm.reset();
  modalTitle.textContent = "Add New Task";
  taskModal.classList.remove("hidden");

  // إضافة الكلاس لتفعيل الأنيميشن
  setTimeout(() => {
    taskModal.classList.add("show");
  }, 10);
});
cancelBtn.addEventListener("click", closeModal);
searchInput.addEventListener(
  "input",
  debounce(() => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter((task) =>
      task.name.toLowerCase().includes(searchTerm)
    );
    renderFilteredTasks(filteredTasks);
  })
);

filterAndSort.addEventListener("change", () => {
  const value = filterAndSort.value;
  let filteredAndSortedTasks = [...tasks]; // نسخة من المهام الأصلية

  // تطبيق الفلترة
  if (value === "completed" || value === "pending" || value === "overdue") {
    filteredAndSortedTasks = tasks.filter((task) => {
      const currentDate = new Date();
      const dueDate = new Date(task.dueDate);

      if (value === "completed") {
        return task.completed;
      } else if (value === "pending") {
        return !task.completed && dueDate > currentDate;
      } else if (value === "overdue") {
        return !task.completed && dueDate < currentDate;
      }
      return true;
    });
  }

  // تطبيق الترتيب
  if (value === "newest" || value === "oldest") {
    filteredAndSortedTasks.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);

      if (value === "oldest") {
        return dateA - dateB; // من الأقدم إلى الأحدث
      } else {
        return dateB - dateA; // من الأحدث إلى الأقدم
      }
    });
  }

  // عرض المهام المفلترة والمرتبة
  renderFilteredTasks(filteredAndSortedTasks);
});
document.addEventListener("DOMContentLoaded", fetchTasks);
