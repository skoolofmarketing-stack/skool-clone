import { useQuery, useMutation } from '@tanstack/react-query';
import { getCourses, enrollCourse } from '../api/courses.api';
import { Link } from 'react-router-dom';
import { Button, Spinner } from '../components/ui/index.jsx';
import useAuthStore from '../store/auth.store';

export default function Courses() {
  const { isAuthenticated } = useAuthStore();
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses().then(r => r.data)
  });
  const enroll = useMutation({ mutationFn: enrollCourse });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses?.map(course => (
          <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-full h-40 bg-gradient-to-br from-primary to-purple-400" />
            <div className="p-5">
              <h2 className="font-semibold text-lg line-clamp-2">{course.title}</h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <span>{course._count.modules} modules</span>
                <span>·</span>
                <span>{course._count.enrollments} enrolled</span>
                <span>·</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Link to={`/courses/${course.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full text-sm">View</Button>
                </Link>
                {isAuthenticated && (
                  <Button className="flex-1 text-sm" onClick={() => enroll.mutate(course.id)}>Enroll</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
