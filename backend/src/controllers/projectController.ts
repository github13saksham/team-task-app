import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) return res.status(401).json({ message: 'Unauthorized' });
    if (!name?.trim()) return res.status(400).json({ message: 'Project name is required' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId,
        members: { connect: { id: ownerId } }
      },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const projects = await prisma.project.findMany({
      where: {
        members: { some: { id: userId } }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { tasks: true, members: true } }
      }
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: { some: { id: userId } }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { tasks: true, members: true } }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { select: { id: true } } }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.ownerId === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only project owner or admins can add members' });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: `No user found with email: ${email}` });
    }

    const alreadyMember = project.members.some(m => m.id === userToAdd.id);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { members: { connect: { id: userToAdd.id } } }
    });

    res.json({ message: 'Member added successfully', user: { name: userToAdd.name, email: userToAdd.email } });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.ownerId === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (memberId === project.ownerId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { members: { disconnect: { id: memberId } } }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only Owner or Admin can delete
    const isOwner = project.ownerId === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this project' });
    }

    // Delete tasks first (Prisma should handle cascaded delete if configured, but let's be safe)
    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};
