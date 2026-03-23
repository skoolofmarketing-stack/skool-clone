import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/auth.api';
import { getEnrolled, getMyStats, getMyBadges } from '../api/courses.api';
import { Avatar, Spinner } from '../components/ui/index.jsx';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => getMe().then(r => r.data) });
  const { data: enrolled } = useQuery({ queryKey: ['enrolled'], queryFn: () => getEnrolled().then(r => r.data) });
  const { data: stats } = useQuery({ queryKey: ['myStats'], queryFn: () => getMyStats().then(r => r.data) });
  const { data: badges } = useQuery({ queryKey: ['myBadges'], queryFn: () => getMyBadges().then(r => r.data) });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center gap-6 mb-6">
        <Avatar src={user?.avatar} name={user?.name} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.bio && <p className="text-gray-600 mt-2 text-sm">{user.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span>⭐ {user?.points} points</span>
            <span>🏆 Level {user?.level}</span>
            <span>📝 {user?._count?.posts} posts</span>
          </div>
        </div>
      </div>

      {stats?.nextLevel && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Level {stats.level}</span>
            <span>{stats.points} / {stats.nextLevel.minPoints} pts to Level {stats.nextLevel.level}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${stats.progressToNextLevel}%` }} />
          </div>
        </div>
      )}

      <h2 className="font-semibold text-lg mb-3">Badges</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {badges?.map(({ badge, earnedAt }) => (
          <div key={badge.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <span className="text-3xl">{badge.icon}</span>
            <div>
              <p className="text-sm font-semibold">{badge.name}</p>
              <p className="text-xs text-gray-400">{badge.description}</p>
            </div>
          </div>
        ))}
        {badges?.length === 0 && <p className="text-gray-400 text-sm col-span-2">No badges yet — keep engaging!</p>}
      </div>

      <h2 className="font-semibold text-lg mb-3">My Courses</h2>
      <div className="space-y-3">
        {enrolled?.map(({ course }) => (
          <Link to={`/courses/${course.slug}`} key={course.id}>
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{course.title}</p>
                <p className="text-xs text-gray-400">{course._count.modules} modules</p>
              </div>
            </div>
          </Link>
        ))}
        {enrolled?.length === 0 && (
          <p className="text-gray-400 text-sm">No courses yet. <Link to="/courses" className="text-primary">Browse courses →</Link></p>
        )}
      </div>
    </div>
  );
}
