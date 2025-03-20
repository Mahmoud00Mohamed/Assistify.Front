document.addEventListener("DOMContentLoaded", async function () {
  showSpinner(); // 🌀 إظهار السبينر عند بدء التحميل

  try {
    const cachedProjects = localStorage.getItem("projects");

    if (cachedProjects) {
      projects = JSON.parse(cachedProjects);
      renderProjects();
    } else {
      const response = await fetchWithAuth(`${apiBaseUrl}/projects`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      projects = await response.json();
      localStorage.setItem("projects", JSON.stringify(projects)); // حفظ البيانات

      projects.forEach((project) => updateProjectStatus(project.id));
      renderProjects();
    }
  } catch (error) {
  } finally {
    hideSpinner(); //  إخفاء السبينر بعد انتهاء التحميل
  }
});
function showSpinner() {
  document.getElementById("loading-spinner").classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("loading-spinner").classList.add("hidden");
}

let projects = [];
let tasks = [];

const projectList = document.getElementById("project-list");
const projectModal = document.getElementById("project-modal");
const taskModal = document.getElementById("task-modal");
const projectForm = document.getElementById("project-form");
const taskForm = document.getElementById("task-form");
const newProjectBtn = document.getElementById("new-project-btn");
const cancelBtn = document.getElementById("cancel-btn");
const taskCancelBtn = document.getElementById("task-cancel-btn");
const body = document.body;
const searchInput = document.getElementById("search-input");
const filterImportance = document.getElementById("filter-importance");

function updateProjectStatus(projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project || !project.tasks || project.tasks.length === 0) {
    project.status = "not-started";
    return;
  }

  const now = new Date();
  const completedTasks = project.tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = project.tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const overdueTasks = project.tasks.filter(
    (task) => task.status === "overdue"
  ).length;
  const pendingTasks = project.tasks.filter(
    (task) => task.status === "pending"
  ).length;
  const cancelledTasks = project.tasks.filter(
    (task) => task.status === "cancelled"
  ).length;
  const notStartedTasks = project.tasks.filter(
    (task) => task.status === "not-started"
  ).length;

  const totalTasks = project.tasks.length;

  // الحالة عندما كل المهام مكتملة
  if (completedTasks === totalTasks) {
    project.status = "completed";
  }
  // الحالة عندما كل المهام ملغية
  else if (cancelledTasks === totalTasks) {
    project.status = "cancelled";
  }
  // الحالة عندما كل المهام لم تبدأ
  else if (notStartedTasks === totalTasks) {
    project.status = "not-started";
  }
  // الحالة عندما كل المهام قيد الانتظار
  else if (pendingTasks === totalTasks) {
    project.status = "pending";
  }
  // الحالة عندما توجد مهام متأخرة ولم تنجز كلها
  else if (overdueTasks > 0 && completedTasks < totalTasks) {
    project.status = "overdue";
  }
  // الحالة عندما توجد مهام قيد التنفيذ
  else if (inProgressTasks > 0) {
    project.status = "in-progress";
  }
  // الحالة عندما بعض المهام مكتملة وبعضها لم تبدأ
  else if (completedTasks > 0 && completedTasks < totalTasks) {
    project.status = "partially-completed";
  }
  // الحالة عندما يوجد تاريخ انتهاء والمشروع لم يكتمل
  else if (
    project.endDate &&
    new Date(project.endDate) < now &&
    completedTasks < totalTasks
  ) {
    project.status = "overdue";
  }
  // لو ما في أي حالة مطابقة
  else {
    project.status = "on-hold";
  }
}
newProjectBtn.addEventListener("click", () => {
  projectModal.classList.remove("hidden");
  projectModal.classList.add("flex");

  setTimeout(() => {
    projectModal.classList.add("show"); // إضافة التأثير التدريجي
  }, 50); // تأخير بسيط لجعل التحول سلسًا

  projectForm.reset();
  document.getElementById("project-id").value = "";
  document.getElementById("modal-title").textContent = "Add New Project";
});

cancelBtn.addEventListener("click", () => {
  projectModal.classList.remove("show"); // إزالة التأثير التدريجي

  setTimeout(() => {
    projectModal.classList.add("hidden");
    projectModal.classList.remove("flex");
  }, 300); // انتظار انتهاء التأثير قبل الإخفاء الفعلي
});

