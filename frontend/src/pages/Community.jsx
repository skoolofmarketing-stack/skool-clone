import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommunity, getPosts, createPost, likePost } from '../api/communities.api';
import useAuthStore from '../store/auth.store';
import { Avatar, Button, Spinner } from '../components/ui/index.jsx';

export default function Community() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState('');

  const { data: community } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => getCommunity(slug).then(r => r.data)
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', community?.id],
    queryFn: () => getPosts(community.id).then(r => r.data),
    enabled: !!community?.id
  });

  const addPost = useMutation({
    mutationFn: createPost,
    onSuccess: () => { setNewPost(''); queryClient.invalidateQueries(['posts', community.id]); }
  });

  const like = useMutation({
    mutationFn: likePost,
    onSuccess: () => queryClient.invalidateQueries(['posts', community.id])
  });

  if (!community || isLoading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{community.name}</h1>
        <p className="text-gray-500 mt-1">{community.description}</p>
        <p className="text-sm text-gray-400 mt-2">{community._count?.memberships} members</p>
      </div>

      {isAuthenticated && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex gap-3">
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <textarea className="flex-1 resize-none text-sm border-none outline-none placeholder-gray-400"
              placeholder="Share something..." rows={3} value={newPost}
              onChange={e => setNewPost(e.target.value)} />
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={() => addPost.mutate({ content: newPost, communityId: community.id })}
              loading={addPost.isPending} className="text-sm px-4 py-1.5">Post</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts?.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
              <div>
                <p className="text-sm font-semibold">{post.author.name}</p>
                <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {post.title && <h3 className="font-semibold mb-1">{post.title}</h3>}
            <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
              <button onClick={() => like.mutate(post.id)} className="flex items-center gap-1 hover:text-primary">
                ♥ {post._count.likes}
              </button>
              <span>💬 {post._count.comments} comments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
