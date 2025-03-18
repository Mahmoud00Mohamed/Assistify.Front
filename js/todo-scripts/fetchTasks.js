async function fetchTasks() {
  showSpinner(); // 🌀 إظهار السبينر قبل بدء الجلب

  const cachedTasks = localStorage.getItem("tasks");

  if (cachedTasks) {
    try {
      const parsedTasks = JSON.parse(cachedTasks);
      if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks;
        renderTasks();
        toggleLoadMoreButton();
        hideSpinner(); //  إخفاء السبينر بعد التحميل
        return;
      }
    } catch (error) {}
  }

  currentPage = 1;

  try {
    const response = await fetchWithAuth(
      `${apiBaseUrl}/tasks?page=${currentPage}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (response.ok) {
      const data = await response.json();
      tasks = data.tasks;
      totalPages = data.totalPages;

      saveTasksToLocalStorage();
      renderTasks();
      toggleLoadMoreButton();
    } else {
    }
  } catch (error) {
  } finally {
    hideSpinner(); //  إخفاء السبينر بعد انتهاء الجلب
  }
}
function showSpinner() {
  document.getElementById("loading-spinner").classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("loading-spinner").classList.add("hidden");
}

async function loadMoreTasks() {
  currentPage++;
  const response = await fetchWithAuth(
    `${apiBaseUrl}/tasks?page=${currentPage}&limit=${limit}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (response.ok) {
    const data = await response.json();
    tasks = [...tasks, ...data.tasks];

    saveTasksToLocalStorage(); // تحديث التخزين المحلي
    renderTasks();
    toggleLoadMoreButton();
  } else {
  }
}

function toggleLoadMoreButton() {
  const button = document.getElementById("load-more-btn");
  button.style.display = currentPage >= totalPages ? "none" : "block";
}

//  تحديث المهام تحديث المهام تحديث المهام تحديث المهام تحديث المهام
function saveTasksToLocalStorage() {
  if (!Array.isArray(tasks)) return; //  تأكد من أن `tasks` مصفوفة
  localStorage.setItem("tasks", JSON.stringify(tasks || []));
}
window.addEventListener("storage", function (event) {
  if (event.key === "tasks") {
    const updatedTasks = JSON.parse(event.newValue || "[]");
    tasks = updatedTasks;
    renderTasks(); // إعادة عرض المهام
  }
});
