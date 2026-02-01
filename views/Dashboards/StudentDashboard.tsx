
import React, { useState, useEffect } from 'react';
import { User, Complaint, ComplaintCategory, ComplaintPriority } from '../../types';
import { mockStore } from '../../services/mockStore';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { GoogleGenAI } from "@google/genai";

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [aiSuggested, setAiSuggested] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, [user.uid]);

  const loadComplaints = () => {
    const all = mockStore.getComplaints();
    setComplaints(all.filter(c => c.studentId === user.uid).sort((a, b) => b.createdAt - a.createdAt));
  };

  const determinePriorityWithAI = async (desc: string) => {
    if (!desc || desc.length < 10) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Task: Evaluate hostel maintenance priority.
        Issue: "${desc}"
        
        Rules:
        - High: Safety risk, total utility failure (no water/power), major leak.
        - Medium: Major inconvenience (clogged sink, fan broken, internet down).
        - Low: Minor/cosmetic (loose handle, flickering bulb, small noise).
        
        Return ONLY "Low", "Medium", or "High".`,
      });

      const text = (response.text || "").toLowerCase();
      let detected: ComplaintPriority = 'Medium';
      
      if (text.includes('high')) detected = 'High';
      else if (text.includes('low')) detected = 'Low';
      else if (text.includes('medium')) detected = 'Medium';

      setPriority(detected);
      setAiSuggested(true);
    } catch (error) {
      console.error("AI Priority Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure final check if user didn't trigger blur
    if (!aiSuggested) {
      await determinePriorityWithAI(description);
    }

    const newComplaint: Complaint = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      category,
      priority,
      status: 'Submitted',
      studentId: user.uid,
      studentName: user.name,
      roomNumber: user.roomNumber || 'N/A',
      hostelName: user.hostelName || 'Unknown Hostel', 
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStore.saveComplaint(newComplaint);
    setIsModalOpen(false);
    loadComplaints();
    
    // Reset form
    setTitle('');
    setDescription('');
    setAiSuggested(false);
    setPriority('Medium');
  };

  const handleFeedback = (id: string, feedback: string) => {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      const updated = { ...complaint, feedback, status: 'Closed' as const, updatedAt: Date.now() };
      mockStore.saveComplaint(updated);
      loadComplaints();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resident Dashboard</h1>
          <p className="text-slate-500">Tracking maintenance for <strong className="text-indigo-600">{user.hostelName}</strong>, Room {user.roomNumber}.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Report New Issue
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-slate-500 mb-6 text-lg font-medium">You have no active maintenance records.</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all group">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={complaint.status} />
                    <div className="flex items-center">
                       <PriorityBadge priority={complaint.priority} />
                       <span className="ml-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">AI Verified</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref: {complaint.id.toUpperCase()}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{complaint.title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3 italic">"{complaint.description}"</p>
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-50 pt-4">
                  <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Category: <span className="text-slate-900 ml-1">{complaint.category}</span>
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Submitted: <span className="text-slate-900 ml-1">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 w-full md:w-80 shrink-0">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Repair Lifecycle</h4>
                <div className="relative">
                  {['Submitted', 'Assigned', 'In Progress', 'Resolved'].map((step, idx) => {
                    const statusOrder = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
                    const currentIdx = statusOrder.indexOf(complaint.status);
                    const stepIdx = statusOrder.indexOf(step as any);
                    const isActive = currentIdx >= stepIdx;
                    
                    return (
                      <div key={step} className="flex items-center mb-5 last:mb-0 relative z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 transition-all duration-500 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-200 text-slate-400'}`}>
                          {isActive ? (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className={`text-xs font-bold tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                        {idx < 3 && (
                          <div className={`absolute left-[11px] top-[24px] w-1 h-6 transition-all duration-700 -z-10 ${isActive && currentIdx > stepIdx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {complaint.status === 'Resolved' && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3 text-center">Resident Action</p>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => handleFeedback(complaint.id, 'Satisfied')} className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95">Accept Fix</button>
                      <button onClick={() => handleFeedback(complaint.id, 'Needs improvement')} className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">Not Fixed</button>
                    </div>
                  </div>
                )}
                
                {complaint.status === 'Closed' && (
                  <div className="mt-8 p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-[11px] font-medium text-slate-500 italic">
                    <span className="block font-black text-[9px] text-slate-400 uppercase mb-1">Final Outcome</span>
                    "{complaint.feedback}"
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <h2 className="text-2xl font-black tracking-tight">Report a Problem</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary (e.g. Bathroom Leak)"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
                />
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Details</label>
                   {isAnalyzing && <span className="text-[9px] font-black text-indigo-600 animate-pulse uppercase tracking-widest">AI analyzing severity...</span>}
                </div>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => determinePriorityWithAI(description)}
                  placeholder="Be specific. Gemini AI will automatically calculate priority for you."
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all resize-none font-medium leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none font-bold text-slate-700"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Internet">Internet</option>
                    <option value="Room Issue">Room Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center mb-2 space-x-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
                    {aiSuggested && <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">AI Pick</span>}
                  </div>
                  <div className={`transition-all duration-300 rounded-xl border-2 ${aiSuggested ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}>
                    <select
                      value={priority}
                      onChange={(e) => {
                        setPriority(e.target.value as ComplaintPriority);
                        setAiSuggested(false); // User overrides AI
                      }}
                      className="w-full px-5 py-3 bg-transparent focus:outline-none font-bold text-slate-700"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl">Cancel</button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing Issue...' : 'Log Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