taskCancelBtn.addEventListener("click", () => {
  taskModal.classList.remove("show"); // إزالة التأثير التدريجي

  setTimeout(() => {
    taskModal.classList.add("hidden");
    taskModal.classList.remove("flex");
  }, 300); // انتظار انتهاء التأثير قبل الإخفاء الفعلي
});

projectForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveButton = e.target.querySelector('button[type="submit"]');
  const originalButtonText = saveButton.innerHTML;
  saveButton.innerHTML = `
      Saving <i class="fa-solid fa-spinner fa-spin-pulse"></i>
  `;
  saveButton.disabled = true;

  const projectId = document.getElementById("project-id").value;
  const name = document.getElementById("project-name").value.trim();
  const description = document
    .getElementById("project-description")
    .value.trim();
  const startDate = document.getElementById("project-start-date").value;
  const endDate = document.getElementById("project-end-date").value;
  const status = document.getElementById("project-status").value;

  if (!name) {
    showErrorAlert("You must enter the project name.");
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  if (description.length < 10 || description.length > 5000) {
    showErrorAlert(
      "The project description must be between 10 and 5000 characters."
    );
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  if (!projectId && startDate < today) {
    const confirmPastDate = await showAlertConfirm({
      title: " Start Date in the Past!",
      text: "Do you want to proceed even though the project start date is in the past?",
      icon: "warning",
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#38bdf8",
    });

    if (!confirmPastDate) {
      saveButton.innerHTML = originalButtonText;
      saveButton.disabled = false;
      return;
    }
  }

  if (new Date(endDate) < new Date(startDate)) {
    showErrorAlert(
      "The project end date must be after or equal to the start date."
    );
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  if (!status) {
    showErrorAlert("You must select the project status.");
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  const projectData = { name, description, startDate, endDate, status };

  try {
    const response = await fetchWithAuth(
      `${apiBaseUrl}/projects${projectId ? `/${projectId}` : ""}`,
      {
        method: projectId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(projectData),
      }
    );

    if (!response.ok) throw new Error("Failed to save project");

    const updatedProject = await response.json();

    if (projectId) {
      const index = projects.findIndex((p) => p.id === projectId);
      projects[index] = updatedProject;
    } else {
      projects.push(updatedProject);
    }

    localStorage.setItem("projects", JSON.stringify(projects)); // تحديث localStorage
    renderProjects();
    projectModal.classList.add("hidden");
    showAlert("The project has been saved successfully!", "success");
  } catch (error) {
    showAlert("An error occurred while saving the project.", "error");
  } finally {
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
  }
});
// مستمع لحقل البحث
searchInput.addEventListener("input", () => {
  renderProjects();
});

// مستمع لقائمة التصفية
filterImportance.addEventListener("change", () => {
  renderProjects();
});
function renderProjects() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterStatus = filterImportance.value;

  let filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm);
    const isSortingFilter =
      filterStatus === "newest" || filterStatus === "oldest";
    const matchesStatus =
      filterStatus === "all" ||
      isSortingFilter ||
      project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // **ترتيب المشاريع حسب التاريخ إذا كان الفلتر هو newest أو oldest**
  if (filterStatus === "newest") {
    filteredProjects.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    ); // الأحدث أولًا
  } else if (filterStatus === "oldest") {
    filteredProjects.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    ); // الأقدم أولًا
  }

  // التحقق من وجود مشاريع وعرض/إخفاء قسم "no-tasks"
  const noTasksDiv = document.getElementById("no-tasks");
  if (filteredProjects.length === 0) {
    noTasksDiv.classList.remove("hidden");
    setTimeout(() => noTasksDiv.classList.add("show"), 50); // إضافة تأثير الظهور
  } else {
    noTasksDiv.classList.remove("show");
    setTimeout(() => noTasksDiv.classList.add("hidden"), 300); // إخفاء بعد انتهاء التأثير
  }

  projectList.innerHTML = filteredProjects
    .map(
      (project) => `
 <div class="project-card p-3 sm:p-5 rounded-[15px] sm:rounded-[25px] bg-gradient-to-br from-gray-900 to-gray-800 shadow-md border border-gray-700 hover:shadow-blue-500/20 transition-all">

 <!-- Header -->
 <div class="flex justify-between items-center mb-3 sm:mb-5">
  <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center">
    <i class="fas fa-folder-open text-blue-400 mr-2 sm:mr-3"></i>
 ${sanitizeHTML(project.name)}
  </h2>
  <div class="flex space-x-2 sm:space-x-3">
    <button onclick="editProject('${project.id}')" 
      class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-yellow-500/10 text-yellow-300 rounded-full hover:bg-yellow-400 hover:text-gray-900 shadow hover:shadow-yellow-400/30 transition-all">
      <i class="fas fa-pen text-sm sm:text-base"></i>
    </button>
    <button onclick="deleteProject('${project.id}')" 
      class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500/10 text-red-300 rounded-full hover:bg-red-400 hover:text-gray-900 shadow hover:shadow-red-400/30 transition-all">
      <i class="fas fa-trash text-sm sm:text-base"></i>
    </button>
  </div>
 </div>

 <!-- Project Description -->
 <div class="text-gray-300 mb-3 sm:mb-5 text-sm sm:text-base leading-relaxed">
  <h3 class="text-lg sm:text-xl font-semibold text-gray-200 mb-2 sm:mb-3">
    <i class="fas fa-info-circle text-green-400 mr-2"></i>
    Project Description
  </h3>

  <div id="desc-container-${
    project.id
  }" class="overflow-hidden max-h-[4.5em] transition-all duration-500 ease-in-out">
    <pre id="desc-${project.id}" 
         class="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
 ${sanitizeHTML(project.description)}
    </pre>
  </div>

  <!-- زر Show More (إخفاؤه إذا كان النص قصيرًا) -->
  ${
    project.description.length > 100
      ? `<button id="toggle-desc-${project.id}" 
          class="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center transition-all"
          onclick="toggleDescription('${project.id}')">
          Show More <i class="fas fa-chevron-down ml-2 transition-transform"></i>
        </button>`
      : ""
  }
 </div>



 <!-- Project Status -->
 <div class="mb-3 sm:mb-5">
  <h3 class="text-lg sm:text-xl font-semibold text-gray-200 mb-2 sm:mb-3">
    <i class="fas fa-flag text-purple-400 mr-2"></i>
    Project Status
  </h3>
  <div class="flex items-center space-x-2 sm:space-x-3">
    <span class="w-2 h-2 sm:w-3 sm:h-3 ${getStatusClass(
      project.status
    )} rounded-full"></span>
    <span class="${getStatusClass(
      project.status
    )} px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold bg-gray-800 text-white">
      <i class="fas fa-circle mr-1"></i>${project.status || "Not Set"}
    </span>
  </div>
 </div>

 <!-- Timeline Section (Vertical & Enhanced) -->
 <div class="mb-6 sm:mb-8">
  <!-- Section Title -->
  <h3 class="text-xl sm:text-2xl font-bold text-gray-100 flex items-center mb-4 sm:mb-6">
    <i class="fas fa-calendar-alt text-yellow-400 mr-2 sm:mr-3 text-base sm:text-lg"></i>
    Project Timeline
  </h3>

  <!-- Timeline Container -->
  <div class="relative">
    <!-- Vertical Line -->
    <div class="absolute w-1 bg-gradient-to-b from-green-500 to-red-500 h-full left-4 sm:left-6 transform -translate-x-1/2 rounded-full"></div>

    <!-- Timeline Items -->
    <div class="space-y-4 sm:space-y-6 relative">
      <!-- Start Date -->
      <div class="flex items-start">
        <div class="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full shadow-md z-10 mt-1 sm:mt-1.5"></div>
        <div class="ml-4 sm:ml-6">
          <span class="block text-xs sm:text-sm font-medium text-green-300">
            <i class="fas fa-play-circle mr-2"></i> ${formatDate(
              project.startDate
            )}
          </span>
          <p class="text-xs text-gray-400 mt-1">Project Kickoff</p>
        </div>
      </div>

      <!-- End Date -->
      <div class="flex items-start">
        <div class="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-md z-10 mt-1 sm:mt-1.5"></div>
        <div class="ml-4 sm:ml-6">
          <span class="block text-xs sm:text-sm font-medium text-red-300">
            <i class="fas fa-stop-circle mr-2"></i> ${formatDate(
              project.endDate
            )}
          </span>
          <p class="text-xs text-gray-400 mt-1">Project Completion</p>
        </div>
      </div>
    </div>
  </div>
 </div>

 <!-- Add Task Button -->
 <div class="flex justify-end">
  <button onclick="openTaskModal('${project.id}')" 
    class="flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-500 text-white text-sm sm:text-base font-medium rounded-full hover:bg-green-400 shadow hover:shadow-green-400/30 transition-all">
    <i class="fas fa-plus"></i>
    <span>Add Task</span>
  </button>
 </div>

 <!-- Task List -->
 <div class="mt-4 sm:mt-6">
  <h3 class="text-lg sm:text-xl font-semibold text-gray-200 mb-3 sm:mb-4">
    <i class="fas fa-tasks text-purple-400 mr-2"></i>
    Tasks
  </h3>
 <div id="tasks-${
   project.id
 }" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
    ${
      project.tasks.length > 0
        ? project.tasks
            .map(
              (task) => `
    <div class="p-3 sm:p-4 bg-gray-800 rounded-[15px] sm:rounded-[20px] shadow-md border border-gray-700 hover:border-gray-500 hover:shadow-gray-500/20 transition-all">
      <div class="flex justify-between items-start mb-2 sm:mb-3">
        <h3 class="text-sm sm:text-base font-bold text-gray-100">${sanitizeHTML(
          task.name
        )}
 </h3>
        <div class="flex space-x-2">
          <button onclick="editTask('${project.id}', '${task.id}')" 
            class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-yellow-500/10 text-yellow-300 rounded-full hover:bg-yellow-400 hover:text-gray-900 shadow hover:shadow-yellow-400/30 transition-all">
            <i class="fas fa-pen text-xs sm:text-sm"></i>
          </button>
          <button onclick="deleteTask('${project.id}', '${task.id}')" 
            class="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-red-500/10 text-red-300 rounded-full hover:bg-red-400 hover:text-gray-900 shadow hover:shadow-red-400/30 transition-all">
            <i class="fas fa-trash text-xs sm:text-sm"></i>
          </button>
        </div>
      </div>
 <div class="text-gray-300 text-xs sm:text-sm leading-relaxed">
  <div id="task-desc-container-${
    task.id
  }" class="overflow-hidden max-h-[3em] transition-all duration-500 ease-in-out">
    <pre id="task-desc-${task.id}" 
         class="whitespace-pre-wrap text-gray-300 font-mono bg-gray-800 p-2 rounded-md">
 ${sanitizeHTML(task.description)}
    </pre>
  </div>

  <!-- زر Show More (إخفاؤه إذا كان النص قصيرًا) -->
  ${
    task.description.length > 100
      ? `<button id="toggle-task-desc-${task.id}" 
          class="mt-1 text-blue-400 hover:text-blue-600 text-xs font-medium flex items-center transition-all"
          onclick="toggleTaskDescription('${task.id}')">
          Show More <i class="fas fa-chevron-down ml-1 transition-transform"></i>
        </button>`
      : ""
  }
 </div>


      <div class="flex justify-between text-xs sm:text-sm text-gray-400">
        <div class="flex items-center">
          <i class="fas fa-user text-yellow-300 mr-2"></i>
          <span>${task.assigned}</span>
        </div>
        <div class="flex items-center">
          <i class="fas fa-calendar-day text-pink-400 mr-2"></i>
          <span>${formatDate(task.endDate)}</span>
        </div>
      </div>
      <div class="mt-2 sm:mt-3">
        <span class="${getStatusClass(
          task.status
        )} px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold bg-gray-800 text-white">
          <i class="fas fa-circle mr-1"></i>${task.status}
        </span>
      </div>
    </div>
    `
            )
            .join("")
        : `<p class="text-gray-400 text-sm sm:text-base"><i class="fas fa-exclamation-circle mr-2"></i>No tasks yet. Click "Add Task" to start!</p>`
    }
  </div>
 </div>

 </div>
 `
    )
    .join("");

  // Helper functions
  function getStatusClass(status) {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 text-green-200";
      case "in-progress":
        return "bg-blue-500 text-blue-200";
      case "pending":
        return "bg-yellow-500 text-yellow-200";
      case "cancelled":
        return "bg-red-500 text-red-200";
      case "on-hold":
        return "bg-purple-500 text-purple-200";
      case "overdue":
        return "bg-orange-500 text-orange-200";
      case "not-started":
        return "bg-gray-500 text-gray-200";
      default:
        return "bg-gray-500 text-gray-200";
    }
  }

  const draggables = document.querySelectorAll(".draggable");
  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });
  });

  const containers = document.querySelectorAll("#project-list > div");
  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}

