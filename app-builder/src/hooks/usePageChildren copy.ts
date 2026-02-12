import { useState, useEffect, useCallback } from "react";

export interface CanvasChild {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    childdef?: any;
}

function convertUIToCanvasChild(ui: any): CanvasChild {
    const uipart = ui.uiParts[0];
    return {
        id: uipart.name,
        x: uipart.frame.x,
        y: uipart.frame.y,
        w: uipart.frame.width,
        h: uipart.frame.height,
        childdef: uipart
    };
}

export function usePageChildren(rawUiList: any[]) {
  const [items, setItems] = useState<CanvasChild[]>(() =>
    rawUiList.map(convertUIToCanvasChild)
  );

  /*useEffect(() => {
    setItems(rawUiList.map(convertUIToCanvasChild));
  }, [rawUiList]);*/

  useEffect(() => {
    setItems(prev => {
      const prevMap = new Map(prev.map(i => [i.id, i]));
      const next: CanvasChild[] = [];

      for (const ui of rawUiList) {
        const id = ui.name;
        const existing = prevMap.get(id);

        if (existing) {
          // keep canvas state but sync frame if page changed
          next.push({
            ...existing,
            x: ui.frame.x,
            y: ui.frame.y,
            w: ui.frame.width,
            h: ui.frame.height,
            childdef: ui
          });
        } else {
          // NEW child
          next.push(convertUIToCanvasChild(ui));
        }
      }

      return next;
    });
  }, [rawUiList]);


  // -------------------------
  // update only some fields
  // -------------------------
  /*const updateItem = useCallback((id: string, changes: Partial<CanvasChild>) => {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, ...changes } : it))
    );
  }, []);*/

  const updateItem = useCallback((id: string, metaPatch: any) => {
    setItems(prev =>
        prev.map(it => {
            if (it.id !== id) return it;

            return {
                ...it,
                childdef: {
                    ...it.childdef,
                    ...metaPatch
                }
            };
        })
    );
  }, []);


  // --------------------------------
  // 🚀 NEW: update frame in 1 place
  // --------------------------------
  const updateFrame = useCallback(
    (id: string, frameUpdate: Partial<{ x: number; y: number; width: number; height: number }>) => {
      setItems(prev =>
        prev.map(it => {
          if (it.id !== id) return it;

          const newX = frameUpdate.x ?? it.x;
          const newY = frameUpdate.y ?? it.y;
          const newW = frameUpdate.width ?? it.w;
          const newH = frameUpdate.height ?? it.h;

          return {
            ...it,
            x: newX,
            y: newY,
            w: newW,
            h: newH,
            childdef: {
              ...it.childdef,
              frame: {
                ...it.childdef.frame,
                x: newX,
                y: newY,
                width: newW,
                height: newH
              }
            }
          };
        })
      );
    },
    []
  );

  const updateMany = useCallback((ids: string[], fn: (c: CanvasChild) => CanvasChild) => {
    setItems(prev => prev.map(it => (ids.includes(it.id) ? fn(it) : it)));
  }, []);

  const addItem = useCallback((uiObj: any) => {
    setItems(prev => [...prev, convertUIToCanvasChild(uiObj)]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  return {
    items,
    setItems,
    updateItem,
    updateFrame,
    updateMany,
    addItem,
    removeItem
  };
}
