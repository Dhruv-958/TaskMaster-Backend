import express from 'express';
import { getExample, createExample } from '../controllers/exampleController.js';

const router = express.Router();

router.get('/example', getExample);
router.post('/example', createExample);

export default router;
