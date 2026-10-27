import {useState, useEffect} from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  //fetch tasks
  useEffect(()=>{
    const loadTasks = async () => {
      try{
        const response = await axios.get('http://localhost:5000/tasks');
        setTasks(response.data);
      }catch(err){
        setError("couldnt fetch tasks");
        console.error(err);
      }
    };

    loadTasks();
  },[]);

  //create new task
  const createTask = async()=>{
    if(!title.trim()){
      setError("task cant be empty");
      return;
    }
    try{
      const response = await axios.post('http://localhost:5000/tasks',{title,status:"pending"});
      setTasks((currentTasks) => [...currentTasks, response.data]);
      setTitle('');
      setError(null);
      setSuccess("task created successfully");
      setTimeout(()=>setSuccess(null),3000);
    }catch(err){
      setError("couldnt create task");
      console.error(err);
    }
  };

  //update task
  const updateTask = async(id, newStatus)=>{
    try{
      const response = await axios.patch(`http://localhost:5000/tasks/${id}`,{status:newStatus});
      const updatedTask = response.data;
      setTasks((currentTasks) =>
        currentTasks.map(task => task._id === updatedTask._id ? updatedTask : task)
      );
      setError(null);
      setSuccess("task updated successfully");
      setTimeout(()=>setSuccess(null),3000);
    }
    catch(err){
      setError("couldnt update task");
      console.log(err);
    }
  };

  //delete tasks
  const deleteTask = async(id)=>{
    try{
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      setTasks((currentTasks) => currentTasks.filter(task => task._id !== id));
      setError(null);
      setSuccess("task deleted successfully");
      setTimeout(()=> setSuccess(null),3000);
    }catch(err){
      setError("couldnt delete task");
      console.log(err);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Task Manager</h1>

      {error&&<div className="alert alert-danger">{error}</div>}{/* Show error message */}
      {success&&<div className="alert alert-success">{success}</div>}{/* Show success message */}

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) =>setTitle(e.target.value)}
          placeholder="Enter task title"
        />
        <button className="btn btn-primary" onClick={createTask}>Add Task</button>
      </div>

      <div className="row">
        {["pending", "in progress", "completed"].map((status) => (
          <div className="col-md-4" key={status}>
            <div className="card mb-4">
              <div className="card-header">
                <h5>
                  {status === "in progress"
                    ? "Ongoing"
                    : status.charAt(0).toUpperCase() + status.slice(1)} Tasks
                </h5>
              </div>
              <div className="card-body">
                {tasks.filter(task=>task.status === status).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdateStatus={updateTask}
                    onDelete={deleteTask}
                  />
                ))}
                {tasks.filter(task=>task.status === status).length === 0&& (
                  <p className="text-muted">No tasks in this category.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const TaskCard = ({ task, onUpdateStatus, onDelete }) => {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h6 className="card-title">{task.title}</h6>
        <p className="card-text">Status: {task.status}</p>
        <div className="btn-group" role="group">
          {task.status !== "in progress"&& (
            <button
              className="btn btn-info"
              onClick={() => onUpdateStatus(task._id, "in progress")}
            >
              Mark as Ongoing
            </button>
          )}
          {task.status !== "completed"&& (
            <button
              className="btn btn-success"
              onClick={() => onUpdateStatus(task._id, "completed")}
            >
              Mark as Completed
            </button>
          )}
          <button className="btn btn-danger" onClick={() => onDelete(task._id)}>
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;