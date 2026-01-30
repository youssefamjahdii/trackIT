
import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectUpdate } from '../types';
import { COLORS } from '../constants';

interface ManagerFormProps {
  projects: Project[];
  onUpdate: (update: ProjectUpdate) => void;
}

const ManagerForm: React.FC<ManagerFormProps> = ({ projects, onUpdate }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [managerName, setManagerName] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.ON_TRACK);
  const [milestone, setMilestone] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const newUpdate: ProjectUpdate = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: selectedProjectId,
      managerName,
      status,
      milestoneReached: milestone,
      content,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      onUpdate(newUpdate);
      setSubmitting(false);
      setMilestone('');
      setContent('');
      alert('Operational log verified.');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="bg-[#002855] p-10 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Status Entry</h2>
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-1">Operational Progress Protocol</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Target Initiative</label>
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Reporting Officer</label>
            <input 
              required
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="Full Name"
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Current Readiness</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(ProjectStatus).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`py-3 px-1 rounded-xl border-2 text-[10px] font-extrabold uppercase transition-all duration-200 ${
                  status === s 
                    ? `bg-[#002855] border-[#002855] text-white shadow-lg shadow-blue-900/20` 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
                style={status === s && s === ProjectStatus.DELAYED ? { backgroundColor: COLORS.SAFRAN_RED, borderColor: COLORS.SAFRAN_RED } : {}}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Primary Milestone</label>
          <input 
            required
            type="text"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="Key achievement or focus area"
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Contextual Details</label>
          <textarea 
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe progress, blockers, or strategic adjustments..."
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all resize-none"
          />
        </div>

        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-[#002855] hover:bg-slate-900 text-white font-extrabold uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? 'Encrypting Log...' : 'Confirm Update'}
        </button>
      </form>
    </div>
  );
};

export default ManagerForm;
