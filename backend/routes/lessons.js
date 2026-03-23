const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { awardPoints } = require('../services/gamification.service');

const prisma = new PrismaClient();

router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: { module: { include: { course: true } } }
    });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const progress = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId: req.user.id, lessonId: lesson.id } }
    });
    res.json({ ...lesson, progress });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, upload.single('video'), async (req, res) => {
  const { title, content, moduleId, duration } = req.body;
  try {
    const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (module.course.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const count = await prisma.lesson.count({ where: { moduleId } });
    const lesson = await prisma.lesson.create({
      data: { title, content, moduleId, videoUrl: req.file?.path || null,
        duration: parseInt(duration) || null, order: count + 1 }
    });
    res.status(201).json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  const { title, content, order, duration } = req.body;
  try {
    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data: { title, content, order, duration } });
    res.json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id }, include: { module: true } });
    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId: req.params.id } },
      update: { completed: true, completedAt: new Date() },
      create: { userId: req.user.id, lessonId: req.params.id, completed: true, completedAt: new Date() }
    });
    await awardPoints(req.user.id, 'LESSON_COMPLETED');
    await checkCourseCompletion(req.user.id, lesson.module.courseId);
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function checkCourseCompletion(userId, courseId) {
  const allLessons = await prisma.lesson.findMany({ where: { module: { courseId } }, select: { id: true } });
  const completedCount = await prisma.progress.count({
    where: { userId, lessonId: { in: allLessons.map(l => l.id) }, completed: true }
  });
  if (completedCount === allLessons.length) {
    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { completed: true, completedAt: new Date() }
    });
    await awardPoints(userId, 'COURSE_COMPLETED');
  }
}

module.exports = router;
