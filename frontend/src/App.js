import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LoginDebug from './components/auth/LoginDebug';

// Admin Components
import AdminHome from './components/admin/AdminHome';
import BooksList from './components/admin/BooksList';
import AddBook from './components/admin/AddBook';
import EditBook from './components/admin/EditBook';
import MembershipsList from './components/admin/MembershipsList';
import AddMembership from './components/admin/AddMembership';
import EditMembership from './components/admin/EditMembership';
import UsersList from './components/admin/UsersList';
import AddUser from './components/admin/AddUser';
import EditUser from './components/admin/EditUser';

// User Components
import UserHome from './components/user/UserHome';
import BookAvailability from './components/user/BookAvailability';
import BookIssue from './components/user/BookIssue';
import ReturnBook from './components/user/ReturnBook';
import PayFine from './components/user/PayFine';
import Profile from './components/user/Profile';

// Report Components
import AllBooks from './components/reports/AllBooks';
import AllMovies from './components/reports/AllMovies';
import AllMemberships from './components/reports/AllMemberships';
import ActiveIssues from './components/reports/ActiveIssues';
import OverdueBooks from './components/reports/OverdueBooks';

// Shared Components
import NotFound from './components/shared/NotFound';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminRoute from './components/shared/AdminRoute';

// Context
import { useAuth } from './context/AuthContext';

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Header />
      <div className="container page-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} /> : <Register />} />
          <Route path="/debug-login" element={<LoginDebug />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
          <Route path="/admin/books" element={<AdminRoute><BooksList /></AdminRoute>} />
          <Route path="/admin/books/add" element={<AdminRoute><AddBook /></AdminRoute>} />
          <Route path="/admin/books/edit/:id" element={<AdminRoute><EditBook /></AdminRoute>} />
          <Route path="/admin/memberships" element={<AdminRoute><MembershipsList /></AdminRoute>} />
          <Route path="/admin/memberships/add" element={<AdminRoute><AddMembership /></AdminRoute>} />
          <Route path="/admin/memberships/edit/:id" element={<AdminRoute><EditMembership /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />
          <Route path="/admin/users/add" element={<AdminRoute><AddUser /></AdminRoute>} />
          <Route path="/admin/users/edit/:id" element={<AdminRoute><EditUser /></AdminRoute>} />
          
          {/* User Routes */}
          <Route path="/user" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
          <Route path="/book-availability" element={<ProtectedRoute><BookAvailability /></ProtectedRoute>} />
          <Route path="/issue-book" element={<ProtectedRoute><BookIssue /></ProtectedRoute>} />
          <Route path="/return-book" element={<ProtectedRoute><ReturnBook /></ProtectedRoute>} />
          <Route path="/pay-fine" element={<ProtectedRoute><PayFine /></ProtectedRoute>} />
          
          {/* Shared User Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Report Routes */}
          <Route path="/reports/books" element={<ProtectedRoute><AllBooks /></ProtectedRoute>} />
          <Route path="/reports/movies" element={<ProtectedRoute><AllMovies /></ProtectedRoute>} />
          <Route path="/reports/memberships" element={<ProtectedRoute><AllMemberships /></ProtectedRoute>} />
          <Route path="/reports/active-issues" element={<ProtectedRoute><ActiveIssues /></ProtectedRoute>} />
          <Route path="/reports/overdue" element={<ProtectedRoute><OverdueBooks /></ProtectedRoute>} />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/user') : '/login'} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Router>
  );
};

export default App; 