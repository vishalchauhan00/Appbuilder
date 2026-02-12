import { create } from 'zustand';

interface PageState {
  error: Error | null;
  loadPageList: boolean | false;
  pagetree: Record<string, any> | null; 
  pagelistData: Record<string, any> | null;
  screenIndex: number;
  openedPages: string[];
  activePageId: string;
  
  setError: (err: Error) => void;
  setLoadPageList: (flag: boolean) => void;
  setPagelistHeirarchy: (tree: Record<string, any>) => void;
  setPagelistData: (data: Record<string, any>) => void;
  setScreenIndex: (index: number) => void;
  setOpenedPages: (pageid: string) => void;
  removeOpenedPage: (pageid: string) => void;
  setActivePage: (pageid: string) => void;
  updateActivePageChildren: (nextChildren: any[]) => void
}

export const usePageStore = create<PageState>((set, get) => ({
  error: null,
  loadPageList: false,
  pagetree: null,
  pagelistData: null,
  screenIndex: 0,
  openedPages: [],
  activePageId: '-1',

  setError: (error) => set({ error }),
  setLoadPageList: (flag) => set({ loadPageList: flag }),
  setPagelistHeirarchy: (tree) => set({ pagetree: tree }),
  //setPagelistData: (data) => set({ pagelistData: data }),
  setPagelistData: (data) => set({ pagelistData: normalizeArray(Object.values(data), 'pageid') }),
  setScreenIndex: (index) => set({ screenIndex: index }),
  /*setOpenedPages: (page: any) =>
    set((state) => {
      const exists = state.openedPages.some((p) => p.pageid === page.pageid);
      if (exists) return state;

      return {
        openedPages: [...state.openedPages, page],
        activePageId: page.pageid // auto-focus new tab
      };
    }),
    
    removeOpenedPage: (pageid: string) =>
      set((state) => {
        const updated = state.openedPages.filter((p) => p.pageid !== pageid);
        
        return {
          openedPages: updated,
          activePageId:
          updated.length > 0 ? updated[updated.length - 1].pageid : null,
        };
      }),*/
    setOpenedPages: (pageid: string) => set((state) => {
      const exists = state.openedPages.includes(pageid);
      if (exists) return state;
  
      return {
        openedPages: [...state.openedPages, pageid],
        activePageId: pageid, // auto-focus new tab
      };
    }),  
    
    removeOpenedPage: (pageid: string) => set((state) => {
      const updated = state.openedPages.filter((p) => p !== pageid);
      
      return {
        openedPages: updated,
        activePageId: updated.length > 0 ? updated[updated.length - 1] : '-1',
      };
    }),

    setActivePage: (pageid: string) => set({ activePageId: pageid }),

    updateActivePageChildren: (nextChildren: any[]) => {
      const { pagelistData, activePageId } = get();
      if (!pagelistData) return;

      const pageData = pagelistData[activePageId];
      if (!pageData) return;

      const screenIndex = pageData._selectedScreenIndex;

      const updatedPageData = {
        ...pageData,
        screenData: pageData.screenData.map((screen: any, idx:number) =>
          idx === screenIndex
            ? {
                ...screen,
                Children: screen.Children.map((child: any, cIdx:number) =>
                  cIdx === 0
                    ? { ...child, Children: nextChildren }
                    : child
                ),
              }
            : screen
        ),
      };

      set({
        pagelistData: {
          ...pagelistData,
          [activePageId]: updatedPageData,
        },
      });
    },

}));

export function normalizeArray<T extends Record<string, any>>(
  arr: T[],
  key: keyof T
): Record<string, T> {
  return arr.reduce((acc, item) => {
    const id = String(item[key]);
    acc[id] = item;
    return acc;
  }, {} as Record<string, T>);
}
