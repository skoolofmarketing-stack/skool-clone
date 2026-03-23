const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { getNextLevel } = require('../config/points');

const prisma = new PrismaClient();

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { points: 'desc' }, take: 50,
      select: { id: true, name: true, avatar: true, points: true, level: true,
        _count: { select: { posts: true } } }
    });
    res.json(users.map((u, i) => ({ ...u, rank: i + 1 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leaderboard/community/:communityId', async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: { communityId: req.params.communityId },
      include: { user: { select: { id: true, name: true, avatar: true, points: true, level: true,
        _count: { select: { posts: true } } } } },
      orderBy: { user: { points: 'desc' } }, take: 50
    });
    res.json(memberships.map((m, i) => ({ ...m.user, rank: i + 1 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me/stats', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { points: true, level: true,
        _count: { select: { posts: true, comments: true, enrollments: true } } }
    });
    const nextLevel = getNextLevel(user.points);
    const progress = nextLevel ? Math.round((user.points / nextLevel.minPoints) * 100) : 100;
    res.json({ ...user, nextLevel, progressToNextLevel: progress });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me/badges', auth, async (req, res) => {
  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: req.user.id }, include: { badge: true }, orderBy: { earnedAt: 'desc' }
    });
    res.json(userBadges);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me/points-log', auth, async (req, res) => {
  try {
    const logs = await prisma.pointLog.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50
    });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
