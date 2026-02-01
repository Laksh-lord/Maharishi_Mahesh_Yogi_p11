
import React, { useState, useEffect } from 'react';
import { User, Complaint, ComplaintStatus, ComplaintCategory } from '../../types';
import { mockStore } from '../../services/mockStore';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';

interface WorkerDashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
  const [remarks, setRemarks] = useState('');
  // Use session state instead of user property to force selection every time
  const [sessionProfession, setSessionProfession] = useState<ComplaintCategory | null>(null);

  useEffect(() => {
    if (sessionProfession) {
      loadTasks();
      const interval = setInterval(loadTasks, 5000);
      return () => clearInterval(interval);
    }
  }, [user.uid, sessionProfession]);

  const loadTasks = () => {
    if (!sessionProfession) return;
    const all = mockStore.getComplaints();
    // Only show tasks matching the current session focus
    const filtered = all.filter(c => 
      c.category === sessionProfession && 
      (c.assignedWorkerId === user.uid || (c.status === 'Submitted' && !c.assignedWorkerId))
    );

    setTasks(filtered.sort((a, b) => {
      if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
      if (b.status === 'In Progress' && a.status !== 'In Progress') return 1;
      
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      
      return b.createdAt - a.createdAt;
    }));
  };

  const updateStatus = (complaintId: string, status: ComplaintStatus) => {
    const all = mockStore.getComplaints();
    const task = all.find(t => t.id === complaintId);
    if (task) {
      const updated = { 
        ...task, 
        status, 
        remarks: remarks || task.remarks, 
        assignedWorkerId: user.uid, 
        assignedWorkerName: user.name,
        updatedAt: Date.now() 
      };
      mockStore.saveComplaint(updated);
      setSelectedTask(null);
      setRemarks('');
      loadTasks();
    }
  };

  if (!sessionProfession) {
    const categories: { name: ComplaintCategory; icon: string; color: string }[] = [
      { name: 'Plumbing', icon: '🚰', color: 'bg-blue-50 text-blue-600 border-blue-100' },
      { name: 'Electricity', icon: '⚡', color: 'bg-amber-50 text-amber-600 border-amber-100' },
      { name: 'Cleanliness', icon: '🧹', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      { name: 'Internet', icon: '🌐', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
      { name: 'Room Issue', icon: '🏠', color: 'bg-rose-50 text-rose-600 border-rose-100' },
      { name: 'Other', icon: '⚙️', color: 'bg-slate-50 text-slate-600 border-slate-100' },
    ];

    return (
      <div className="max-w-3xl mx-auto px-4 pt-16 animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Active Duty Session</h2>
          <p className="text-slate-500 mb-10 text-lg font-medium">Hello {user.name.split(' ')[0]}, which area will you be focusing on for this session?</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSessionProfession(cat.name)}
                className={`p-6 border-2 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 group flex flex-col items-center justify-center ${cat.color} border-transparent hover:border-current`}
              >
                <span className="text-4xl mb-3 group-hover:scale-125 transition-transform">{cat.icon}</span>
                <span className="font-black uppercase tracking-widest text-[11px]">{cat.name}</span>
              </button>
            ))}
          </div>
          
          <p className="mt-10 text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Selection resets when you leave this page</p>
        </div>
      </div>
    );
  }

  const assignedTasks = tasks.filter(t => t.assignedWorkerId === user.uid);
  const availableTasks = tasks.filter(t => t.status === 'Submitted' && !t.assignedWorkerId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Worker Portal</h1>
            <div className="flex items-center bg-indigo-600 text-white px-3 py-1 rounded-full">
               <span className="text-[10px] font-black uppercase tracking-widest">{sessionProfession}</span>
               <button 
                onClick={() => setSessionProfession(null)}
                className="ml-2 hover:bg-white/20 p-0.5 rounded transition-colors"
                title="Change Category"
               >
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </button>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium italic">Viewing active <strong className="text-slate-700">{sessionProfession}</strong> assignments.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 text-center min-w-[100px]">
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-widest mb-1">Unassigned</span>
            <span className="text-2xl font-black text-slate-900">{availableTasks.length}</span>
          </div>
          <div className="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 text-center min-w-[100px]">
            <span className="text-[10px] font-black text-indigo-400 uppercase block tracking-widest mb-1">My Active</span>
            <span className="text-2xl font-black text-indigo-600">{assignedTasks.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
              Current Workspace
            </h2>
            <div className="h-px flex-1 bg-slate-100 ml-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedTasks.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400">
                <p className="text-lg font-bold tracking-tight mb-1">No active jobs</p>
                <p className="text-sm">Claim a new request from the list below.</p>
              </div>
            ) : (
              assignedTasks.map(task => (
                <TaskCard key={task.id} task={task} onStatusUpdate={updateStatus} onOpenResolve={() => setSelectedTask(task)} />
              ))
            )}
          </div>
        </section>

        {availableTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.25em] flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-ping"></span>
                New {sessionProfession} Requests
              </h2>
              <div className="h-px flex-1 bg-emerald-50 ml-6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTasks.map(task => (
                <TaskCard key={task.id} task={task} isClaimable onStatusUpdate={updateStatus} onOpenResolve={() => {}} />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Complete Task</h2>
              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Job Remarks</label>
                <textarea
                  autoFocus
                  rows={4}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:outline-none resize-none font-medium transition-all"
                  placeholder="What was fixed?"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setSelectedTask(null)} className="flex-1 py-4 bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl">Cancel</button>
                <button onClick={() => updateStatus(selectedTask.id, 'Resolved')} className="flex-2 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Resolve Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard: React.FC<{ 
  task: Complaint; 
  isClaimable?: boolean; 
  onStatusUpdate: (id: string, status: ComplaintStatus) => void;
  onOpenResolve: () => void;
}> = ({ task, isClaimable, onStatusUpdate, onOpenResolve }) => {
  return (
    <div className={`bg-white rounded-3xl border-2 shadow-sm transition-all overflow-hidden flex flex-col group ${task.status === 'In Progress' ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}>
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{task.title}</h3>
        <p className="text-xs text-slate-500 mb-4">{task.hostelName} • Room {task.roomNumber}</p>
        <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 mb-4 italic border border-slate-100">
          "{task.description}"
        </div>
      </div>
      <div className="px-6 pb-6 flex items-center justify-between gap-3">
        {isClaimable ? (
          <button onClick={() => onStatusUpdate(task.id, 'In Progress')} className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Accept Task</button>
        ) : (
          <div className="w-full flex gap-3">
            {task.status === 'Assigned' && (
              <button onClick={() => onStatusUpdate(task.id, 'In Progress')} className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Start Task</button>
            )}
            {task.status === 'In Progress' && (
              <button onClick={onOpenResolve} className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Complete</button>
            )}
            {(task.status === 'Resolved' || task.status === 'Closed') && (
              <div className="w-full py-4 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50 rounded-2xl">Task Finished</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerDashboard;
