const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://task-management-frontend-one-pi.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Atlas connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
    title: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ['pending', 'in progress', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Task Model
const Task = mongoose.model('Task', TaskSchema);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Task Management API is running'
  });
});

// Fetch all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Fetch error:', err.message);

    res.status(500).json({
      message: 'Could not fetch tasks'
    });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { title, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    const task = new Task({
      title: title.trim(),
      status: status || 'pending'
    });

    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Create error:', err.message);

    res.status(400).json({
      message: 'Could not create task'
    });
  }
});

// Update task status
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Update error:', err.message);

    res.status(400).json({
      message: 'Could not update task'
    });
  }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (err) {
    console.error('Delete error:', err.message);

    res.status(400).json({
      message: 'Could not delete task'
    });
  }
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB Atlas connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
}

startServer();