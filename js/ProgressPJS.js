document.addEventListener("DOMContentLoaded", function () {
  const projects = loadProjects();
  if (!projects.length) return;

  const taskStats = calculateTaskStats(projects);
  updateDashboard(projects, taskStats);
  renderProjectsAccordion(projects);
});

/* ------------------------- Data Loading & Parsing ------------------------ */

function loadProjects() {
  const cachedProjects = localStorage.getItem("projects");
  const projects = cachedProjects ? JSON.parse(cachedProjects) : [];
  return projects; // يجب إرجاع المشاريع دائمًا
}

function calculateTaskStats(projects) {
  return projects.reduce((stats, project) => {
    project.tasks.forEach((task) => {
      if (stats.hasOwnProperty(task.status)) {
        stats[task.status]++;
      }
    });
    return stats;
  }, initializeTaskStats());
}

function initializeTaskStats() {
  return {
    completed: 0,
    "in-progress": 0,
    overdue: 0,
    pending: 0,
    "on-hold": 0,
    cancelled: 0,
    "not-started": 0,
  };
}

/* -------------------------- UI Updates & Rendering ----------------------- */

function updateDashboard(projects, taskStats) {
  updateElementText("total-projects", projects.length);
  updateElementText("completed-tasks", taskStats.completed);
  updateElementText("overdue-tasks", taskStats.overdue);

  renderProgressChart(projects);
  renderTaskStatusChart(taskStats);
}

function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = text;
}

function renderProjectsAccordion(projects) {
  const projectsAccordion = document.getElementById("projects-accordion");
  projectsAccordion.innerHTML = ""; // Clear existing content

  projects.forEach((project) => {
    const projectItem = createProjectAccordionItem(project);
    projectsAccordion.appendChild(projectItem);
  });
}

function createProjectAccordionItem(project) {
  const { name, tasks } = project;
  const progressPercentage = calculateProgress(tasks);

  const projectItem = document.createElement("div");
  projectItem.className = "mb-4";

  projectItem.innerHTML = `
    <div class="accordion-header p-4 bg-gray-700 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition-colors duration-200">
      <div class="flex items-center gap-4">
        <h4 class="text-lg font-bold">${name}</h4>
        <span class="text-sm bg-gray-800 px-2 py-1 rounded">${progressPercentage}%</span>
      </div>
      <i class="fas fa-chevron-down transition-transform duration-300"></i>
    </div>
    <div class="accordion-content bg-gray-700 mt-2 rounded-lg max-h-0 overflow-hidden transition-all duration-300">
      <div class="p-4">
        ${renderProgressBar(progressPercentage)}
        ${generateTasksTable(tasks)}
      </div>
    </div>
  `;

  setupAccordionToggle(projectItem);
  return projectItem;
}

function setupAccordionToggle(projectItem) {
  const header = projectItem.querySelector(".accordion-header");
  const content = projectItem.querySelector(".accordion-content");

  header.addEventListener("click", () => {
    content.classList.toggle("open");
    content.style.maxHeight = content.classList.contains("open")
      ? `${content.scrollHeight}px`
      : "0";
    header.querySelector("i").classList.toggle("rotate-180");
  });
}

function calculateProgress(tasks) {
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  return tasks.length > 0
    ? ((completedCount / tasks.length) * 100).toFixed(2)
    : 0;
}

function renderProgressBar(percentage) {
  return `
    <div class="mb-4">
      <div class="flex justify-between mb-2">
        <span class="text-sm">Progress</span>
        <span class="text-sm">${percentage}%</span>
      </div>
      <div class="w-full bg-gray-800 rounded-full h-3">
        <div class="bg-green-500 h-3 rounded-full" style="width: ${percentage}%;"></div>
      </div>
    </div>
  `;
}

/* ------------------------------- Task Table ------------------------------ */

function generateTasksTable(tasks) {
  if (!tasks.length) {
    return `<p class="p-4 text-gray-300">No tasks in this project.</p>`;
  }

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <thead class="bg-gray-800 text-gray-300">
          <tr>${generateTaskTableHeaders()}</tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          ${tasks.map(generateTaskRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function generateTaskTableHeaders() {
  const headers = [
    "Task Name",
    "Assigned To",
    "Start Date",
    "End Date",
    "Status",
  ];
  return headers
    .map(
      (header) =>
        `<th class="px-6 py-4 text-left text-sm font-semibold uppercase">${header}</th>`
    )
    .join("");
}

function generateTaskRow(task) {
  return `
    <tr class="hover:bg-gray-800 transition duration-150 ease-in-out">
      <td class="px-6 py-4 text-sm text-gray-100">${task.name || "—"}</td>
      <td class="px-6 py-4 text-sm text-gray-300">${
        task.assigned || "Unassigned"
      }</td>
      <td class="px-6 py-4 text-sm text-gray-300">${formatDate(
        task.startDate
      )}</td>
      <td class="px-6 py-4 text-sm text-gray-300">${formatDate(
        task.endDate
      )}</td>
      <td class="px-6 py-4 text-sm font-semibold ${getStatusClass(
        task.status
      )}">
        ${getStatusText(task.status)} ${getStatusIcon(task.status)}
      </td>
    </tr>
  `;
}

/* ------------------------------ Helpers ------------------------------ */

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusClass(status) {
  return (
    {
      pending: "text-yellow-400",
      "in-progress": "text-blue-400",
      completed: "text-green-400",
      overdue: "text-red-400",
      "on-hold": "text-purple-400",
      cancelled: "text-gray-400",
      "not-started": "text-orange-400",
    }[status] || "text-gray-300"
  );
}

function getStatusText(status) {
  return (
    status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Unknown"
  );
}

function getStatusIcon(status) {
  const icons = {
    pending: "hourglass-half",
    "in-progress": "tools",
    completed: "check-circle",
    overdue: "exclamation-circle",
    "on-hold": "pause-circle",
    cancelled: "times-circle",
    "not-started": "clock",
  };
  return `<i class="fas fa-${icons[status] || "question-circle"}"></i>`;
}

/* ------------------------------ Charts ------------------------------ */

function renderProgressChart(projects) {
  const labels = projects.map((p) => p.name);
  const progressData = projects.map((p) => calculateProgress(p.tasks));

  renderChart("progressChart", "bar", labels, progressData, "Progress (%)");
}

function renderTaskStatusChart(taskStats) {
  const labels = Object.keys(taskStats).map((status) =>
    status.replace("-", " ")
  );
  renderChart(
    "taskStatusChart",
    "polarArea",
    labels,
    Object.values(taskStats),
    "Task Status"
  );
}

function renderChart(id, type, labels, data, label) {
  const ctx = document.getElementById(id)?.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{ label, data, backgroundColor: getChartColors() }],
    },
    options: { responsive: true },
  });
}

function getChartColors() {
  return [
    "#10B981",
    "#3B82F6",
    "#EF4444",
    "#FBBF24",
    "#8B5CF6",
    "#6B7280",
    "#9CA3AF",
  ];
}
