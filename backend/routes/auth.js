const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateAccessToken  = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
const generateRefreshToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true }
    });
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    const { password: _, refreshToken: __, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.refreshToken !== refreshToken) return res.status(403).json({ error: 'Invalid refresh token' });
    const newAccessToken  = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch { res.status(403).json({ error: 'Token expired or invalid' }); }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await prisma.user.update({ where: { id: payload.id }, data: { refreshToken: null } });
    res.json({ message: 'Logged out successfully' });
  } catch { res.status(400).json({ error: 'Invalid token' }); }
});

module.exports = router;
