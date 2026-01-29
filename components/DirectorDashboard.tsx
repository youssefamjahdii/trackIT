
import React, { useState, useEffect } from 'react';
import { Project, DirectorInsight } from '../types';
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

  useEffect(() => {
    if (selectedProject) {
      handleGetInsights();
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Active Projects</p>
          <p className="text-3xl font-bold mt-1">{projects.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">At Risk</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">
            {projects.filter(p => p.updates[0]?.status === 'AT_RISK').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Completed Milestones</p>
          <p className="text-3xl font-bold mt-1 text-green-600">
            {projects.reduce((acc, p) => acc + p.updates.length, 0)}
          </p>
        </div>
      </div>

      {/* Visual Roadmap */}
      <Timeline projects={projects} />

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Selector */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Project Portfolio</h3>
          <div className="space-y-3">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedProject?.id === project.id 
                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900">{project.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${COLORS.STATUS[project.updates[0]?.status || 'ON_TRACK']}`}>
                    {project.updates[0]?.status || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{project.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Gemini AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#232F3E] to-[#3b4b5e] p-6 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                  Gemini Strategic Insights
                </h3>
                <p className="text-slate-400 text-xs mt-1">AI-driven analysis for {selectedProject?.name}</p>
              </div>
              {loadingInsights && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />}
            </div>

            <div className="p-8 space-y-8">
              {insights ? (
                <>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h4>
                    <p className="text-slate-700 leading-relaxed italic border-l-4 border-orange-500 pl-4">
                      "{insights.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Critical Risks</h4>
                      <ul className="space-y-2">
                        {insights.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-red-500 font-bold mt-0.5">!</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <p>Select a project to generate real-time AI insights</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Raw Updates */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="font-bold text-slate-800 mb-4">Latest Activity Log</h4>
            <div className="space-y-4">
              {selectedProject?.updates.slice().reverse().map((update, i) => (
                <div key={update.id} className="relative pl-6 pb-4 border-l border-slate-200 last:pb-0">
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(update.timestamp).toLocaleDateString()} by {update.managerName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${COLORS.STATUS[update.status]}`}>
                      {update.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{update.milestoneReached}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{update.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
