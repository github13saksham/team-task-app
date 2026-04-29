import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority, dueDate, projectId, assigneeId } = req.body;
    
    // Proper Validations
    if (!title?.trim()) return res.status(400).json({ message: 'Task title is required' });
    if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null
      },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.query;
    const where: any = {};
    if (projectId) where.projectId = projectId as string;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, assigneeId, priority, title, description, dueDate } = req.body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (priority !== undefined) updateData.priority = priority;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true } } }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check permissions: Admin or Project Owner
    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = task.project.ownerId === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized to delete this task' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (userRole === 'ADMIN') {
      const [totalTasks, completedTasks, projectCount, memberCount, overdueTasks, projects] = await Promise.all([
        prisma.task.count(),
        prisma.task.count({ where: { status: 'DONE' } }),
        prisma.project.count(),
        prisma.user.count(),
        prisma.task.count({
          where: {
            status: { not: 'DONE' },
            dueDate: { lt: new Date() }
          }
        }),
        prisma.project.findMany({
          take: 5,
          include: { _count: { select: { tasks: true } } }
        })
      ]);
      return res.json({ 
        totalTasks, 
        completedTasks, 
        pendingTasks: totalTasks - completedTasks,
        projectCount, 
        memberCount,
        overdueTasks,
        projects 
      });
    } else {
      const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
        prisma.task.count({ where: { assigneeId: userId } }),
        prisma.task.count({ where: { assigneeId: userId, status: 'DONE' } }),
        prisma.task.count({
          where: {
            assigneeId: userId,
            status: { not: 'DONE' },
            dueDate: { lt: new Date() }
          }
        })
      ]);
      return res.json({ 
        totalTasks, 
        pendingTasks: totalTasks - completedTasks, 
        completedTasks, 
        overdueTasks 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};
