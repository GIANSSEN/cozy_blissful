import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          <p className="text-slate-400 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If authenticated but role is not allowed, show an elegant Access Denied layout
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="glass max-w-md w-full p-8 rounded-2xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-950/50 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Access Denied</h2>
            <p className="text-slate-400 text-sm">
              Your account role (<strong>{role}</strong>) does not have permission to access this section.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
