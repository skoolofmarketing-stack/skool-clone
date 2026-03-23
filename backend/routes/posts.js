const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { awardPoints } = require('../services/gamification.service');

const prisma = new PrismaClient();

router.get('/community/:communityId', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { communityId: req.params.communityId },
      include: { author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true, likes: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { title, content, image, communityId } = req.body;
  try {
    const post = await prisma.post.create({
      data: { title, content, image, communityId, authorId: req.user.id },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    await awardPoints(req.user.id, 'POST_CREATED');
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (post.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: req.user.id, postId: req.params.id } }
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }
    await prisma.like.create({ data: { userId: req.user.id, postId: req.params.id } });
    res.json({ liked: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
