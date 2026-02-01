
import React, { useState, useEffect, useMemo } from 'react';
import { User, Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority } from '../../types';
import { mockStore } from '../../services/mockStore';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WardenDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll for real-time updates
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // Only show complaints that aren't system-generated
    const all = mockStore.getComplaints().filter(c => c.studentId !== 'system');
    setComplaints(all.sort((a, b) => b.createdAt - a.createdAt));
    setWorkers(mockStore.getUsers().filter(u => u.role === 'worker'));
  };

  const handleAssign = (complaintId: string, workerId: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    const worker = workers.find(w => w.uid === workerId);
    if (complaint && worker) {
      const updated = { 
        ...complaint, 
        assignedWorkerId: workerId, 
        assignedWorkerName: worker.name,
        status: 'Assigned' as ComplaintStatus,
        updatedAt: Date.now()
      };
      mockStore.saveComplaint(updated);
      loadData();
    }
  };

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Submitted' || c.status === 'Assigned').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
    };
  }, [complaints]);

  const chartData = useMemo(() => {
    const categories: ComplaintCategory[] = ['Plumbing', 'Electricity', 'Cleanliness', 'Internet', 'Room Issue', 'Other'];
    return categories.map(cat => ({
      name: cat,
      count: complaints.filter(c => c.category === cat).length
    }));
  }, [complaints]);

  const filteredComplaints = complaints.filter(c => {
    const statusMatch = statusFilter === 'All' || c.status === statusFilter;
    const categoryMatch = categoryFilter === 'All' || c.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Warden Command Center</h1>
        <p className="text-slate-500">Real-time overview of active resident maintenance requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Active', value: stats.total, color: 'border-slate-200' },
          { label: 'Unassigned', value: complaints.filter(c => c.status === 'Submitted').length, color: 'border-blue-500' },
          { label: 'Work In Progress', value: stats.inProgress, color: 'border-amber-500' },
          { label: 'Resolved (Real)', value: stats.resolved, color: 'border-emerald-500' },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-xl border-t-4 shadow-sm transition-all hover:shadow-md ${item.color}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Distribution by Category</h3>
            {stats.total > 0 && (
               <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">Live Data</span>
            )}
          </div>
          <div className="h-64">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p className="text-sm font-bold uppercase tracking-widest">No analytics available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Filter View</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filter Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-slate-700 appearance-none"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-slate-700 appearance-none"
              >
                <option value="All">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electricity">Electricity</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Internet">Internet</option>
                <option value="Room Issue">Room Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-50">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Urgent Attention</span>
                 <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-black">
                  {complaints.filter(c => c.priority === 'High' && (c.status === 'Submitted' || c.status === 'Assigned')).length}
                 </span>
               </div>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">High priority issues that haven't entered the "In Progress" phase yet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Inbox Zero</h2>
            <p className="text-slate-500 max-w-sm font-medium">No resident has posted a complaint yet. All hostels are currently reporting zero maintenance issues.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Complaint Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident / Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">No matching records for current filters</td>
                  </tr>
                ) : (
                  filteredComplaints.map(complaint => (
                    <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{complaint.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">"{complaint.description}"</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-slate-800">{complaint.studentName}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{complaint.hostelName} • Room {complaint.roomNumber}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col space-y-1">
                          <PriorityBadge priority={complaint.priority} />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-6 py-5">
                        {complaint.assignedWorkerId ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-900 font-bold">{complaint.assignedWorkerName}</span>
                            <button 
                              onClick={() => handleAssign(complaint.id, '')} 
                              className="text-[9px] text-indigo-600 font-black hover:underline text-left mt-1 uppercase tracking-tighter"
                            >
                              Revoke / Reassign
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <select 
                              className={`text-[11px] py-2 px-3 border-2 rounded-xl font-black focus:outline-none transition-all appearance-none pr-8 ${
                                workers.some(w => w.profession === complaint.category) 
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                                : 'bg-slate-50 border-slate-100 text-slate-600'
                              }`}
                              onChange={(e) => handleAssign(complaint.id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="" disabled>Choose Specialist</option>
                              {[...workers].sort((a, b) => {
                                if (a.profession === complaint.category && b.profession !== complaint.category) return -1;
                                if (b.profession === complaint.category && a.profession !== complaint.category) return 1;
                                return 0;
                              }).map(w => (
                                <option key={w.uid} value={w.uid}>
                                  {w.name} ({w.profession || 'Staff'}) {w.profession === complaint.category ? ' ✓' : ''}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenDashboard;
