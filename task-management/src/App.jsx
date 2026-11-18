
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// API configuration
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '')
).replace(/\/+$/, '');

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Display error messages
  const handleError = (err, message) => {
    console.error(message, err);

    if (!API_URL) {
      setError('Backend URL is not configured. Check VITE_API_URL in Vercel.');
    } else if (err.response) {
      setError(
        err.response.data?.message ||
        `${message}. Server error: ${err.response.status}`
      );
    } else if (err.request) {
      setError('Cannot connect to backend. Check your Render service.');
    } else {
      setError(message);
    }
  };

  // Fetch all tasks
  const loadTasks = async () => {
    try {
      if (!API_URL) {
        throw new Error('Backend URL is not configured.');
      }

      const response = await api.get('/tasks');
      setTasks(response.data);
      setError('');
    } catch (err) {
      handleError(err, 'Could not fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Create a new task
  const createTask = async () => {
    if (!title.trim()) {
      setError('Task cannot be empty.');
      return;
    }

    try {
      const response = await api.post('/tasks', {
        title: title.trim(),
        status: 'pending'
      });

      setTasks((currentTasks) => [
        ...currentTasks,
        response.data
      ]);

      setTitle('');
      setError('');
      setSuccess('Task created successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      handleError(err, 'Could not create task');
    }
  };

  // Update task status
  const updateTask = async (id, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${id}`, {
        status: newStatus
      });

      const updatedTask = response.data;

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );

      setError('');
      setSuccess('Task updated successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      handleError(err, 'Could not update task');
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id)
      );

      setError('');
      setSuccess('Task deleted successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      handleError(err, 'Could not delete task');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Task Manager</h1>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Add task */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') createTask();
          }}
          placeholder="Enter task title"
        />

        <button
          className="btn btn-primary"
          onClick={createTask}
          disabled={!API_URL}
        >
          Add Task
        </button>
      </div>

      {/* Task categories */}
      <div className="row">
        {['pending', 'in progress', 'completed'].map((status) => {
          const filteredTasks = tasks.filter(
            (task) => task.status === status
          );

          return (
            <div className="col-md-4" key={status}>
              <div className="card mb-4">
                <div className="card-header">
                  <h5>
                    {status === 'in progress'
                      ? 'Ongoing'
                      : status.charAt(0).toUpperCase() +
                        status.slice(1)} Tasks
                  </h5>
                </div>

                <div className="card-body">
                  {loading ? (
                    <p className="text-muted">Loading tasks...</p>
                  ) : filteredTasks.length === 0 ? (
                    <p className="text-muted">
                      No tasks in this category.
                    </p>
                  ) : (
                    filteredTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onUpdateStatus={updateTask}
                        onDelete={deleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Individual task card
const TaskCard = ({ task, onUpdateStatus, onDelete }) => {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h6 className="card-title">{task.title}</h6>

        <p className="card-text">
          Status: {task.status}
        </p>

        <div className="btn-group" role="group">
          {task.status !== 'in progress' && (
            <button
              className="btn btn-info"
              onClick={() =>
                onUpdateStatus(task._id, 'in progress')
              }
            >
              Mark as Ongoing
            </button>
          )}

          {task.status !== 'completed' && (
            <button
              className="btn btn-success"
              onClick={() =>
                onUpdateStatus(task._id, 'completed')
              }
            >
              Mark as Completed
            </button>
          )}

          <button
            className="btn btn-danger"
            onClick={() => onDelete(task._id)}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
