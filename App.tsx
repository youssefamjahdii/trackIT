
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectUpdate } from './types';
import ManagerForm from './components/ManagerForm';
import DirectorDashboard from './components/DirectorDashboard';
import ProjectCreateForm from './components/ProjectCreateForm';
import { Icons, COLORS } from './constants';

// Mock Initial Data
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'LEAP Engine Optimization',
    owner: 'Sarah Chen',
    description: 'Aeronautical component database migration to secure cloud-native infrastructure.',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    updates: [
      {
        id: 'u1',
        projectId: 'p1',
        managerName: 'Mike Jones',
        timestamp: '2024-02-01T10:00:00Z',
        content: 'Stress testing simulations complete. AWS GovCloud deployment verified.',
        status: ProjectStatus.ON_TRACK,
        milestoneReached: 'Core Systems Finalized'
      }
    ]
  },
  {
    id: 'p2',
    name: 'Falcon Avionics Hub',
    owner: 'David Miller',
    description: 'Real-time telemetry portal for high-precision flight tracking.',
    startDate: '2024-02-10',
    endDate: '2024-09-15',
    updates: [
      {
        id: 'u2',
        projectId: 'p2',
        managerName: 'Ana Smith',
        timestamp: '2024-03-05T14:30:00Z',
        content: 'Latencies detected in high-bandwidth sensor ingestion. Investigating SQS bottlenecks.',
        status: ProjectStatus.AT_RISK,
        milestoneReached: 'Cockpit Interface Prototype'
      }
    ]
  },
  {
    id: 'p3',
    name: 'Eco-Propulsion AI',
    owner: 'Robert Tan',
    description: 'ML models for optimizing fuel efficiency in civil aviation.',
    startDate: '2024-03-01',
    endDate: '2024-12-20',
    updates: []
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'director' | 'manager' | 'create'>('director');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);

  const handleNewUpdate = (update: ProjectUpdate) => {
    setProjects(prev => prev.map(p => {
      if (p.id === update.projectId) {
        return {
          ...p,
          updates: [...p.updates, update]
        };
      }
      return p;
    }));
    setActiveTab('director');
  };

  const handleCreateProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
    setActiveTab('director');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('director')}>
              <div className="w-10 h-10 bg-[#002855] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-blue-900/10">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Track<span className="text-blue-600">IT</span></h1>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              {[
                { id: 'director', icon: <Icons.Dashboard />, label: 'Dashboard' },
                { id: 'manager', icon: <Icons.Edit />, label: 'Update' },
                { id: 'create', icon: <Icons.Plus />, label: 'New Project' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-none">System Active</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Region: EU-WEST-1</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                OP
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'director' && (
            <DirectorDashboard projects={projects} />
          )}
          {activeTab === 'manager' && (
            <ManagerForm projects={projects} onUpdate={handleNewUpdate} />
          )}
          {activeTab === 'create' && (
            <ProjectCreateForm onCreate={handleCreateProject} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 grayscale opacity-50">
             <span className="text-xs font-black tracking-widest text-slate-900">SAFRAN</span>
             <span className="text-xs text-slate-400">|</span>
             <span className="text-xs font-bold text-slate-400">INTERNAL SYSTEMS</span>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            Project Intel Engine &copy; 2024 • Powered by Gemini AI
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
