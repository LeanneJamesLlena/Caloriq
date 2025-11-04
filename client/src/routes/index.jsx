import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login/Login';
import Register from '../pages/Auth/Register/Register';
import Diary from '../pages/Diary/Diary'; 
import History from '../pages/History/History';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound/NotFound';
import useAuthStore from '../store/authStore';

/*
 AuthedRoute:
 Wrapper component that restricts access to authenticated users only.
 If no user is logged in, redirects to the login page.
 */
function AuthedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  return user ? children : <Navigate to="/login" replace />;
}

/*
 GuestRoute:
 Wrapper component that prevents logged-in users from accessing guest pages
 like Login or Register. Redirects authenticated users to /diary.
 */
function GuestRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  return user ? <Navigate to="/diary" replace /> : children;
}

// Define all routes
// Uses AuthedRoute or GuestRoute wrappers for different access
export const router = createBrowserRouter([

  {
    path: '/',
    element: <Navigate to="/diary" replace />,
  },
  // Public routes (accessible only when logged out)
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
   // Private routes (require authentication)
  {
    path: '/diary',
    element: (
      <AuthedRoute>
        <Diary />
      </AuthedRoute>
    ),
  },
  {
    path: '/history',
    element: (
      <AuthedRoute>
        <History />
      </AuthedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <AuthedRoute>
        <Settings />
      </AuthedRoute>
    ),
  },
    // Catch all route for non existing paths
  { path: '*', element: <NotFound /> },
]);
