
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockStore } from '../services/mockStore';
import { User, UserRole, HostelStats } from '../types';

interface LandingProps {
  onLogin: (user: User) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const hostelStats = useMemo(() => mockStore.getHostelStats(), []);
  
  const filteredStats = useMemo(() => {
    if (!searchQuery) return hostelStats;
    return hostelStats.filter(s => s.hostelName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, hostelStats]);

  const navigateToAuth = (type: 'student' | 'staff') => {
    navigate(`/auth/${type}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'fill-slate-200'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center pt-8 px-4 animate-in fade-in duration-500">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          ResidentResolve
          <span className="block text-indigo-600 mt-2 text-2xl md:text-4xl">Hostel Explorer & Performance Portal</span>
        </h1>
        
        {/* Hostel Explorer Search Bar */}
        <div className="max-w-3xl mx-auto mt-10 mb-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Enter hostel name to see performance ratings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-xl"
            />
          </div>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStats.length > 0 ? (
              filteredStats.map(stat => (
                <div key={stat.hostelName} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors">{stat.hostelName}</h3>
                    {stat.totalRaised > 0 && stat.rating >= 4.0 ? (
                      <div className="bg-emerald-50 p-1.5 rounded-lg">
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase">New Facility</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-6">
                    {renderStars(stat.rating)}
                    <span className="text-sm font-black text-slate-800">{stat.rating}/5.0</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <span>Performance</span>
                      <span className="text-indigo-600">
                        {stat.totalRaised > 0 
                          ? `${Math.round((stat.totalResolved / stat.totalRaised) * 100)}% Efficiency` 
                          : 'Initial Rating'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: stat.totalRaised > 0 ? `${(stat.totalResolved / stat.totalRaised) * 100}%` : '100%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                      <span>Total Issues: {stat.totalRaised}</span>
                      <span>Resolved: {stat.totalResolved}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 px-6 text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-300">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                No hostels found matching your search.
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-200 w-1/2 mx-auto mb-16"></div>

        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
          Ready to log in? Select your portal to manage maintenance or track requests.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto w-full mb-12">
          <button
            onClick={() => navigateToAuth('student')}
            className="group flex flex-col items-center p-10 bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-500 hover:-translate-y-2 transition-all text-center"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900 mb-2 tracking-tight">Student Portal</span>
            <span className="text-sm text-slate-500 leading-relaxed font-medium">View your hostel rating and raise room issues.</span>
          </button>

          <button
            onClick={() => navigateToAuth('staff')}
            className="group flex flex-col items-center p-10 bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-2 transition-all text-center"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900 mb-2 tracking-tight">Warden Admin</span>
            <span className="text-sm text-slate-500 leading-relaxed font-medium">Oversee multiple hostels and coordinate repairs.</span>
          </button>

          <button
            onClick={() => navigateToAuth('staff')}
            className="group flex flex-col items-center p-10 bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-500 hover:-translate-y-2 transition-all text-center"
          >
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900 mb-2 tracking-tight">Staff Tasks</span>
            <span className="text-sm text-slate-500 leading-relaxed font-medium">View and update your technical assignments.</span>
          </button>
        </div>

        {/* Demo Credentials Helper Section */}
        <div className="max-w-2xl mx-auto w-full bg-slate-900 text-white p-8 rounded-3xl shadow-xl mb-12 text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest">Demo Access Credentials</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6 font-medium">Use the following accounts to explore the different dashboards. (Password: any)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Student</span>
              <code className="text-xs font-bold block text-white">student@test.com</code>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Warden</span>
              <code className="text-xs font-bold block text-white">warden@test.com</code>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">Worker</span>
              <code className="text-xs font-bold block text-white">worker@test.com</code>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
