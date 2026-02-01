
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { User, UserRole } from '../../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { type } = useParams<{ type: string }>(); // 'student' or 'staff'
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Role specific fields
  const [role, setRole] = useState<UserRole>(type === 'student' ? 'student' : 'warden');
  const [studentId, setStudentId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hostelName, setHostelName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const users = mockStore.getUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        onLogin(user);
        navigate('/dashboard');
      } else {
        alert('Account not found. Please register first!');
      }
    } else {
      const newUser: User = {
        uid: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: type === 'student' ? 'student' : role,
        ...(type === 'student' ? { studentId, roomNumber, hostelName } : {})
      };
      mockStore.saveUser(newUser);
      onLogin(newUser);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
            R
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isLogin ? 'Sign In' : 'Join Us'}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Access the {type === 'student' ? 'Student' : 'Staff'} Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
                placeholder="e.g. Alex Rivera"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
              placeholder="name@university.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && type === 'staff' && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Designation</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-bold text-slate-700"
              >
                <option value="warden">Hostel Warden</option>
                <option value="worker">Maintenance Technician</option>
              </select>
            </div>
          )}

          {!isLogin && type === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Roll Number</label>
                <input
                  required
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
                  placeholder="ID-2024-X"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Room No.</label>
                <input
                  required
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
                  placeholder="301"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Hostel</label>
                <input
                  required
                  type="text"
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
                  placeholder="Emerald Hall"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all mt-4"
          >
            {isLogin ? 'Enter Portal' : 'Register Me'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-indigo-600 font-black hover:text-indigo-800 transition-colors"
          >
            {isLogin ? "Need an account? Create one" : "Already registered? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
