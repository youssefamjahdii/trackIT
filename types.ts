
export enum ProjectStatus {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED'
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  managerName: string;
  timestamp: string;
  content: string;
  status: ProjectStatus;
  milestoneReached: string;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  description: string;
  startDate: string;
  endDate: string;
  updates: ProjectUpdate[];
  dependencies?: string[]; // IDs of projects this project depends on
}

export interface DirectorInsight {
  summary: string;
  risks: string[];
  recommendations: string[];
}
