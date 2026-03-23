const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const prisma = new PrismaClient();

router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatar: true, bio: true, points: true, level: true, createdAt: true,
        _count: { select: { posts: true, memberships: true } } }
    });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, avatar: true, bio: true, points: true, level: true, createdAt: true,
        _count: { select: { posts: true, memberships: true } } }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/me', auth, async (req, res) => {
  const { name, bio } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id }, data: { name, bio },
      select: { id: true, name: true, email: true, avatar: true, bio: true, points: true, level: true }
    });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await prisma.user.update({
      where: { id: req.user.id }, data: { avatar: req.file.path },
      select: { id: true, avatar: true }
    });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/me/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed, refreshToken: null } });
    res.json({ message: 'Password updated. Please log in again.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
