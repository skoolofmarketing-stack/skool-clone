const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { awardPoints } = require('../services/gamification.service');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      include: { author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { enrollments: true, modules: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me/enrolled', auth, async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: { course: { include: { author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { modules: true } } } } }
    });
    res.json(enrollments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { id: true, name: true, avatar: true } },
        modules: { orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' },
            select: { id: true, title: true, duration: true, order: true, videoUrl: true } } } },
        _count: { select: { enrollments: true } } }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, upload.single('thumbnail'), async (req, res) => {
  const { title, description, communityId } = req.body;
  const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  try {
    const course = await prisma.course.create({
      data: { title, slug, description, thumbnail: req.file?.path || null,
        authorId: req.user.id, communityId: communityId || null }
    });
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  const { title, description, published } = req.body;
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (course.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const updated = await prisma.course.update({ where: { id: req.params.id }, data: { title, description, published } });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (course.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const enrollment = await prisma.enrollment.create({ data: { userId: req.user.id, courseId: req.params.id } });
    res.status(201).json(enrollment);
  } catch { res.status(500).json({ error: 'Already enrolled or course not found' }); }
});

module.exports = router;
