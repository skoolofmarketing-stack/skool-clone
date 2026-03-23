import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../api/courses.api';
import { Avatar, Spinner } from '../components/ui/index.jsx';

const getRankEmoji = (rank) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard().then(r => r.data)
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
      <p className="text-gray-500 text-sm mb-8">Top members ranked by points</p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {leaderboard?.map((user) => (
          <div key={user.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <span className="w-8 text-center font-bold text-gray-400">{getRankEmoji(user.rank)}</span>
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-400">Level {user.level} · {user._count.posts} posts</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{user.points}</p>
              <p className="text-xs text-gray-400">points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
