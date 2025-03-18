// const apiBaseUrl = "https://assistify-back.onrender.com/api";
const taskList = document.getElementById("task-list");
const noTasksDiv = document.getElementById("no-tasks");
const searchInput = document.getElementById("search-input");
const newTaskBtn = document.getElementById("new-task-btn");
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const cancelBtn = document.getElementById("cancel-btn");
const modalTitle = document.getElementById("modal-title");
const taskIdInput = document.getElementById("task-id");
const taskNameInput = document.getElementById("task-name");
const taskDescriptionInput = document.getElementById("task-description");
const taskDueDateInput = document.getElementById("task-due-date");
const taskTagsInput = document.getElementById("task-tags");
const taskTagsPreview = document.createElement("div");
taskTagsPreview.className = "flex flex-wrap gap-2 mt-2";
const filterAndSort = document.getElementById("filter-and-sort");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

taskTagsInput.parentNode.appendChild(taskTagsPreview);

let tasks = [];
let currentPage = 1;
const limit = 100;
let totalPages = 1;
let taskStates = {};
