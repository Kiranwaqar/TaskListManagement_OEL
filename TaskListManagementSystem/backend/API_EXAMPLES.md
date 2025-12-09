# API Usage Examples

This document provides practical examples of how to use the Task Management API.

## Using fetch() in JavaScript

### Get All Tasks

```javascript
async function getAllTasks() {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");
    const data = await response.json();

    if (data.success) {
      console.log("Tasks:", data.data);
      return data.data;
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
}
```

### Create a Task

```javascript
async function createTask(title, description = "") {
  try {
    const response = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: description,
        status: "pending",
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Task created:", data.data);
      return data.data;
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Failed to create task:", error);
  }
}

// Usage
createTask("Complete project", "Finish the task management system");
```

### Update a Task (Mark as Completed)

```javascript
async function markTaskComplete(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "completed",
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Task updated:", data.data);
      return data.data;
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Failed to update task:", error);
  }
}
```

### Update Task Title

```javascript
async function updateTaskTitle(taskId, newTitle) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Task updated:", data.data);
      return data.data;
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Failed to update task:", error);
  }
}
```

### Delete a Task

```javascript
async function deleteTask(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      console.log("Task deleted successfully");
      return true;
    } else {
      console.error("Error:", data.error);
      return false;
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
    return false;
  }
}
```

### Get a Single Task

```javascript
async function getTask(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
    const data = await response.json();

    if (data.success) {
      console.log("Task:", data.data);
      return data.data;
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Failed to fetch task:", error);
  }
}
```

## Using cURL (Command Line)

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "status": "pending"
  }'
```

### Update a Task

```bash
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## Complete Example: Task Manager Class

```javascript
class TaskAPI {
  constructor(baseURL = "http://localhost:3000/api") {
    this.baseURL = baseURL;
  }

  async getAllTasks() {
    const response = await fetch(`${this.baseURL}/tasks`);
    const data = await response.json();
    return data.success ? data.data : [];
  }

  async createTask(title, description = "") {
    const response = await fetch(`${this.baseURL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, status: "pending" }),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  }

  async updateTask(id, updates) {
    const response = await fetch(`${this.baseURL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  }

  async deleteTask(id) {
    const response = await fetch(`${this.baseURL}/tasks/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data.success;
  }

  async toggleTask(id, currentStatus) {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    return this.updateTask(id, { status: newStatus });
  }
}

// Usage
const api = new TaskAPI();

// Load all tasks
const tasks = await api.getAllTasks();
console.log("All tasks:", tasks);

// Create a new task
const newTask = await api.createTask("Learn React", "Complete React tutorial");
console.log("Created:", newTask);

// Mark task as completed
if (newTask) {
  await api.toggleTask(newTask._id, newTask.status);
}

// Delete a task
if (newTask) {
  await api.deleteTask(newTask._id);
}
```

## Error Handling

Always handle errors when making API calls:

```javascript
async function safeAPICall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }
}

// Usage
const result = await safeAPICall(() => api.createTask("New Task"));
if (result.success) {
  console.log("Task created:", result.data);
} else {
  console.error("Failed:", result.error);
}
```
