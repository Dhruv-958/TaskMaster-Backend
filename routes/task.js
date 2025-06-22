import express from 'express';
import {getTaskById, deleteTaskById, getAllTasks, createTask} from '../controllers/taskController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/all', authMiddleware, getAllTasks);
router.get('/:id', authMiddleware, getTaskById);
router.delete('/:id', authMiddleware, deleteTaskById);
router.post('/create', authMiddleware, createTask);

export default router;

