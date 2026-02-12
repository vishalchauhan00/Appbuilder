import { create } from 'zustand';

import type { AppConfig, AppCredentials } from '../types/index';

interface AppState {
  error: Error | null;
  config: AppConfig | null;
  credentials: AppCredentials | null;
  loadProject: boolean;
  projectData: Record<string, any> | null;
  contributorTabs: string[],
  
  setError: (err: Error) => void;
  setConfig: (config: AppConfig) => void;
  setCredentials: (creds: AppCredentials) => void;
  setLoadProject: (flag: boolean) => void;
  setProjectData: (data: Record<string, any>) => void;
  setContributorTabs : (ctabs: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  error: null,
  config: null,
  credentials: null,
  loadProject: false,
  projectData: null,
  contributorTabs : ['none'],

  setError: (error) => set({ error }),
  setConfig: (config) => set({ config }),
  setCredentials: (credentials) => set({ credentials }),
  setLoadProject: (flag) => set({ loadProject: flag }),
  setProjectData: (data) => set({ projectData: data }),
  setContributorTabs: (ctabs) => set({ contributorTabs: ctabs }),
}));