import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommunities, joinCommunity } from '../api/communities.api';
import useAuthStore from '../store/auth.store';
import { Button, Spinner } from '../components/ui/index.jsx';
import { Link } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: communities, isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: () => getCommunities().then(r => r.data)
  });

  const join = useMutation({
    mutationFn: joinCommunity,
    onSuccess: () => queryClient.invalidateQueries(['communities'])
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Communities</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities?.map(community => (
          <div key={community.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <h2 className="font-semibold text-lg">{community.name}</h2>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{community.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-400">
                {community._count.memberships} members · {community._count.posts} posts
              </span>
              {isAuthenticated ? (
                <Button variant="outline" className="text-xs px-3 py-1" onClick={() => join.mutate(community.id)}>Join</Button>
              ) : (
                <Link to={`/community/${community.slug}`}>
                  <Button variant="outline" className="text-xs px-3 py-1">View</Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
