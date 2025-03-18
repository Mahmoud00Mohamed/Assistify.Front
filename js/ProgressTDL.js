document.addEventListener("DOMContentLoaded", function () {
  const tasks = getTasksFromStorage();
  const today = new Date();

  updateTaskStatistics(tasks, today);
  renderCompletionChart(tasks);
  renderPriorityChart(tasks, today);
  renderProgressChart(tasks);
});

// 🔧 Utility Functions
function getTasksFromStorage() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function countTasksByCondition(tasks, condition) {
  return tasks.filter(condition).length;
}

function calculateDaysDiff(date1, date2) {
  return Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24));
}

// 📊 Update Task Statistics
function updateTaskStatistics(tasks, today) {
  document.getElementById("total-tasks").textContent = tasks.length;
  document.getElementById("completed-tasks").textContent =
    countTasksByCondition(tasks, (task) => task.completed);
  document.getElementById("pending-tasks").textContent = countTasksByCondition(
    tasks,
    (task) => !task.completed
  );
  document.getElementById("overdue-tasks").textContent = countTasksByCondition(
    tasks,
    (task) => new Date(task.dueDate) < today && !task.completed
  );
}

//  Render Task Completion Chart
function renderCompletionChart(tasks) {
  const completionCtx = document
    .getElementById("completionChart")
    .getContext("2d");

  new Chart(completionCtx, {
    type: "doughnut",
    data: {
      labels: [" Completed", "⏳ Pending"],
      datasets: [
        {
          data: [
            countTasksByCondition(tasks, (task) => task.completed),
            countTasksByCondition(tasks, (task) => !task.completed),
          ],
          backgroundColor: ["#16a34a", "#3b82f6"],
          hoverBackgroundColor: ["#0f9d58", "#2563eb"],
          borderWidth: 2,
          hoverOffset: 10,
          borderRadius: 6,
        },
      ],
    },
    options: getChartOptions("doughnut"),
  });
}

// 📊 Render Task Priority Chart
function renderPriorityChart(tasks, today) {
  const priorityCtx = document.getElementById("priorityChart").getContext("2d");

  const tasksByDaysRemaining = categorizeTasksByDueDate(tasks, today);

  new Chart(priorityCtx, {
    type: "bar",
    data: {
      labels: ["❗ Overdue", "📆 Today", "🕓 This Week", "⏳ After a Week"],
      datasets: [
        {
          label: "Tasks",
          data: Object.values(tasksByDaysRemaining).map(
            (group) => group.length
          ),
          backgroundColor: ["#dc2626", "#f59e0b", "#2563eb", "#6b7280"],
          hoverBackgroundColor: ["#b91c1c", "#d97706", "#1d4ed8", "#374151"],
          borderRadius: 6,
        },
      ],
    },
    options: getBarChartOptions(tasksByDaysRemaining),
  });
}

// 🧠 Categorize Tasks by Due Date
function categorizeTasksByDueDate(tasks, today) {
  return tasks.reduce(
    (acc, task) => {
      const dueDate = new Date(task.dueDate);
      const daysDiff = calculateDaysDiff(dueDate, today);

      if (daysDiff < 0 && !task.completed) acc.overdue.push(task.name);
      else if (daysDiff === 0) acc.today.push(task.name);
      else if (daysDiff <= 7) acc.thisWeek.push(task.name);
      else acc.afterWeek.push(task.name);

      return acc;
    },
    { overdue: [], today: [], thisWeek: [], afterWeek: [] }
  );
}

// 📈 Render Task Progress Chart
function renderProgressChart(tasks) {
  const progressCtx = document.getElementById("progressChart").getContext("2d");

  new Chart(progressCtx, {
    type: "line",
    data: {
      labels: tasks.map((task) => task.name || "Unnamed Task"),
      datasets: [
        {
          label: "Progress",
          data: tasks.map((task) => task.progress || 0),
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.3)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
        },
      ],
    },
    options: getLineChartOptions(tasks),
  });
}

// ⚙️ Chart Configuration Options
function getChartOptions(type) {
  return {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: getTooltipOptions(),
    },
    animation: {
      animateScale: type === "doughnut",
      animateRotate: type === "doughnut",
    },
  };
}

function getBarChartOptions(taskGroups) {
  return {
    indexAxis: "x",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: getBarTooltipOptions(taskGroups),
    },
    scales: {
      y: { beginAtZero: true, stepSize: 1 },
      x: { grid: { display: false } },
    },
  };
}

function getLineChartOptions(tasks) {
  return {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: getTooltipOptions(
        (context) =>
          `${tasks[context.dataIndex]?.name || "Unknown Task"}: ${context.raw}%`
      ),
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } },
      x: { grid: { display: false } },
    },
  };
}

function getTooltipOptions(labelCallback) {
  return {
    callbacks: {
      label:
        labelCallback ||
        ((context) => `${context.label}: ${context.raw} tasks`),
    },
    backgroundColor: "#1e293b",
    titleColor: "#f3f4f6",
    bodyColor: "#f3f4f6",
    borderColor: "#374151",
    borderWidth: 1,
    padding: 10,
  };
}

function getBarTooltipOptions(taskGroups) {
  return {
    callbacks: {
      label: (context) => {
        const category = context.label;
        const taskNames =
          taskGroups[category.replace(/[^a-zA-Z]/g, "").toLowerCase()];
        return `${category}: ${context.raw} tasks\n(${
          taskNames.join(", ") || "No tasks"
        })`;
      },
    },
  };
}
