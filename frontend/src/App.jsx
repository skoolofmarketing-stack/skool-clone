import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/auth.store';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Community from './pages/Community';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/community/:slug" element={<Community />} />
          <Route path="/courses"         element={<Courses />} />
          <Route path="/leaderboard"     element={<Leaderboard />} />
          <Route path="/profile"         element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

5. Click **"Commit changes"** ✅

---

## Important — make sure the path looks like this in GitHub:
```
frontend/src/App.jsx   ✅  (correct)
frontend/App.jsx       ❌  (wrong — this is where it is now)
```

When you're creating the file, the breadcrumb at the top of GitHub should show:
```
skool-clone / frontend / src /
