import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask, getMyTasks, getDashboardStats } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/my-tasks', getMyTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.get('/dashboard', getDashboardStats);

export default router;
