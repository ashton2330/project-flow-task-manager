const initialTasks = [
  { id: 1, name: "Design homepage wireframe", desc: "Create low-fi wireframes for the new landing page.", priority: "high", status: "in-progress", date: "2026-03-10" },
  { id: 2, name: "Set up CI/CD pipeline", desc: "Configure GitHub Actions for auto deploy.", priority: "medium", status: "done", date: "2026-03-05" },
  { id: 3, name: "Write API documentation", desc: "Document all REST endpoints with examples.", priority: "low", status: "todo", date: "2026-03-15" },
  { id: 4, name: "Fix login redirect bug", desc: "Users are redirected to 404 after OAuth login.", priority: "high", status: "in-progress", date: "2026-03-08" },
  { id: 5, name: "Implement Local Storage for Tasks", desc: "Added browser localStorage to persist tasks so they remain saved after page refresh, including add, delete, and status updates.", priority: "medium", status: "done", date: "2026-03-04" },
  { id: 6, name: "Database migration", desc: "Migrate user table to new schema.", priority: "high", status: "todo", date: "2026-03-09" },
  { id: 7, name: "Code review: auth module", desc: "Review PR #42 for security issues.", priority: "medium", status: "in-progress", date: "2026-03-11" },
  { id: 8, name: "Onboard new developer", desc: "Pair programming session + codebase walkthrough.", priority: "low", status: "todo", date: "2026-03-14" }
];

let tasks = JSON.parse(localStorage.getItem("tasks")) || [...initialTasks];
let nextId = tasks.length + 1;
let activeTab = "all";
let currentSort = "date";

const taskGrid = document.getElementById("task-grid");
const emptyState = document.getElementById("empty-state");
const sidebarToggle = document.getElementById("sidebar-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const addTaskBtn = document.getElementById("add-task-btn");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");
const taskForm = document.getElementById("task-form");
const sortBtn = document.getElementById("sort-btn");
const sortDropdown = document.getElementById("sort-dropdown");
const searchInput = document.getElementById("search-input");
const tabButtons = document.querySelectorAll(".tab-btn");
const accordionTriggers = document.querySelectorAll(".accordion-trigger");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

if (sidebarToggle && mobileMenu) {
  sidebarToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    mobileMenu.classList.toggle("hidden");
  });
}

if (sortBtn && sortDropdown) {
  sortBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    sortDropdown.classList.toggle("hidden");
  });
}

document.addEventListener("click", function (e) {
  if (mobileMenu && sidebarToggle) {
    if (!mobileMenu.contains(e.target) && !sidebarToggle.contains(e.target)) {
      mobileMenu.classList.add("hidden");
    }
  }

  if (sortDropdown && sortBtn) {
    if (!sortDropdown.contains(e.target) && !sortBtn.contains(e.target)) {
      sortDropdown.classList.add("hidden");
    }
  }
});

function openModal() {
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }
}

function closeModal() {
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
  if (taskForm) {
    taskForm.reset();
  }
}

if (addTaskBtn) addTaskBtn.addEventListener("click", openModal);
if (modalClose) modalClose.addEventListener("click", closeModal);
if (modalCancel) modalCancel.addEventListener("click", closeModal);

if (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    if (mobileMenu) mobileMenu.classList.add("hidden");
    if (sortDropdown) sortDropdown.classList.add("hidden");
  }
});

tabButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    activeTab = btn.dataset.tab;

    tabButtons.forEach(function (item) {
      item.classList.remove("border-slate-900", "text-slate-900");
      item.classList.add("border-transparent", "text-slate-500");
      item.setAttribute("aria-selected", "false");
    });

    btn.classList.remove("border-transparent", "text-slate-500");
    btn.classList.add("border-slate-900", "text-slate-900");
    btn.setAttribute("aria-selected", "true");

    renderTasks();
  });
});

document.querySelectorAll(".sort-option").forEach(function (option) {
  option.addEventListener("click", function () {
    currentSort = option.dataset.sort;
    if (sortDropdown) sortDropdown.classList.add("hidden");
    renderTasks();
  });
});

accordionTriggers.forEach(function (trigger) {
  trigger.addEventListener("click", function () {
    const content = trigger.nextElementSibling;
    const icon = trigger.querySelector(".accordion-chevron");

    document.querySelectorAll(".accordion-content").forEach(function (item) {
      if (item !== content) {
        item.classList.add("hidden");
      }
    });

    document.querySelectorAll(".accordion-chevron").forEach(function (item) {
      if (item !== icon) {
        item.classList.remove("rotate-180");
      }
    });

    if (content.classList.contains("hidden")) {
      content.classList.remove("hidden");
      if (icon) icon.classList.add("rotate-180");
    } else {
      content.classList.add("hidden");
      if (icon) icon.classList.remove("rotate-180");
    }
  });
});

