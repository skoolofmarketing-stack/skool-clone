const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.post('/', auth, async (req, res) => {
  const { title, courseId } = req.body;
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const count = await prisma.module.count({ where: { courseId } });
    const module = await prisma.module.create({ data: { title, courseId, order: count + 1 } });
    res.status(201).json(module);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, async (req, res) => {
  const { title, order } = req.body;
  try {
    const module = await prisma.module.update({ where: { id: req.params.id }, data: { title, order } });
    res.json(module);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.json({ message: 'Module deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
