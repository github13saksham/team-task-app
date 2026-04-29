import { Router } from 'express';
import { createProject, getProjects, getProjectById, addMember, removeMember, deleteProject } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:projectId', getProjectById);
router.post('/:projectId/members', addMember);
router.delete('/:projectId/members/:memberId', removeMember);
router.delete('/:projectId', deleteProject);

export default router;
