import express from 'express';
import { getUserProfile, getAllUsersScore, getUserProfileById, updateUserProfile, deleteUserTasks, deleteUserProfile, changeUserPassword } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/profile/:id', authMiddleware, getUserProfileById);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.delete('/profile', authMiddleware, deleteUserProfile);
router.delete('/delete-tasks', authMiddleware, deleteUserTasks);
router.get('/get-all-scores', authMiddleware, getAllUsersScore);
router.put('/change-password', authMiddleware, changeUserPassword);

export default router;