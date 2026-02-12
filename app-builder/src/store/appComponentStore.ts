/* import { create } from 'zustand';

interface AppComponentState {
  openComponent: string | null; // e.g. "info", "settings", "pageEdit"
  setOpenComponent: (component: string | null) => void;
}

export const useAppComponentStore = create<AppComponentState>((set) => ({
  openComponent: null,
  setOpenComponent: (component) => set({ openComponent: component }),
}));
 */

import { create } from 'zustand';

interface AppComponentState {
  openComponents: string[];                      // holds all open components
  addComponent: (component: string) => void;     // open/add
  removeComponent: (component: string) => void;  // close/remove
  toggleComponent: (component: string) => void;  // toggle
  clearComponents: () => void;                   // close all
}

export const useAppComponentStore = create<AppComponentState>((set) => ({
  openComponents: [],

  addComponent: (component) =>
    set((state) =>
      state.openComponents.includes(component)
        ? state
        : { openComponents: [...state.openComponents, component] }
    ),

  removeComponent: (component) =>
    set((state) => ({
      openComponents: state.openComponents.filter((c) => c !== component),
    })),

  toggleComponent: (component) =>
    set((state) =>
      state.openComponents.includes(component)
        ? { openComponents: state.openComponents.filter((c) => c !== component) }
        : { openComponents: [...state.openComponents, component] }
    ),

  clearComponents: () => set({ openComponents: [] }),
}));
