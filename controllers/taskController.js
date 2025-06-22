import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import axios from 'axios';

export const createTask = async (req, res) => {
  try {
    const { title, description, timeTaken } = req.body;
    const userId = req.user._id;

    // 1. Daily limit check (max 3 tasks)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const taskCount = await Task.countDocuments({
      userId,
      createdAt: { $gte: today, $lt: tomorrow },
    });

    if (taskCount >= 3) {
      return res.status(403).json({ message: 'You can only create 3 tasks per day' });
    }

    // 2. Score task via ML model
    let score = 0;
    try {
      const response = await axios.post('http://127.0.0.1:8000/score', {
        title,
        description,
        timeTaken,
      });
      score = response.data.score;
    } catch (err) {
      console.error('Error scoring task:', err.message);
      return res.status(500).json({ message: 'Task scoring failed' });
    }

    // 3. Save task with score
    const newTask = new Task({
      title,
      description,
      timeTaken,
      score,
      userId,
    });

    await newTask.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findOne({ _id: taskId, userId }).populate('userId', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//delete task by id
export const deleteTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all tasks 
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('userId', 'name email');

    if (!tasks.length) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


