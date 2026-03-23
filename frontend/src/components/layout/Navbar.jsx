import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth.store';
import { Avatar } from '../ui/index.jsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path
    ? 'text-primary font-semibold'
    : 'text-gray-600 hover:text-primary';

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-primary tracking-tight">Skool</Link>

      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/"            className={isActive('/')}>Community</Link>
        <Link to="/courses"     className={isActive('/courses')}>Courses</Link>
        <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <Avatar src={user?.avatar} name={user?.name} size="sm" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-primary">Login</Link>
            <Link to="/register" className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
