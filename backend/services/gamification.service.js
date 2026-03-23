const { PrismaClient } = require('@prisma/client');
const { POINTS, BADGES, getLevelForPoints } = require('../config/points');

const prisma = new PrismaClient();

async function awardPoints(userId, reason) {
  const points = POINTS[reason];
  if (!points) return;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
      pointLogs: { create: { points, reason } }
    }
  });

  const newLevel = getLevelForPoints(user.points);
  if (newLevel.level !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel.level }
    });
  }

  await checkBadges(userId);
  return { points, total: user.points };
}

async function checkBadges(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { posts: true, comments: true, enrollments: true } },
      userBadges: { select: { badgeId: true } }
    }
  });

  const earnedBadgeIds = user.userBadges.map(b => b.badgeId);

  const conditionMet = {
    POSTS_1:     user._count.posts >= 1,
    POSTS_10:    user._count.posts >= 10,
    COMMENTS_10: user._count.comments >= 10,
    COURSES_1:   user._count.enrollments >= 1,
    LEVEL_5:     user.level >= 5,
    LEVEL_10:    user.level >= 10,
  };

  const allBadges = await prisma.badge.findMany();
  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge.id)) continue;
    if (conditionMet[badge.condition]) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    }
  }
}

async function seedBadges() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    });
  }
  console.log('✅ Badges seeded');
}

module.exports = { awardPoints, checkBadges, seedBadges };
