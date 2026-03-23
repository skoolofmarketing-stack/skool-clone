const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { awardPoints } = require('../services/gamification.service');

const prisma = new PrismaClient();

router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      include: { author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { content, postId } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: { content, postId, authorId: req.user.id },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    await awardPoints(req.user.id, 'COMMENT_CREATED');
    res.status(201).json(comment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (comment.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const existing = await prisma.like.findUnique({
      where: { userId_commentId: { userId: req.user.id, commentId: req.params.id } }
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }
    await prisma.like.create({ data: { userId: req.user.id, commentId: req.params.id } });
    res.json({ liked: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
