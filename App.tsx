
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectUpdate } from './types';
import ManagerForm from './components/ManagerForm';
import DirectorDashboard from './components/DirectorDashboard';
import { Icons } from './constants';

// Mock Initial Data
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Apollo Migration',
    owner: 'Sarah Chen',
    description: 'Moving legacy databases to AWS Aurora Serverless v2.',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    updates: [
      {
        id: 'u1',
        projectId: 'p1',
        managerName: 'Mike Jones',
        timestamp: '2024-02-01T10:00:00Z',
        content: 'Data mapping complete. Initial migration tests in staging showing 99% success rate.',
        status: ProjectStatus.ON_TRACK,
        milestoneReached: 'Database Schema Finalized'
      }
    ]
  },
  {
    id: 'p2',
    name: 'Project Helios',
    owner: 'David Miller',
    description: 'Next-gen customer portal using React and AWS AppSync.',
    startDate: '2024-02-10',
    endDate: '2024-09-15',
    updates: [
      {
        id: 'u2',
        projectId: 'p2',
        managerName: 'Ana Smith',
        timestamp: '2024-03-05T14:30:00Z',
        content: 'Experienced issues with Auth integration. Cognition triggers are causing delays.',
        status: ProjectStatus.AT_RISK,
        milestoneReached: 'UI Prototype Signed Off'
      }
    ]
  },
  {
    id: 'p3',
    name: 'CloudScale AI',
    owner: 'Robert Tan',
    description: 'ML pipeline automation with SageMaker and Step Functions.',
    startDate: '2024-03-01',
    endDate: '2024-12-20',
    updates: []
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'director' | 'manager'>('director');
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
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-[#232F3E] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-black text-xl text-[#232F3E]">
                A
              </div>
              <h1 className="text-xl font-bold tracking-tight">Cloud<span className="text-orange-400">Tracker</span></h1>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('director')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'director' ? 'bg-slate-700 text-orange-400 shadow-inner' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icons.Dashboard />
                Director Dashboard
              </button>
              <button
                onClick={() => setActiveTab('manager')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'manager' ? 'bg-slate-700 text-orange-400 shadow-inner' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icons.Edit />
                Manager Update
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'director' ? (
            <DirectorDashboard projects={projects} />
          ) : (
            <ManagerForm projects={projects} onUpdate={handleNewUpdate} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs">
            © 2024 Internal AWS Tool. This application uses Gemini AI for data analysis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
