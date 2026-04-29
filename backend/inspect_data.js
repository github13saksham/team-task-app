require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    include: {
      assignee: true,
      project: true
    }
  });
  console.log('--- ALL TASKS ---');
  tasks.forEach(t => {
    console.log(`Task: ${t.title} | Assignee: ${t.assignee?.name || 'NONE'} (${t.assigneeId}) | Project: ${t.project.name}`);
  });
}

main().finally(() => prisma.$disconnect());
