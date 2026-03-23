const POINTS = {
  POST_CREATED:      20,
  COMMENT_CREATED:   10,
  POST_LIKED:         5,
  LESSON_COMPLETED:  10,
  COURSE_COMPLETED: 100,
  PROFILE_COMPLETED: 50,
  DAILY_LOGIN:       15,
};

const LEVELS = [
  { level: 1,  minPoints: 0     },
  { level: 2,  minPoints: 100   },
  { level: 3,  minPoints: 250   },
  { level: 4,  minPoints: 500   },
  { level: 5,  minPoints: 1000  },
  { level: 6,  minPoints: 2000  },
  { level: 7,  minPoints: 3500  },
  { level: 8,  minPoints: 5000  },
  { level: 9,  minPoints: 7500  },
  { level: 10, minPoints: 10000 },
];

const BADGES = [
  { name: 'First Post',        icon: '✍️',  condition: 'POSTS_1',     description: 'Created your first post' },
  { name: 'Conversationalist', icon: '💬',  condition: 'COMMENTS_10', description: 'Left 10 comments' },
  { name: 'Rising Star',       icon: '⭐',  condition: 'LEVEL_5',     description: 'Reached level 5' },
  { name: 'Scholar',           icon: '🎓',  condition: 'COURSES_1',   description: 'Completed a course' },
  { name: 'Veteran',           icon: '🏆',  condition: 'LEVEL_10',    description: 'Reached level 10' },
  { name: 'Enthusiast',        icon: '🔥',  condition: 'POSTS_10',    description: 'Created 10 posts' },
];

const getLevelForPoints = (points) =>
  [...LEVELS].reverse().find(l => points >= l.minPoints) || LEVELS[0];

const getNextLevel = (points) =>
  LEVELS.find(l => l.minPoints > points) || null;

module.exports = { POINTS, LEVELS, BADGES, getLevelForPoints, getNextLevel };