function toggleTaskDescription(taskId) {
  const container = document.getElementById(`task-desc-container-${taskId}`);
  const toggleBtn = document.getElementById(`toggle-task-desc-${taskId}`);

  if (container.classList.contains("desc-expanded")) {
    container.style.maxHeight = "3em"; // تقليل الارتفاع
    setTimeout(() => {
      container.classList.remove("desc-expanded");
      toggleBtn.innerHTML = `Show More <i class="fas fa-chevron-down ml-1"></i>`;
    }, 400);
  } else {
    container.classList.add("desc-expanded");
    container.style.maxHeight = container.scrollHeight + "px"; // توسيع الوصف
    toggleBtn.innerHTML = `Show Less <i class="fas fa-chevron-up ml-1"></i>`;
  }
}

function toggleDescription(projectId) {
  const container = document.getElementById(`desc-container-${projectId}`);
  const toggleBtn = document.getElementById(`toggle-desc-${projectId}`);
  const icon = toggleBtn.querySelector("i");

  if (container.classList.contains("desc-expanded")) {
    container.style.maxHeight = "4.5em"; // إغلاق بسلاسة
    setTimeout(() => {
      container.classList.remove("desc-expanded");
      container.classList.add("desc-collapsed");
      toggleBtn.innerHTML = `Show More <i class="fas fa-chevron-down ml-2"></i>`;
    }, 400);
  } else {
    container.classList.remove("desc-collapsed");
    container.classList.add("desc-expanded");
    container.style.maxHeight = container.scrollHeight + "px"; // فتح بسلاسة
    toggleBtn.innerHTML = `Show Less <i class="fas fa-chevron-up ml-2"></i>`;
  }
}
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDateForInput(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function formatDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function openTaskModal(projectId) {
  taskModal.classList.remove("hidden");
  taskModal.classList.add("flex");

  setTimeout(() => {
    taskModal.classList.add("show"); // إضافة التأثير التدريجي
  }, 50); // تأخير بسيط لضمان السلاسة

  taskForm.reset();
  document.getElementById("task-id").value = "";
  document.getElementById("task-modal-title").textContent = "Add New Task";
  taskForm.dataset.projectId = projectId;

  const project = projects.find((p) => p.id === projectId);
  if (project && project.startDate) {
    document.getElementById("task-start-date").value = formatDateForInput(
      project.startDate
    );
  }
}
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveButton = e.target.querySelector('button[type="submit"]');
  const originalButtonText = saveButton.innerHTML;
  saveButton.innerHTML = `
      Saving <i class="fa-solid fa-spinner fa-spin-pulse"></i>
  `;
  saveButton.disabled = true;

  const taskId = document.getElementById("task-id").value;
  const projectId = taskForm.dataset.projectId;
  const taskName = document.getElementById("task-name").value.trim();
  const taskDescription = document
    .getElementById("task-description")
    .value.trim();
  const taskAssigned = document.getElementById("task-assigned").value.trim();
  const taskStartDate = document.getElementById("task-start-date").value;
  const taskEndDate = document.getElementById("task-end-date").value;
  const taskStatus = document.getElementById("task-status").value;

  if (taskName.length < 3 || taskName.length > 100) {
    showErrorAlert("The task name must be between 3 and 100 characters.");
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  if (!taskAssigned) {
    showErrorAlert("You must assign a person responsible for the task.");
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  if (new Date(taskEndDate) < new Date(taskStartDate)) {
    showErrorAlert(
      "The task end date must be after or equal to the start date."
    );
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  const project = projects.find((p) => p.id === projectId);
  if (project) {
    if (new Date(taskStartDate) < new Date(project.startDate)) {
      showErrorAlert(
        "The task start date must be after or equal to the project start date."
      );
      saveButton.innerHTML = originalButtonText;
      saveButton.disabled = false;
      return;
    }

    if (new Date(taskEndDate) > new Date(project.endDate)) {
      showErrorAlert(
        "The task end date must be before or equal to the project end date."
      );
      saveButton.innerHTML = originalButtonText;
      saveButton.disabled = false;
      return;
    }
  }

  if (!taskId && taskStatus === "completed") {
    showErrorAlert("The task cannot be marked as complete when first created.");
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
    return;
  }

  const taskData = {
    name: taskName,
    description: taskDescription,
    assigned: taskAssigned,
    startDate: taskStartDate,
    endDate: taskEndDate,
    status: taskStatus,
  };

  try {
    const response = await fetchWithAuth(
      `${apiBaseUrl}/projects/${projectId}/tasks${taskId ? `/${taskId}` : ""}`,
      {
        method: taskId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(taskData),
      }
    );

    if (!response.ok) throw new Error("Failed to save task");

    const updatedTask = await response.json();
    const project = projects.find((p) => p.id === projectId);

    if (project) {
      if (taskId) {
        const index = project.tasks.findIndex((t) => t.id === taskId);
        project.tasks[index] = updatedTask;
      } else {
        project.tasks.push(updatedTask);
      }
      updateProjectStatus(projectId);
    }

    localStorage.setItem("projects", JSON.stringify(projects)); // تحديث localStorage
    renderProjects();
    taskModal.classList.add("hidden");
    showAlert("The task has been saved successfully!", "success");
  } catch (error) {
    showAlert("An error occurred while saving the task.", "error");
  } finally {
    saveButton.innerHTML = originalButtonText;
    saveButton.disabled = false;
  }
});

function editProject(projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  document.getElementById("project-id").value = project.id;
  document.getElementById("project-name").value = project.name;
  document.getElementById("project-description").value = project.description;
  document.getElementById("project-start-date").value = formatDateForInput(
    project.startDate
  );
  document.getElementById("project-end-date").value = formatDateForInput(
    project.endDate
  );
  document.getElementById("project-status").value = project.status;
  document.getElementById("modal-title").textContent = "Edit Project";

  projectModal.classList.remove("hidden");
  projectModal.classList.add("flex");

  // تأخير بسيط لضمان تأثير الفتح التدريجي
  setTimeout(() => {
    projectModal.classList.add("show");
  }, 50);
}
async function deleteProject(projectId) {
  const isConfirmed = await showAlertConfirm({
    title: "Are you sure?",
    text: "You won't be able to undo this!",
    icon: "warning",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (!isConfirmed) return;

  try {
    const response = await fetchWithAuth(
      `${apiBaseUrl}/projects/${projectId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to delete project");

    projects = projects.filter((p) => p.id !== projectId);
    localStorage.setItem("projects", JSON.stringify(projects)); // تحديث localStorage
    renderProjects();

    Swal.fire({
      title: "Deleted!",
      text: "The project has been deleted successfully.",
      icon: "success",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
        confirmButton: "custom-confirm-button",
      },
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "An error occurred while deleting the project.",
      icon: "error",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
        confirmButton: "custom-confirm-button",
      },
    });
  }
}

function editTask(projectId, taskId) {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const task = project.tasks.find((t) => t.id === taskId);
  if (!task) return;

  document.getElementById("task-id").value = task.id;
  document.getElementById("task-name").value = task.name;
  document.getElementById("task-description").value = task.description;
  document.getElementById("task-assigned").value = task.assigned;
  document.getElementById("task-start-date").value = formatDateForInput(
    task.startDate
  );
  document.getElementById("task-end-date").value = formatDateForInput(
    task.endDate
  );
  document.getElementById("task-status").value = task.status;
  document.getElementById("task-modal-title").textContent = "Edit Task";

  taskForm.dataset.projectId = projectId;
  taskModal.classList.remove("hidden");
  taskModal.classList.add("flex");

  // تأخير بسيط لضمان تأثير الفتح التدريجي
  setTimeout(() => {
    taskModal.classList.add("show");
  }, 50);
}

async function deleteTask(projectId, taskId) {
  const isConfirmed = await showAlertConfirm({
    title: "Are you sure?",
    text: "You won't be able to undo this!",
    icon: "warning",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (!isConfirmed) return;

  try {
    const response = await fetchWithAuth(
      `${apiBaseUrl}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to delete task");

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      project.tasks = project.tasks.filter((t) => t.id !== taskId);
      updateProjectStatus(projectId);
    }

    localStorage.setItem("projects", JSON.stringify(projects)); // تحديث localStorage
    renderProjects();

    Swal.fire({
      title: "Deleted!",
      text: "The task has been deleted successfully.",
      icon: "success",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
      },
    });
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "An error occurred while deleting the task.",
      icon: "error",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-alert-box",
        title: "custom-alert-title",
        htmlContainer: "custom-alert-text",
        confirmButton: "custom-confirm-button",
      },
    });
  }
}
function saveTasksToLocalStorage() {
  if (!Array.isArray(projects)) return; //  تأكد من أن `tasks` مصفوفة
  localStorage.setItem("projects", JSON.stringify(projects || []));
}
window.addEventListener("storage", function (event) {
  if (event.key === "projects") {
    const updatedTasks = JSON.parse(event.newValue || "[]");
    projects = updatedTasks;
    renderProjects(); // إعادة عرض المهام
  }
});
