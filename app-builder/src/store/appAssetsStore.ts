import { create } from 'zustand';

import type { PageConfig, UIConfig, ActionConfig } from '../types/index';

interface AppAssets {
  pageLocale: Record<string, any> | null;
  pagelist: Record<string, any> | null;
  pageConfig: PageConfig[] | null;
  uiLocale: Record<string, any> | null;
  uiList: Record<string, any> | null;
  uiPartDic: Record<string, any> | null;
  uiConfig: UIConfig[] | null;
  actionLocale: Record<string, any> | null;
  actionList: Record<string, any> | null;
  actionConfig: ActionConfig[] | null;

  setPageLocale: (data: Record<string, any>) => void;
  setPageList: (data: Record<string, any>) => void;
  setPageConfig: (pageConfig: PageConfig[]) => void;
  setUILocale: (data: Record<string, any>) => void;
  setUIList: (data: Record<string, any>) => void;
  setUIPartDic: (data: Record<string, any>) => void;
  setUIConfig: (uiConfig: UIConfig[]) => void;
  setActionLocale: (data: Record<string, any>) => void;
  setActionList: (data: Record<string, any>) => void;
  setActionConfig: (actionConfig: ActionConfig[]) => void;
}

export const useAssetStore = create<AppAssets>((set) => ({
  pageLocale: null,
  pagelist: null,
  pageConfig: null,
  uiLocale: null,
  uiList: null,
  uiPartDic: null,
  uiConfig: null,
  actionLocale: null,
  actionList: null,
  actionConfig: null,

  setPageLocale: (data) => set({ pageLocale: data }),
  setPageList: (data) => set({ pagelist: data }),
  setPageConfig: (configs) => set({ pageConfig: configs }),
  setUILocale:(data) => set({ uiLocale: data }),
  setUIList: (data) => set({ uiList: data }),
  setUIPartDic: (data) => set({ uiPartDic: data }),
  setUIConfig: (configs) => set({ uiConfig: configs }),
  setActionLocale: (data) => set({ actionLocale: data }),
  setActionList: (data) => set({ actionList: data }),
  setActionConfig: (configs) => set({ actionConfig: configs }),
}));