const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { seedBadges } = require('./services/gamification.service');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost')) return callback(null, true);
    if (origin.includes('vercel.app')) return callback(null, true);
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/communities',  require('./routes/communities'));
app.use('/api/posts',        require('./routes/posts'));
app.use('/api/comments',     require('./routes/comments'));
app.use('/api/courses',      require('./routes/courses'));
app.use('/api/modules',      require('./routes/modules'));
app.use('/api/lessons',      require('./routes/lessons'));
app.use('/api/progress',     require('./routes/progress'));
app.use('/api/gamification', require('./routes/gamification'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedBadges();
});
