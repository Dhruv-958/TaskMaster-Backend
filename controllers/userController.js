import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import axios from 'axios';
import bcrypt from 'bcrypt';

// create same upi but for all users i.e, return user-> name, email, totalScore of current month

export const getAllUsersScore = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Find all users
        const users = await User.find().select('-password');

        // Initialize an array to hold user scores
        const userScores = [];

        for (const user of users) {
            // Find all tasks for the user in the current month
            const tasks = await Task.find({
                userId: user._id,
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            // Calculate total score for the user
            const totalScore = tasks.reduce((sum, task) => sum + task.score, 0);

            userScores.push({
                id: user._id,
                name: user.name,
                email: user.email,
                totalScore
            });
        }

        // sort userScores by totalScore in descending order
        userScores.sort((a, b) => b.totalScore - a.totalScore);

        res.status(200).json(userScores);
    } catch (error) {
        console.error('Error fetching all users score:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// get user profile and tasks of authorized user take id from saved token, also calculate total score and total score of current month
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the token
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all tasks for the user
        const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

        // Calculate total score and total score of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const totalScore = tasks.reduce((sum, task) => sum + task.score, 0);
        const monthlyTasks = tasks.filter(task => task.createdAt >= startOfMonth && task.createdAt <= endOfMonth);
        const monthlyScore = monthlyTasks.reduce((sum, task) => sum + task.score, 0);

        res.status(200).json({
            user,
            tasks,
            totalScore,
            monthlyScore
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// do the same but take id from param 
export const getUserProfileById = async (req, res) => {
    try {
        const userId = req.params.id; // Get user ID from the request parameters
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all tasks for the user
        const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

        // Calculate total score and total score of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const totalScore = tasks.reduce((sum, task) => sum + task.score, 0);
        const monthlyTasks = tasks.filter(task => task.createdAt >= startOfMonth && task.createdAt <= endOfMonth);
        const monthlyScore = monthlyTasks.reduce((sum, task) => sum + task.score, 0);

        res.status(200).json({
            user,
            tasks,
            totalScore,
            monthlyScore
        });
    } catch (error) {
        console.error('Error fetching user profile by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the token
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// delete all tasks of user from token , dont delete profile only tasks
export const deleteUserTasks = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the token

        // Delete all tasks of the user
        const result = await Task.deleteMany({ userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No tasks found for this user' });
        }

        res.status(200).json({ message: 'All tasks deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting user tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


// delete user profile , delete all tasks of user
export const deleteUserProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from the token

        // Delete all tasks of the user
        await Task.deleteMany({ userId });

        // Delete the user profile
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// change password for user
export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id; // user info from auth middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Compare passwords directly
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // ✅ Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};