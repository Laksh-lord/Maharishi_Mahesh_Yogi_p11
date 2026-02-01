
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

  useEffect(() => {
    loadComplaints();
  }, [user.uid]);

  const loadComplaints = () => {
    const all = mockStore.getComplaints();
    setComplaints(all.filter(c => c.studentId === user.uid).sort((a, b) => b.createdAt - a.createdAt));
  };

  const determinePriorityWithAI = async (desc: string): Promise<ComplaintPriority> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this hostel complaint and categorize its priority as 'Low', 'Medium', or 'High'. 
        
        Guidelines:
        - High: Safety hazards, major leaks, complete power failure, security issues.
        - Medium: Functional issues that hinder daily life but aren't immediate dangers (broken fan, clogged drain).
        - Low: Cosmetic issues, minor inconveniences, non-urgent requests.
        
        Complaint: "${desc}"
        
        Return ONLY the word: Low, Medium, or High.`,
      });

      const aiResult = response.text?.trim();
      if (aiResult && ['Low', 'Medium', 'High'].includes(aiResult)) {
        return aiResult as ComplaintPriority;
      }
      return priority;
    } catch (error) {
      console.error("AI Priority Check failed:", error);
      return priority;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    const finalPriority = await determinePriorityWithAI(description);

    const newComplaint: Complaint = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      category,
      priority: finalPriority,
      status: 'Submitted',
      studentId: user.uid,
      studentName: user.name,
      roomNumber: user.roomNumber || 'N/A',
      hostelName: user.hostelName || 'Unknown Hostel', 
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStore.saveComplaint(newComplaint);
    setIsAnalyzing(false);
    setIsModalOpen(false);
    loadComplaints();
    
    setTitle('');
    setDescription('');
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
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Report your first issue
            </button>
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
                       <span className="ml-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Verified</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Ref: {complaint.id.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{complaint.title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3 italic">"{complaint.description}"</p>
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-50 pt-4">
                  <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div>
                    Category: <span className="text-slate-900 ml-1">{complaint.category}</span>
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div>
                    Hostel: <span className="text-slate-900 ml-1">{complaint.hostelName}</span>
                  </div>
                  <div className="flex items-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div>
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
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3 text-center">Final Inspection Required</p>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => handleFeedback(complaint.id, 'Satisfied')} className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95">Accept Fix</button>
                      <button onClick={() => handleFeedback(complaint.id, 'Needs improvement')} className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">Re-open Issue</button>
                    </div>
                  </div>
                )}
                
                {complaint.status === 'Closed' && (
                  <div className="mt-8 p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-[11px] font-medium text-slate-500 italic">
                    <span className="block font-black text-[9px] text-slate-400 uppercase mb-1">Resident Feedback</span>
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
              <div>
                <h2 className="text-2xl font-black tracking-tight">Report a Problem</h2>
                <p className="text-xs text-indigo-100 opacity-80 font-medium">Issue will be logged for {user.hostelName}</p>
              </div>
              <button onClick={() => !isAnalyzing && setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50" disabled={isAnalyzing}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Short Summary</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., No water in shower"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all font-medium"
                  disabled={isAnalyzing}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the problem in detail so our AI can prioritize it..."
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none transition-all resize-none font-medium leading-relaxed"
                  disabled={isAnalyzing}
                />
                <div className="mt-2 flex items-center text-[10px] text-indigo-500 font-bold uppercase tracking-wider bg-indigo-50 p-2 rounded-lg">
                  <svg className="w-3.5 h-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                  Gemini AI will automatically set urgency based on your text
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none appearance-none font-bold text-slate-700"
                    disabled={isAnalyzing}
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
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fallover Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-600 focus:outline-none appearance-none font-bold text-slate-700"
                    disabled={isAnalyzing}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI Analyzing Urgency...
                    </>
                  ) : 'Submit Report'}
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