if (taskForm) {
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("task-name").value.trim();
    const desc = document.getElementById("task-desc").value.trim();
    const priority = document.getElementById("task-priority").value;
    const status = document.getElementById("task-status").value;
    const date = document.getElementById("task-date").value;

    if (name === "") return;

    const newTask = {
      id: nextId,
      name: name,
      desc: desc === "" ? "No description added." : desc,
      priority: priority,
      status: status,
      date: date === "" ? new Date().toISOString().split("T")[0] : date
    };

    nextId++;
    tasks.push(newTask);
    saveTasks();
    updateStats();
    renderTasks();
    closeModal();
  });
}

if (searchInput) {
  searchInput.addEventListener("input", function () {
    renderTasks();
  });
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  updateStats();
  renderTasks();
}

function changeStatus(id) {
  const task = tasks.find(function (item) {
    return item.id === id;
  });

  if (!task) return;

  if (task.status === "todo") {
    task.status = "in-progress";
  } else if (task.status === "in-progress") {
    task.status = "done";
  } else {
    task.status = "todo";
  }
  saveTasks();
  updateStats();
  renderTasks();
}

function getTasks() {
  let filteredTasks = [...tasks];

  if (activeTab !== "all") {
    filteredTasks = filteredTasks.filter(function (task) {
      return task.status === activeTab;
    });
  }

  const searchText = searchInput.value.trim().toLowerCase();

  if (searchText !== "") {
    filteredTasks = filteredTasks.filter(function (task) {
      return (
        task.name.toLowerCase().includes(searchText) ||
        task.desc.toLowerCase().includes(searchText)
      );
    });
  }

  if (currentSort === "date") {
    filteredTasks.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  }

  if (currentSort === "name") {
    filteredTasks.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }

  if (currentSort === "priority") {
    const order = { high: 1, medium: 2, low: 3 };

    filteredTasks.sort(function (a, b) {
      return order[a.priority] - order[b.priority];
    });
  }

  return filteredTasks;
}

function renderTasks() {
  const filteredTasks = getTasks();

  if (filteredTasks.length === 0) {
    taskGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  taskGrid.innerHTML = filteredTasks.map(function (task) {
    return createTaskCard(task);
  }).join("");

  const deleteButtons = document.querySelectorAll("[data-delete]");
  deleteButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteTask(Number(btn.dataset.delete));
    });
  });

  const statusButtons = document.querySelectorAll("[data-status]");
  statusButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      changeStatus(Number(btn.dataset.status));
    });
  });
}

function createTaskCard(task) {
  let priorityClass = "";
  let statusClass = "";
  let statusText = "";
  let actionText = "";

  if (task.priority === "high") {
    priorityClass = "bg-red-100 text-red-700";
  } else if (task.priority === "medium") {
    priorityClass = "bg-yellow-100 text-yellow-700";
  } else {
    priorityClass = "bg-green-100 text-green-700";
  }

  if (task.status === "todo") {
    statusClass = "bg-slate-100 text-slate-700";
    statusText = "To Do";
    actionText = "Mark In Progress";
  } else if (task.status === "in-progress") {
    statusClass = "bg-blue-100 text-blue-700";
    statusText = "In Progress";
    actionText = "Mark Completed";
  } else {
    statusClass = "bg-emerald-100 text-emerald-700";
    statusText = "Completed";
    actionText = "Undo";
  }

  return `
    <div class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold ${task.status === "done" ? "line-through text-slate-400" : "text-slate-900"}">${task.name}</h3>
          <p class="mt-2 text-sm text-slate-500">${task.desc}</p>
        </div>
        <button data-delete="${task.id}" class="invisible group-hover:visible rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500">
          🗑️
        </button>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span class="rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}">
          ${capitalize(task.priority)}
        </span>
        <span class="rounded-full px-3 py-1 text-xs font-semibold ${statusClass}">
          ${statusText}
        </span>
      </div>

      <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 gap-3">
        <p class="text-sm text-slate-500">${formatDate(task.date)}</p>
        <button data-status="${task.id}" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">
          ${actionText}
        </button>
      </div>
    </div>
  `;
}

function updateStats() {
  const total = tasks.length;
  const inProgress = tasks.filter(function (task) {
    return task.status === "in-progress";
  }).length;

  const completed = tasks.filter(function (task) {
    return task.status === "done";
  }).length;

  const overdue = tasks.filter(function (task) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.date);
    return dueDate < today && task.status !== "done";
  }).length;

  const totalEl = document.getElementById("stat-total");
  const progressEl = document.getElementById("stat-progress");
  const doneEl = document.getElementById("stat-done");
  const overdueEl = document.getElementById("stat-overdue");

  if (totalEl) totalEl.textContent = total;
  if (progressEl) progressEl.textContent = inProgress;
  if (doneEl) doneEl.textContent = completed;
  if (overdueEl) overdueEl.textContent = overdue;
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

updateStats();
renderTasks();