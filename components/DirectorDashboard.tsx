
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStatus, DirectorInsight } from '../types';
import Timeline from './Timeline';
import { generateDirectorInsights } from '../services/geminiService';
import { COLORS } from '../constants';

interface DirectorDashboardProps {
  projects: Project[];
}

const DirectorDashboard: React.FC<DirectorDashboardProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  const [insights, setInsights] = useState<DirectorInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');

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
    if (selectedProject && !filteredProjects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(filteredProjects[0] || null);
    } else if (!selectedProject && filteredProjects.length > 0) {
      setSelectedProject(filteredProjects[0]);
    }
  }, [filteredProjects, selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      handleGetInsights();
    } else {
      setInsights(null);
    }
  }, [selectedProject]);

  const handleGetInsights = async () => {
    if (!selectedProject) return;
    setLoadingInsights(true);
    const result = await generateDirectorInsights(selectedProject);
    setInsights(result);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Projects', value: projects.length, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Critical Risks', value: projects.filter(p => p.updates[p.updates.length - 1]?.status === ProjectStatus.DELAYED).length, color: 'text-rose-600', bg: 'bg-rose-50/50' },
          { label: 'Logged Updates', value: projects.reduce((acc, p) => acc + p.updates.length, 0), color: 'text-blue-600', bg: 'bg-blue-50/50' }
        ].map((card, idx) => (
          <div key={idx} className={`${card.bg} p-8 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 duration-300`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{card.label}</p>
            <p className={`text-4xl font-extrabold mt-2 ${card.color}`}>{card.value.toString().padStart(2, '0')}</p>
          </div>
        ))}
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Status Filters</span>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['ALL', ...Object.values(ProjectStatus)].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-1.5 text-[11px] font-bold uppercase transition-all rounded-lg ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs font-medium text-slate-400">
          Showing <span className="text-slate-900 font-bold">{filteredProjects.length}</span> initiatives
        </div>
      </div>

      {/* Roadmap Visualization */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <Timeline projects={filteredProjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Project List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-600 rounded-full"></span>
            Initiative Pipeline
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${
                    selectedProject?.id === project.id 
                      ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-600/5' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-sm ${selectedProject?.id === project.id ? 'text-blue-900' : 'text-slate-700'}`}>
                      {project.name}
                    </h4>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${COLORS.STATUS[project.updates[project.updates.length - 1]?.status || 'ON_TRACK']}`}>
                      {(project.updates[project.updates.length - 1]?.status || 'ON_TRACK').replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </button>
              ))
            ) : (
              <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching results</p>
              </div>
            )}
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#002855] px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">
                    AI Strategic Intel
                  </h3>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Automated Analysis Protocol</p>
                </div>
              </div>
              {loadingInsights && <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />}
            </div>

            <div className="p-10 space-y-10">
              {insights ? (
                <>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Summary</h4>
                    <p className="text-slate-800 text-lg font-medium leading-relaxed italic">
                      "{insights.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Risk Analysis
                      </h4>
                      <ul className="space-y-4">
                        {insights.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-4 text-sm text-slate-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        Next Actions
                      </h4>
                      <ul className="space-y-4">
                        {insights.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-4 text-sm text-slate-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-xs uppercase font-bold tracking-widest opacity-40">Select an initiative to begin intelligence scan</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-8 pb-4 border-b border-slate-100">Operational Log</h4>
            <div className="space-y-8">
              {selectedProject?.updates.slice().reverse().map((update, i) => (
                <div key={update.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                  <div className="md:col-span-3">
                    <p className="text-[11px] font-extrabold text-slate-900 uppercase tracking-tight">
                      {new Date(update.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      By {update.managerName}
                    </p>
                  </div>
                  <div className="md:col-span-9">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">{update.milestoneReached}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-widest ${COLORS.STATUS[update.status]}`}>
                        {update.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{update.content}</p>
                  </div>
                </div>
              ))}
              {!selectedProject?.updates.length && (
                 <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No logs found</p>
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
