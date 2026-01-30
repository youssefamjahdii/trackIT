
import React, { useState } from 'react';
import { Project } from '../types';
import { COLORS } from '../constants';

interface ProjectCreateFormProps {
  projects: Project[];
  onCreate: (project: Project) => void;
}

const ProjectCreateForm: React.FC<ProjectCreateFormProps> = ({ projects, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    description: '',
    startDate: '',
    endDate: '',
    dependencies: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    const newProject: Project = {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      owner: formData.owner,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dependencies: formData.dependencies.length > 0 ? formData.dependencies : undefined,
      updates: []
    };

    setTimeout(() => {
      onCreate(newProject);
      setSubmitting(false);
      setSuccess(true);
      setFormData({
        name: '',
        owner: '',
        description: '',
        startDate: '',
        endDate: '',
        dependencies: []
      });
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDependencyChange = (projectId: string) => {
    setFormData(prev => {
      const isSelected = prev.dependencies.includes(projectId);
      if (isSelected) {
        return { ...prev, dependencies: prev.dependencies.filter(id => id !== projectId) };
      } else {
        return { ...prev, dependencies: [...prev.dependencies, projectId] };
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
      <div className="bg-[#002855] p-10 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight italic uppercase">Initiate Initiative</h2>
          <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configure Strategic Roadmap</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-[#F57C23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest italic">Initiative Provisioned Successfully</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initiative Name</label>
            <input 
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Strategic Designation"
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-[#002855] focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lead Officer</label>
            <input 
              required
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="Officer Name"
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-[#002855] focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Activation Date</label>
            <input 
              required
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-[#002855] focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Completion</label>
            <input 
              required
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-[#002855] focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        {/* New Dependencies Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prerequisite Initiatives (Optional)</label>
          <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 p-4 max-h-40 overflow-y-auto custom-scrollbar">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {projects.map(p => (
                  <label key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.dependencies.includes(p.id)}
                      onChange={() => handleDependencyChange(p.id)}
                      className="w-4 h-4 rounded border-2 border-slate-300 text-[#002855] focus:ring-[#002855]"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-tight">{p.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">No initiatives available for mapping</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Scope</label>
          <textarea 
            required
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Define the primary mission parameters..."
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-[#002855] focus:bg-white outline-none transition-all resize-none"
          />
        </div>

        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-[#002855] hover:bg-slate-900 text-white font-black uppercase tracking-[0.3em] italic text-xs py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? 'Initializing Roadmap...' : 'Commit Roadmap'}
        </button>
      </form>
    </div>
  );
};

export default ProjectCreateForm;
