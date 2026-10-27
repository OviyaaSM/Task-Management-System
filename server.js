const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//connect to mongoDB
mongoose
.connect("mongodb://localhost:27017/taskmanager",{})
.then(() => console.log("connected to MongoDB"))
.catch((err) => console.log("cannot connect to mongodb:", err));

//define task schema and model
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required : true
    },
    status : {
        type: String,
        enum: ['pending', 'in progress', 'completed'],
        default : 'pending'
    },
},
{timestamps: true}
);

const Task = mongoose.model('Task', TaskSchema);

//routes
//fetch
app.get('/tasks',async(req,res)=>{
    try{
        const tasks = await Task.find();
        res.json(tasks);
    }
    catch(err){
        res.status(500).json({message:"couldnt fetch tasks"});
    }
});
//create new task
app.post('/tasks', async(req, res)=>{
    const {title, status} = req.body;
    const task = new Task({title,status});
    try{
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    }catch(err){
        res.status(400).json({message:"couldnt create task"});
    }
});
//update task
app.patch('/tasks/:id',async(req,res)=>{
    const { status } = req.body;
    try {
        const updatedTask  = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if(!updatedTask){
            return res.status(404).json({ message:"Task not found." });
        }
        res.json(updatedTask); 
    }
    catch(err){
        res.status(400).json({message:"couldnt update task"});
    }
});
//delete tasks
app.delete('/tasks/:id',async(req,res)=>{
    const {id} = req.params;
    try{
        const deletedTask = await Task.findByIdAndDelete(id);
        if(!deletedTask){
            return res.status(404).json({message:"task not found"});
        }
        res.json({message:"task deleted successfully"});
    }catch(err){
        res.status(400).json({message:"couldnt delete task"});
    }
});

//server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> {
    console.log(`server is running on port ${PORT}`);
});