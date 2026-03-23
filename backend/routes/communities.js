const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      include: { _count: { select: { memberships: true, posts: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(communities);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { memberships: true } } }
    });
    if (!community) return res.status(404).json({ error: 'Not found' });
    res.json(community);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { name, description, isPrivate } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  try {
    const community = await prisma.community.create({
      data: { name, slug, description, isPrivate,
        memberships: { create: { userId: req.user.id, role: 'owner' } } }
    });
    res.status(201).json(community);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const membership = await prisma.membership.create({
      data: { userId: req.user.id, communityId: req.params.id }
    });
    res.status(201).json(membership);
  } catch { res.status(500).json({ error: 'Already a member or community not found' }); }
});

router.delete('/:id/leave', auth, async (req, res) => {
  try {
    await prisma.membership.delete({
      where: { userId_communityId: { userId: req.user.id, communityId: req.params.id } }
    });
    res.json({ message: 'Left community' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
