
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, ProjectUpdate } from './types';
import ManagerForm from './components/ManagerForm';
import DirectorDashboard from './components/DirectorDashboard';
import ProjectCreateForm from './components/ProjectCreateForm';
import { Icons, COLORS } from './constants';

// Mock Initial Data - In a real AWS deployment, this would be fetched from DynamoDB via API Gateway
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
    startDate: '2024-04-10',
    endDate: '2024-09-15',
    dependencies: ['p1'],
    updates: [
      {
        id: 'u2-old',
        projectId: 'p2',
        managerName: 'Ana Smith',
        timestamp: '2024-03-01T14:30:00Z',
        content: 'System design finalized.',
        status: ProjectStatus.ON_TRACK,
        milestoneReached: 'Design Phase'
      },
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
    dependencies: ['p2'],
    updates: []
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'director' | 'manager' | 'create'>('director');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSelectedProjectId, setLastSelectedProjectId] = useState<string>('');

  // Simulated AWS Lambda Fetch
  useEffect(() => {
    const fetchCloudData = async () => {
      setIsLoading(true);
      // Simulate network latency to AWS region
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProjects(INITIAL_PROJECTS);
      setLastSelectedProjectId(INITIAL_PROJECTS[0]?.id || '');
      setIsLoading(false);
    };
    fetchCloudData();
  }, []);

  const handleNewUpdate = async (update: ProjectUpdate) => {
    setIsSyncing(true);
    // Simulate AWS API Gateway PUT request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setProjects(prev => prev.map(p => {
      if (p.id === update.projectId) {
        return {
          ...p,
          updates: [...p.updates, update]
        };
      }
      return p;
    }));
    
    setLastSelectedProjectId(update.projectId);
    setIsSyncing(false);
    setActiveTab('director');
  };

  const handleCreateProject = async (project: Project) => {
    setIsSyncing(true);
    // Simulate AWS Lambda POST request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProjects(prev => [...prev, project]);
    setLastSelectedProjectId(project.id);
    setIsSyncing(false);
    setActiveTab('director');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
           <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-[#F57C23] rounded-full border-t-transparent animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[10px] font-black text-[#002855] italic">AWS</span>
           </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing with Cloud Terminal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* BRAND LOGO */}
            <div 
              className="flex items-center cursor-pointer group select-none" 
              onClick={() => setActiveTab('director')}
            >
              <div className="relative flex items-center transition-transform group-hover:scale-105 duration-300">
                <span className="text-3xl font-black tracking-tighter text-[#002855] italic">T</span>
                <span className="text-3xl font-black tracking-tighter text-[#F57C23] italic">rack</span>
                <div className="relative ml-2">
                  <span className="text-3xl font-black tracking-tighter text-[#F57C23] italic">It</span>
                  <svg className="absolute -right-7 -top-2 w-10 h-10 text-[#F57C23] opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12c0 0 5-6 16-1m-4-3l4 4-4 4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
              {[
                { id: 'director', icon: <Icons.Dashboard />, label: 'Dashboard' },
                { id: 'manager', icon: <Icons.Edit />, label: 'Update' },
                { id: 'create', icon: <Icons.Plus />, label: 'New Project' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-white text-[#F57C23] shadow-md border border-slate-100 ring-4 ring-orange-500/5' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-[#F57C23]' : 'text-slate-400'}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tighter">AWS region: eu-west-1</span>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  {isSyncing ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[8px] text-blue-500 font-bold uppercase tracking-widest">Writing to DynamoDB...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Cloud Encrypted</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#002855] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-900/20">
                OP
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          {activeTab === 'director' && (
            <DirectorDashboard 
              projects={projects} 
              selectedProjectId={lastSelectedProjectId} 
              onSelectProject={setLastSelectedProjectId} 
            />
          )}
          {activeTab === 'manager' && (
            <ManagerForm 
              projects={projects} 
              onUpdate={handleNewUpdate} 
              initialProjectId={lastSelectedProjectId} 
            />
          )}
          {activeTab === 'create' && (
            <ProjectCreateForm projects={projects} onCreate={handleCreateProject} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 opacity-60">
             <span className="text-xs font-black tracking-[0.4em] text-[#002855]">SAFRAN</span>
             <div className="w-px h-4 bg-slate-300"></div>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Aerospace Intelligence</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">
            Logistics & Roadmap Encryption Protocol &copy; 2024 • Powered by Gemini AI • Hosted on AWS Solutions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
