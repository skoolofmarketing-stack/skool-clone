const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const allLessons = await prisma.lesson.findMany({
      where: { module: { courseId: req.params.courseId } }, select: { id: true }
    });
    const completed = await prisma.progress.findMany({
      where: { userId: req.user.id, lessonId: { in: allLessons.map(l => l.id) }, completed: true },
      select: { lessonId: true }
    });
    res.json({
      total: allLessons.length, completed: completed.length,
      percentage: allLessons.length ? Math.round((completed.length / allLessons.length) * 100) : 0,
      completedLessons: completed.map(p => p.lessonId)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
