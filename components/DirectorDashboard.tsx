
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStatus, DirectorInsight, ProjectUpdate } from '../types';
import Timeline from './Timeline';
import { generateDirectorInsights } from '../services/geminiService';
import { COLORS } from '../constants';

interface DirectorDashboardProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject?: (id: string) => void;
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ projects, selectedProjectId, onSelectProject }) => {
  const [insights, setInsights] = useState<DirectorInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId) || projects[0] || null,
    [projects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'ALL') return projects;
    return projects.filter(p => {
      const latestStatus = p.updates.length > 0 
        ? p.updates[p.updates.length - 1].status 
        : ProjectStatus.ON_TRACK;
      return latestStatus === statusFilter;
    });
  }, [projects, statusFilter]);

  useEffect(() => {
    if (selectedProject) {
      handleGetInsights();
    } else {
      setInsights(null);
    }
  }, [selectedProject?.id]);

  const handleGetInsights = async () => {
    if (!selectedProject) return;
    setLoadingInsights(true);
    const result = await generateDirectorInsights(selectedProject);
    setInsights(result);
    setLoadingInsights(false);
  };

  const handleProjectSelect = (projectId: string) => {
    onSelectProject?.(projectId);
    const element = document.getElementById(`project-card-${projectId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const getStatusWeight = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ON_TRACK: return 0;
      case ProjectStatus.AT_RISK: return 1;
      case ProjectStatus.DELAYED: return 2;
      case ProjectStatus.COMPLETED: return -1;
      default: return 0;
    }
  };

  /**
   * Change Detection: Compares current status with the status from 7 days ago.
   */
  const checkStatusChange = (project: Project) => {
    if (project.updates.length === 0) return null;

    const latestUpdate = project.updates[project.updates.length - 1];
    const latestWeight = getStatusWeight(latestUpdate.status);

    // Calculate timestamp for 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Find the update that was active 7 days ago (the latest update before or on that date)
    const historicalUpdates = [...project.updates]
      .filter(u => new Date(u.timestamp) <= sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // If no update exists from 7+ days ago, compare with the earliest available update
    // as long as there are at least two updates to compare.
    const comparisonUpdate = historicalUpdates.length > 0 
      ? historicalUpdates[0] 
      : (project.updates.length > 1 ? project.updates[0] : null);

    if (!comparisonUpdate || comparisonUpdate.id === latestUpdate.id) return null;

    const previousWeight = getStatusWeight(comparisonUpdate.status);
    
    // Alert if status has worsened (weight increased)
    if (latestWeight > previousWeight) {
      return "⚠️ Status Change";
    }
    return null;
  };

  const getStatusSolidBg = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ON_TRACK: return 'bg-emerald-500';
      case ProjectStatus.AT_RISK: return 'bg-amber-500';
      case ProjectStatus.DELAYED: return 'bg-rose-500';
      case ProjectStatus.COMPLETED: return 'bg-indigo-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Pipeline', value: projects.length, color: 'text-[#002855]' },
          { label: 'Critical Risks', value: projects.filter(p => (p.updates[p.updates.length - 1]?.status || ProjectStatus.ON_TRACK) === ProjectStatus.DELAYED).length, color: 'text-rose-600' },
          { label: 'Weekly Updates', value: projects.reduce((acc, p) => acc + p.updates.length, 0), color: 'text-[#F57C23]' }
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
            <p className={`text-4xl font-black mt-2 tracking-tighter italic ${card.color}`}>{card.value.toString().padStart(2, '0')}</p>
          </div>
        ))}
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Health Filter</span>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
            {['ALL', ...Object.values(ProjectStatus)].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                  statusFilter === status
                    ? 'bg-white text-[#F57C23] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Visualization */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <Timeline 
          projects={filteredProjects} 
          onProjectClick={handleProjectSelect}
          selectedProjectId={selectedProject?.id}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Strategic Initiatives
          </h3>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProjects.map(project => {
              const latestUpdate = project.updates[project.updates.length - 1];
              const currentStatus = latestUpdate?.status || ProjectStatus.ON_TRACK;
              const statusChangeLabel = checkStatusChange(project);
              
              return (
                <button
                  id={`project-card-${project.id}`}
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                    selectedProject?.id === project.id 
                      ? 'border-[#F57C23] bg-orange-50/20' 
                      : 'border-white bg-white hover:border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusSolidBg(currentStatus)}`}></div>
                        <h4 className="font-black text-sm text-[#002855] italic uppercase tracking-tight">
                          {project.name}
                        </h4>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {project.owner}
                      </span>
                    </div>
                    
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${COLORS.STATUS[currentStatus]}`}>
                      {currentStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {statusChangeLabel && (
                    <div className="mt-3 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
                      <span className="bg-[#E1000F] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg italic flex items-center gap-1.5 shadow-sm shadow-red-900/20">
                        <span className="animate-pulse">⚠️</span> {statusChangeLabel}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-[#002855] px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#F57C23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] italic">
                    Gemini AI Strategy
                  </h3>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Autonomous Analysis protocol</p>
                </div>
              </div>
              {loadingInsights && <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#F57C23] border-t-transparent" />}
            </div>

            <div className="p-10 space-y-8">
              {insights ? (
                <>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-[9px] font-black text-[#002855] uppercase tracking-widest mb-3 italic">Executive Summary</h4>
                    <p className="text-slate-800 text-lg font-medium leading-relaxed">
                      "{insights.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic">Critical Risks</h4>
                      <ul className="space-y-3">
                        {insights.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-slate-600 font-bold uppercase tracking-tight">
                            <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">Strategic Actions</h4>
                      <ul className="space-y-3">
                        {insights.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-slate-600 font-bold uppercase tracking-tight">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">Initialize Intelligence Protocol</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
