
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './views/Landing';
import AuthPage from './views/Auth/AuthPage';
import StudentDashboard from './views/Dashboards/StudentDashboard';
import WardenDashboard from './views/Dashboards/WardenDashboard';
import WorkerDashboard from './views/Dashboards/WorkerDashboard';
import { mockStore } from './services/mockStore';
import { User, Complaint } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const user = mockStore.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);

    const createAutoInternetComplaint = (user: User) => {
      if (user.role !== 'student') return;

      const complaints = mockStore.getComplaints();
      const existingIssue = complaints.find(c => 
        c.studentId === user.uid && 
        c.category === 'Internet' && 
        (c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'In Progress')
      );

      if (!existingIssue) {
        const autoComplaint: Complaint = {
          id: `auto-${Math.random().toString(36).substr(2, 5)}`,
          title: "System Detected: Internet Connection Lost",
          description: `Automatic report: The ResidentResolve system detected a loss of internet connectivity at ${new Date().toLocaleTimeString()}. The resident is currently offline.`,
          category: "Internet",
          priority: "High",
          status: 'Submitted',
          studentId: user.uid,
          studentName: user.name,
          roomNumber: user.roomNumber || 'N/A',
          hostelName: user.hostelName || 'Unknown Hostel',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        mockStore.saveComplaint(autoComplaint);
        console.log("Internet issue auto-reported locally.");
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      const activeUser = mockStore.getCurrentUser();
      if (activeUser) {
        createAutoInternetComplaint(activeUser);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (user: User) => {
    mockStore.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleUpdateUser = (updatedUser: User) => {
    mockStore.saveUser(updatedUser);
    mockStore.setCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleLogout = () => {
    mockStore.setCurrentUser(null);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white py-2 px-4 text-center font-bold text-sm shadow-lg flex items-center justify-center animate-in slide-in-from-top duration-300">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0-12.728L5.636 18.364m12.728-12.728L5.636 5.636m12.728 12.728L5.636 18.364" />
          </svg>
          No internet connection. An automatic report has been logged.
        </div>
      )}
      <Layout user={currentUser} onLogout={handleLogout}>
        <div className={!isOnline ? "pt-10" : ""}>
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Landing onLogin={handleLogin} />
                )
              } 
            />

            <Route 
              path="/auth/:type" 
              element={
                currentUser ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AuthPage onLogin={handleLogin} />
                )
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                currentUser ? (
                  currentUser.role === 'student' ? <StudentDashboard user={currentUser} /> :
                  currentUser.role === 'warden' ? <WardenDashboard user={currentUser} /> :
                  <WorkerDashboard user={currentUser} onUpdateUser={handleUpdateUser} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
};

export default App;
