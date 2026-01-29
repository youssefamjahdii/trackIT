
import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectUpdate } from '../types';

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

    // Simulate network latency
    setTimeout(() => {
      onUpdate(newUpdate);
      setSubmitting(false);
      setMilestone('');
      setContent('');
      alert('Update submitted successfully!');
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-[#232F3E] p-6 text-white">
        <h2 className="text-xl font-bold">Manager Status Update</h2>
        <p className="text-slate-400 text-sm mt-1">Submit your weekly progress report</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Project</label>
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
            <input 
              required
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Current Status</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(ProjectStatus).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  status === s 
                    ? 'bg-orange-500 border-orange-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Key Milestone Reached</label>
          <input 
            required
            type="text"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="e.g. Beta release deployed to staging"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Progress Update</label>
          <textarea 
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe achievements, blockers, and next steps..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>

        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#232F3E] font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {submitting ? 'Submitting to AWS Cloud...' : 'Submit Update'}
        </button>
      </form>
    </div>
  );
};

export default ManagerForm;
