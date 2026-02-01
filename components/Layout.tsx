
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { mockStore } from '../services/mockStore';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3 shadow-md">
                R
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ResidentResolve</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                    <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Welcome
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 bg-slate-50 pb-12">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} ResidentResolve Hostel Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
