/**
 * ============================================
 * TASK MANAGER CLASS
 * ============================================
 * This class manages all tasks, badges, and filters.
 * It stores the data and provides methods to add, edit, delete, and toggle tasks.
 */
class TaskManager {
  constructor() {
    // API Base URL - Update this to match your backend server
    this.API_BASE_URL = "http://localhost:3000/api";

    // Initialize with empty tasks array - will be loaded from backend
    this.tasks = [];

    // Initialize badges - will be loaded from backend
    this.badges = [];

    // User stats - will be loaded from backend
    this.stats = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      tasksCompleted: 0,
      totalTasks: 0,
    };

    // Current filter: 'all', 'active', or 'completed'
    this.filter = "all";

    // Array to store functions that need to be notified when data changes
    this.listeners = [];
  }

  /**
   * Convert backend task format to frontend format
   * Backend uses: _id, status ('pending'/'completed')
   * Frontend uses: id, completed (boolean)
   */
  mapTaskFromBackend(backendTask) {
    return {
      id: backendTask._id,
      title: backendTask.title,
      description: backendTask.description || "",
      completed: backendTask.status === "completed",
      createdAt: new Date(backendTask.createdAt),
      completedAt:
        backendTask.status === "completed" && backendTask.updatedAt
          ? new Date(backendTask.updatedAt)
          : undefined,
      points: Math.floor(Math.random() * 21) + 5, // Random points for UI (not stored in backend)
    };
  }

  /**
   * Convert frontend task format to backend format
   */
  mapTaskToBackend(frontendTask) {
    return {
      title: frontendTask.title,
      description: frontendTask.description || "",
      status: frontendTask.completed ? "completed" : "pending",
    };
  }

  /**
   * Load all tasks from the backend API
   */
  async loadTasks() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        this.tasks = data.data.map((task) => this.mapTaskFromBackend(task));
        this.notify();
        return this.tasks;
      } else {
        throw new Error(data.error || "Failed to load tasks");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      // Fallback to empty array if API fails
      this.tasks = [];
      this.notify();
      return [];
    }
  }

  /**
   * Load user statistics (badges, streaks, points) from the backend API
   */
  async loadStats() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error(`Failed to load stats: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        const statsData = data.data;
        this.badges = statsData.badges || [];
        this.stats = {
          totalPoints: statsData.totalPoints || 0,
          currentStreak: statsData.currentStreak || 0,
          longestStreak: statsData.longestStreak || 0,
          tasksCompleted: statsData.tasksCompleted || 0,
          totalTasks: statsData.totalTasks || 0,
        };
        this.notify();
        return { badges: this.badges, stats: this.stats };
      } else {
        throw new Error(data.error || "Failed to load stats");
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      // Fallback to default badges if API fails
      this.badges = [
        {
          id: "first-task",
          name: "First Steps",
          description: "Complete your first task",
          icon: "🎯",
          unlocked: false,
        },
        {
          id: "streak-3",
          name: "On Fire",
          description: "Complete tasks 3 days in a row",
          icon: "🔥",
          unlocked: false,
        },
        {
          id: "points-50",
          name: "Point Collector",
          description: "Earn 50 points",
          icon: "⭐",
          unlocked: false,
        },
        {
          id: "tasks-10",
          name: "Task Master",
          description: "Complete 10 tasks",
          icon: "👑",
          unlocked: false,
        },
      ];
      this.notify();
      return { badges: this.badges, stats: this.stats };
    }
  }

  /**
   * Save user statistics to the backend API
   */
  async saveStats() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/stats`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          badges: this.badges,
          totalPoints: this.stats.totalPoints,
          currentStreak: this.stats.currentStreak,
          tasksCompleted: this.stats.tasksCompleted,
          totalTasks: this.stats.totalTasks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save stats");
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || "Failed to save stats");
      }
    } catch (error) {
      console.error("Error saving stats:", error);
      throw error;
    }
  }

  /**
   * Subscribe a function to be called whenever data changes
   * This allows the UI to update automatically when tasks change
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all subscribed functions that data has changed
   * This triggers UI updates
   */
  notify() {
    this.listeners.forEach((callback) => callback());
  }

  /**
   * Add a new task to the list
   * @param {string} title - The task title
   * @param {number} points - Points awarded for completing this task (default: 10)
   * @returns {Promise<object>} The newly created task
   */
  async addTask(title, points = 10) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: "",
          status: "pending",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      const data = await response.json();
      if (data.success) {
        const newTask = this.mapTaskFromBackend(data.data);
        newTask.points = points; // Add points for UI
        // Add new task to the beginning of the array
        this.tasks = [newTask, ...this.tasks];
        this.notify(); // Tell UI to update
        return newTask;
      } else {
        throw new Error(data.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }

  /**
   * Edit an existing task's title
   * @param {string} id - The task ID to edit
   * @param {string} title - The new title
   * @returns {Promise<object>} The updated task
   */
  async editTask(id, title) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const data = await response.json();
      if (data.success) {
        const updatedTask = this.mapTaskFromBackend(data.data);
        // Preserve points from existing task
        const existingTask = this.tasks.find((t) => t.id === id);
        updatedTask.points = existingTask
          ? existingTask.points
          : Math.floor(Math.random() * 21) + 5;

        // Update the task in the array
        this.tasks = this.tasks.map((task) =>
          task.id === id ? updatedTask : task
        );
        this.notify(); // Tell UI to update
        return updatedTask;
      } else {
        throw new Error(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error editing task:", error);
      throw error;
    }
  }

  /**
   * Delete a task from the list
   * @param {string} id - The task ID to delete
   * @returns {Promise<void>}
   */
  async deleteTask(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      const data = await response.json();
      if (data.success) {
        // Remove task from the array
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.notify(); // Tell UI to update
      } else {
        throw new Error(data.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  /**
   * Toggle a task's completion status (mark as done/undone)
   * @param {string} id - The task ID to toggle
   * @returns {Promise<object>} The updated task
   */
  async toggleTask(id) {
    try {
      // Find the task before toggling to check if it was completed
      const task = this.tasks.find((t) => t.id === id);
      if (!task) {
        throw new Error("Task not found");
      }

      const wasCompleted = task.completed;
      const newStatus = task.completed ? "pending" : "completed";

      const response = await fetch(`${this.API_BASE_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle task");
      }

      const data = await response.json();
      if (data.success) {
        const updatedTask = this.mapTaskFromBackend(data.data);
        // Preserve points from existing task
        updatedTask.points = task.points;

        // Update the task in the array
        this.tasks = this.tasks.map((t) => (t.id === id ? updatedTask : t));

        // Check for badge unlocks only when completing a task (not uncompleting)
        if (!wasCompleted) {
          await this.checkBadgeUnlocks();
        }

        this.notify(); // Tell UI to update
        return updatedTask;
      } else {
        throw new Error(data.error || "Failed to toggle task");
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      throw error;
    }
  }

  async checkBadgeUnlocks() {
    const completedTasks = this.tasks.filter((t) => t.completed);
    const completedCount = completedTasks.length;
    const totalPoints = completedTasks.reduce(
      (sum, t) => sum + (t.points || 0),
      0
    );

    // Update stats
    this.stats.tasksCompleted = completedCount;
    this.stats.totalTasks = this.tasks.length;
    this.stats.totalPoints = totalPoints;

    // Calculate current streak
    const completionDates = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => {
        const date = new Date(t.completedAt);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      })
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)

    // Remove duplicates
    const uniqueDates = [];
    completionDates.forEach((date) => {
      const dateStr = date.toDateString();
      if (!uniqueDates.find((d) => d.toDateString() === dateStr)) {
        uniqueDates.push(date);
      }
    });

    // Calculate streak (consecutive days from today backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      if (uniqueDates.some((d) => d.getTime() === checkDate.getTime())) {
        currentStreak++;
      } else {
        break;
      }
    }

    this.stats.currentStreak = currentStreak;
    if (currentStreak > this.stats.longestStreak) {
      this.stats.longestStreak = currentStreak;
    }

    let badgesUpdated = false;

    // Check for first task completion
    if (completedCount === 1) {
      const firstTaskBadge = this.badges.find((b) => b.id === "first-task");
      if (firstTaskBadge && !firstTaskBadge.unlocked) {
        firstTaskBadge.unlocked = true;
        firstTaskBadge.unlockedAt = new Date();
        badgesUpdated = true;
      }
    }

    // Check for streak badge (3 days in a row)
    const streakBadge = this.badges.find((b) => b.id === "streak-3");
    if (streakBadge && !streakBadge.unlocked && currentStreak >= 3) {
      streakBadge.unlocked = true;
      streakBadge.unlockedAt = new Date();
      badgesUpdated = true;
    }

    // Check for points badge
    const pointsBadge = this.badges.find((b) => b.id === "points-50");
    if (pointsBadge && !pointsBadge.unlocked && totalPoints >= 50) {
      pointsBadge.unlocked = true;
      pointsBadge.unlockedAt = new Date();
      badgesUpdated = true;
    }

    // Check for tasks completion badge
    const tasksBadge = this.badges.find((b) => b.id === "tasks-10");
    if (tasksBadge && !tasksBadge.unlocked && completedCount >= 10) {
      tasksBadge.unlocked = true;
      tasksBadge.unlockedAt = new Date();
      badgesUpdated = true;
    }

    // Save to backend if badges or stats were updated
    if (badgesUpdated || completedCount > 0) {
      try {
        await this.saveStats();
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    }
  }

  setFilter(filter) {
    this.filter = filter;
    this.notify();
  }

  /**
   * Get tasks based on the current filter
   * @returns {Array} Filtered list of tasks
   */
  getFilteredTasks() {
    // If filter is 'active', show only incomplete tasks
    if (this.filter === "active") {
      return this.tasks.filter((task) => !task.completed);
    }
    // If filter is 'completed', show only completed tasks
    if (this.filter === "completed") {
      return this.tasks.filter((task) => task.completed);
    }
    // If filter is 'all', show ALL tasks (both completed and incomplete)
    // This ensures completed tasks remain visible in the All tab
    return this.tasks;
  }

  getStats() {
    return {
      totalPoints: this.stats.totalPoints,
      tasksCompleted: this.stats.tasksCompleted,
      currentStreak: this.stats.currentStreak,
      longestStreak: this.stats.longestStreak,
      badges: this.badges,
    };
  }

  getProgress() {
    return this.tasks.length > 0
      ? Math.round(
          (this.tasks.filter((t) => t.completed).length / this.tasks.length) *
            100
        )
      : 0;
  }

  getCounts() {
    return {
      all: this.tasks.length,
      active: this.tasks.filter((t) => !t.completed).length,
      completed: this.tasks.filter((t) => t.completed).length,
    };
  }
}

/**
 * ============================================
 * THEME MANAGER CLASS
 * ============================================
 * This class manages the app's theme (Minimal Mode vs Fun Mode).
 * It saves the user's preference and applies the correct styles.
 */
class ThemeManager {
  constructor() {
    // Get saved theme from browser storage, or default to 'minimal'
    this.mode = localStorage.getItem("themeMode") || "minimal";
    this.applyTheme();
  }

  /**
   * Apply the current theme to the page
   * Adds CSS classes to change colors and styles
   */
  applyTheme() {
    const root = document.documentElement; // The <html> element

    if (this.mode === "fun") {
      // Fun mode: colorful, gradient, exciting
      root.classList.add("fun-mode");
      root.classList.remove("minimal-mode");
    } else {
      // Minimal mode: clean, simple, professional
      root.classList.add("minimal-mode");
      root.classList.remove("fun-mode");
    }

    // Save the preference to browser storage
    localStorage.setItem("themeMode", this.mode);
  }

  /**
   * Switch between Minimal and Fun mode
   */
  toggleMode() {
    // Flip between 'minimal' and 'fun'
    this.mode = this.mode === "minimal" ? "fun" : "minimal";
    this.applyTheme();
    this.onModeChange(); // Notify UI to update
  }

  /**
   * Callback function that gets called when theme changes
   * This will be set by the UI manager
   */
  onModeChange() {
    // This will be set by the UI manager
  }
}

/**
 * ============================================
 * UI MANAGER CLASS
 * ============================================
 * This class handles all user interface updates and interactions.
 * It connects the TaskManager and ThemeManager to the HTML page.
 */
class UIManager {
  constructor(taskManager, themeManager) {
    // Store references to the managers
    this.taskManager = taskManager;
    this.themeManager = themeManager;

    // When theme changes, update the UI
    this.themeManager.onModeChange = () => this.updateUI();

    // Track which task is currently being edited
    this.editingTaskId = null;

    // Initialize the UI
    this.init();
  }

  /**
   * Initialize the UI when the page loads
   * Sets up event listeners and displays initial data
   */
  async init() {
    // Set up click handlers and form submissions
    this.setupEventListeners();

    // Subscribe to task changes - whenever tasks change, update the UI
    this.taskManager.subscribe(() => this.updateUI());

    // Initialize progress bar at 0% so it can animate on first load
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.width = "0%";
      progressBar.style.transition = "none";
      // Force a reflow (browser to recalculate layout)
      void progressBar.offsetHeight;
    }

    // Load stats and tasks from backend
    try {
      // Load stats first (badges, streaks, points)
      await this.taskManager.loadStats();

      // Load tasks from backend
      await this.taskManager.loadTasks();

      // Recalculate and save badges/stats based on loaded tasks
      await this.taskManager.checkBadgeUnlocks();
    } catch (error) {
      console.error("Failed to load data:", error);
      // Show error message to user
      const taskList = document.getElementById("taskList");
      if (taskList) {
        taskList.innerHTML =
          '<div class="text-center p-8 text-red-500">Failed to load data. Please check if the backend server is running.</div>';
      }
    }

    // Update UI immediately with current data
    this.updateUI();

    // Animate progress bar after a brief delay
    if (progressBar) {
      setTimeout(() => {
        progressBar.style.transition = "width 0.8s ease-out";
        const progress = this.taskManager.getProgress();
        progressBar.style.width = `${progress}%`;
      }, 50);
    }

    // Animate header on page load
    this.animateOnLoad();
  }

  /**
   * Set up all event listeners for user interactions
   * This connects buttons, forms, and other UI elements to their functions
   */
  setupEventListeners() {
    // Get references to form elements
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");

    // Show/hide the add button as user types
    taskInput.addEventListener("input", () => {
      if (taskInput.value.trim()) {
        // User is typing - show the add button with fade-in animation
        addBtn.style.display = "flex";
        addBtn.style.opacity = "0";
        setTimeout(() => {
          addBtn.style.opacity = "1";
        }, 10);
      } else {
        // Input is empty - hide the add button with fade-out animation
        addBtn.style.opacity = "0";
        setTimeout(() => {
          addBtn.style.display = "none";
        }, 200);
      }
    });

    // Handle form submission (when user presses Enter or clicks Add)
    taskForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent page refresh
      const title = taskInput.value.trim();
      if (title) {
        // Generate random points between 5 and 25
        const points = Math.floor(Math.random() * 21) + 5;
        try {
          // Add the new task (now async)
          await this.taskManager.addTask(title, points);
          // Clear the input and hide the button
          taskInput.value = "";
          addBtn.style.display = "none";
        } catch (error) {
          console.error("Failed to add task:", error);
          alert("Failed to add task. Please try again.");
        }
      }
    });

    // Handle theme mode toggle button
    const modeToggle = document.getElementById("modeToggle");
    modeToggle.addEventListener("click", () => {
      this.themeManager.toggleMode();
    });

    // Handle filter buttons (All, Active, Completed)
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter; // Get 'all', 'active', or 'completed'
        this.taskManager.setFilter(filter);
      });
    });
  }

  /**
   * Update all parts of the UI
   * This is called whenever data changes
   */
  updateUI() {
    this.updateHeader(); // Update header text and icons
    this.updateTasks(); // Update the task list
    this.updateFilters(); // Update filter button states
    this.updateStats(); // Update statistics
    this.updateProgress(); // Update progress bar
    this.updatePoints(); // Update points and streak
    this.updateBadges(); // Update badge display
  }

  updateHeader() {
    const isFun = this.themeManager.mode === "fun";
    const header = document.querySelector(".app-header");
    const subtitle = document.querySelector(".app-header-subtitle");
    const icon = document.querySelector(".app-icon");
    const modeToggle = document.getElementById("modeToggle");
    const modeIcon = modeToggle.querySelector(".mode-icon");
    const modeText = modeToggle.querySelector("span");
    const gradientOverlay = document.querySelector(".bg-gradient-overlay");
    const footer = document.getElementById("footer");

    if (isFun) {
      header.textContent = "Task Quest";
      header.classList.add("gradient-text", "font-display");
      subtitle.textContent = "Level up your productivity!";
      icon.className =
        "app-icon p-3 rounded-2xl bg-gradient-to-br from-fun-accent/20 to-fun-secondary/20";
      icon.innerHTML =
        '<svg class="icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>';
      modeIcon.innerHTML =
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>';
      modeText.textContent = "Fun Mode";
      gradientOverlay.style.display = "block";
      footer.querySelector("p").textContent =
        "✨ Keep crushing those tasks! ✨";
    } else {
      header.textContent = "Task Manager";
      header.classList.remove("gradient-text", "font-display");
      subtitle.textContent = "Organize your day";
      icon.className = "app-icon p-3 rounded-2xl bg-secondary";
      icon.innerHTML =
        '<svg class="icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>';
      modeIcon.innerHTML =
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
      modeText.textContent = "Minimal Mode";
      gradientOverlay.style.display = "none";
      footer.querySelector("p").textContent = "Stay organized, stay productive";
    }
  }

  /**
   * Update the task list display
   * Shows all tasks based on the current filter
   * Note: In 'all' filter, completed tasks remain visible (not removed)
   */
  updateTasks() {
    const taskList = document.getElementById("taskList");
    const emptyState = document.getElementById("emptyState");

    // Get tasks based on current filter (all/active/completed)
    const tasks = this.taskManager.getFilteredTasks();
    const isFun = this.themeManager.mode === "fun";

    // Clear the current task list
    taskList.innerHTML = "";

    if (tasks.length === 0) {
      // No tasks to show - display empty state message
      taskList.style.display = "none";
      emptyState.style.display = "flex";
      this.updateEmptyState();
    } else {
      // Show tasks
      taskList.style.display = "block";
      emptyState.style.display = "none";

      // Create and add each task element to the list
      tasks.forEach((task, index) => {
        const taskElement = this.createTaskElement(task, index);
        taskList.appendChild(taskElement);
      });
    }
  }

  /**
   * Create the HTML element for a single task
   * @param {object} task - The task object
   * @param {number} index - The index of the task (for animation delay)
   * @returns {HTMLElement} The task element
   */
  createTaskElement(task, index) {
    const isFun = this.themeManager.mode === "fun";

    // Create the main task container div
    const div = document.createElement("div");

    // Add classes: 'completed' class is added if task is completed
    // This class is used by CSS to style completed tasks differently
    const completedClass = task.completed ? "completed" : "";
    div.className = `task-item group relative flex items-center gap-4 p-4 rounded-2xl transition-all ${completedClass}`;

    // Animate the task appearing (fade in from left)
    div.style.opacity = "0";
    div.style.transform = "translateX(-20px)";
    setTimeout(() => {
      div.style.transition = "all 0.3s ease";
      div.style.opacity = "1";
      div.style.transform = "translateX(0)";
    }, index * 50);

    // Create the checkbox button
    // Add 'checked' class if task is completed - this makes it green!
    const checkboxClass = task.completed ? "checked" : "";
    const checkmarkIcon = task.completed
      ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : "";

    // Create the task title
    // Add 'line-through opacity-60' classes if completed - this adds strike-through!
    // Add 'truncate' class to handle long titles with ellipsis
    const titleClass = task.completed ? "line-through opacity-60" : "";
    const escapedTitle = this.escapeHtml(task.title);

    // Build the HTML for the task
    div.innerHTML = `
      <button class="task-checkbox flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${checkboxClass}" data-task-id="${
      task.id
    }" data-action="toggle">
        ${checkmarkIcon}
      </button>
      <div class="flex-1 min-w-0">
        <p class="task-title text-base transition-all truncate ${titleClass}" title="${escapedTitle}">${escapedTitle}</p>
        ${
          isFun
            ? `<div class="task-points flex items-center gap-1 mt-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg><span class="text-xs font-medium">+${task.points} pts</span></div>`
            : ""
        }
      </div>
      <div class="task-actions flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="task-action-btn edit p-2 rounded-lg" data-task-id="${
          task.id
        }" data-action="edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
        <button class="task-action-btn delete p-2 rounded-lg" data-task-id="${
          task.id
        }" data-action="delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `;

    // Add event listeners
    div
      .querySelector('[data-action="toggle"]')
      .addEventListener("click", () => {
        this.handleToggleTask(task.id);
      });

    div.querySelector('[data-action="edit"]').addEventListener("click", () => {
      this.handleEditTask(task.id, div);
    });

    div
      .querySelector('[data-action="delete"]')
      .addEventListener("click", () => {
        this.handleDeleteTask(task.id, div);
      });

    return div;
  }

  /**
   * Handle when user clicks the checkbox to complete/uncomplete a task
   * @param {string} id - The task ID to toggle
   */
  async handleToggleTask(id) {
    const task = this.taskManager.tasks.find((t) => t.id === id);
    const isFun = this.themeManager.mode === "fun";

    // In fun mode, show confetti when completing a task (not uncompleting)
    if (isFun && task && !task.completed && typeof confetti !== "undefined") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00d9ff", "#ff00aa", "#7c3aed", "#fbbf24"],
      });
    }

    try {
      // Toggle the task's completion status (now async)
      // This will automatically update the UI because we're subscribed to changes
      await this.taskManager.toggleTask(id);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      alert("Failed to update task. Please try again.");
    }
  }

  handleEditTask(id, taskElement) {
    const task = this.taskManager.tasks.find((t) => t.id === id);
    if (!task) return;

    const titleElement = taskElement.querySelector(".task-title");
    const actionsElement = taskElement.querySelector(".task-actions");

    const input = document.createElement("input");
    input.type = "text";
    input.value = task.title;
    input.className =
      "task-edit-input w-full bg-transparent outline-none border-b-2 pb-1";
    input.style.width = "100%";

    const saveBtn = document.createElement("button");
    saveBtn.className = "task-action-btn save p-2 rounded-lg";
    saveBtn.innerHTML =
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "task-action-btn cancel p-2 rounded-lg";
    cancelBtn.innerHTML =
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

    titleElement.replaceWith(input);
    actionsElement.innerHTML = "";
    actionsElement.appendChild(saveBtn);
    actionsElement.appendChild(cancelBtn);
    input.focus();

    const save = async () => {
      const newTitle = input.value.trim();
      if (newTitle) {
        try {
          await this.taskManager.editTask(id, newTitle);
        } catch (error) {
          console.error("Failed to edit task:", error);
          alert("Failed to update task. Please try again.");
        }
      } else {
        input.replaceWith(titleElement);
        actionsElement.innerHTML = `
          <button class="task-action-btn edit p-2 rounded-lg" data-task-id="${id}" data-action="edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button class="task-action-btn delete p-2 rounded-lg" data-task-id="${id}" data-action="delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        `;
        this.setupTaskActions(taskElement, id);
      }
    };

    const cancel = () => {
      input.replaceWith(titleElement);
      actionsElement.innerHTML = `
        <button class="task-action-btn edit p-2 rounded-lg" data-task-id="${id}" data-action="edit">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
        <button class="task-action-btn delete p-2 rounded-lg" data-task-id="${id}" data-action="delete">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      `;
      this.setupTaskActions(taskElement, id);
    };

    saveBtn.addEventListener("click", save);
    cancelBtn.addEventListener("click", cancel);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") cancel();
    });
  }

  setupTaskActions(taskElement, id) {
    taskElement
      .querySelector('[data-action="edit"]')
      .addEventListener("click", () => {
        this.handleEditTask(id, taskElement);
      });
    taskElement
      .querySelector('[data-action="delete"]')
      .addEventListener("click", () => {
        this.handleDeleteTask(id, taskElement);
      });
  }

  async handleDeleteTask(id, taskElement) {
    taskElement.style.transition = "all 0.3s ease";
    taskElement.style.opacity = "0";
    taskElement.style.transform = "translateX(100px)";
    setTimeout(async () => {
      try {
        await this.taskManager.deleteTask(id);
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task. Please try again.");
        // Restore the task element if deletion failed
        taskElement.style.opacity = "1";
        taskElement.style.transform = "translateX(0)";
      }
    }, 300);
  }

  updateEmptyState() {
    const emptyTitle = document.getElementById("emptyTitle");
    const emptySubtitle = document.getElementById("emptySubtitle");
    const filter = this.taskManager.filter;

    if (filter === "all") {
      emptyTitle.textContent = "No tasks yet";
      emptySubtitle.textContent = "Add your first task to get started!";
    } else if (filter === "active") {
      emptyTitle.textContent = "No active tasks";
      emptySubtitle.textContent = "All tasks are completed. Great job!";
    } else {
      emptyTitle.textContent = "No completed tasks";
      emptySubtitle.textContent = "Complete some tasks to see them here";
    }
  }

  updateFilters() {
    const counts = this.taskManager.getCounts();
    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach((btn) => {
      const filter = btn.dataset.filter;
      // Find the count span using attribute selector for class containing ml-1
      // Structure: <button><span class="relative z-10">All <span class="ml-1.5 text-xs opacity-70">(0)</span></span></button>
      const countSpan = btn.querySelector('span[class*="ml-1"]');

      if (countSpan) {
        countSpan.textContent = `(${counts[filter]})`;
      } else {
        // Fallback: find any span with parentheses in text
        const allSpans = btn.querySelectorAll("span");
        const fallbackSpan = Array.from(allSpans).find(
          (span) =>
            span.textContent.trim().startsWith("(") ||
            span.textContent.trim().match(/^\(\d+\)$/)
        );
        if (fallbackSpan) {
          fallbackSpan.textContent = `(${counts[filter]})`;
        }
      }

      if (filter === this.taskManager.filter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  updateStats() {
    const counts = this.taskManager.getCounts();
    document.getElementById("totalTasks").textContent = counts.all;
    document.getElementById("completedTasks").textContent = counts.completed;
  }

  updateProgress() {
    const progress = this.taskManager.getProgress();
    const counts = this.taskManager.getCounts();
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const progressPercentage = document.getElementById("progressPercentage");
    const progressPercent = document.getElementById("progressPercent");
    const isFun = this.themeManager.mode === "fun";

    if (progressBar) {
      const currentWidth = parseFloat(progressBar.style.width) || 0;
      const newWidth = progress;

      // Always update the width, but only animate if transition is not 'none'
      if (progressBar.style.transition !== "none") {
        // Force reflow to ensure animation works
        void progressBar.offsetHeight;
        // Ensure transition is set
        progressBar.style.transition = "width 0.8s ease-out";
        progressBar.style.width = `${newWidth}%`;
      } else {
        // If transition is 'none', just set the width without animation
        progressBar.style.width = `${newWidth}%`;
      }
    }

    if (progressText) {
      progressText.textContent = `${counts.completed}/${counts.all} tasks`;
    }

    if (isFun && progressPercentage && progressPercent) {
      progressPercentage.style.display = "block";
      if (progress === 100) {
        progressPercent.innerHTML = `${progress}% <span style="margin-left: 0.5rem; font-size: 0.875rem;">🎉</span>`;
      } else {
        progressPercent.textContent = `${progress}%`;
      }
    } else if (progressPercentage) {
      progressPercentage.style.display = "none";
    }
  }

  updatePoints() {
    const stats = this.taskManager.getStats();
    document.getElementById("pointsValue").textContent = stats.totalPoints;
    document.getElementById(
      "streakValue"
    ).textContent = `${stats.currentStreak} 🔥`;
  }

  updateBadges() {
    const badges = this.taskManager.badges;
    const badgesGrid = document.getElementById("badgesGrid");
    const badgesHeader = document.getElementById("badgesHeader");
    const unlockedCount = badges.filter((b) => b.unlocked).length;
    const isFun = this.themeManager.mode === "fun";

    badgesHeader.textContent = `Badges (${unlockedCount}/${badges.length})`;
    badgesGrid.innerHTML = "";

    badges.forEach((badge, index) => {
      const badgeDiv = document.createElement("div");
      badgeDiv.className = `badge-item relative flex flex-col items-center p-3 rounded-xl transition-all ${
        badge.unlocked ? "unlocked" : "locked"
      }`;
      badgeDiv.title = badge.unlocked
        ? `${badge.name}: ${badge.description}`
        : "Locked";
      badgeDiv.style.opacity = "0";
      badgeDiv.style.transform = "scale(0.8)";

      setTimeout(() => {
        badgeDiv.style.transition = "all 0.3s ease";
        badgeDiv.style.opacity = "1";
        badgeDiv.style.transform = "scale(1)";
      }, index * 100);

      badgeDiv.innerHTML = `
        <span class="text-2xl">${badge.unlocked ? badge.icon : "🔒"}</span>
        <span class="badge-name text-xs mt-1 text-center truncate w-full">${
          badge.unlocked ? badge.name : "???"
        }</span>
      `;

      badgesGrid.appendChild(badgeDiv);
    });
  }

  animateOnLoad() {
    const header = document.querySelector(".header");
    header.style.opacity = "0";
    header.style.transform = "translateY(-20px)";
    setTimeout(() => {
      header.style.transition = "all 0.5s ease";
      header.style.opacity = "1";
      header.style.transform = "translateY(0)";
    }, 100);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * ============================================
 * INITIALIZE THE APPLICATION
 * ============================================
 * When the page loads, create the managers and start the app
 */
const taskManager = new TaskManager();
const themeManager = new ThemeManager();
const uiManager = new UIManager(taskManager, themeManager);
