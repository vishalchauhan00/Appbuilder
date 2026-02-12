import { useState, useEffect, useRef, useCallback } from "react";
import type { CanvasChild } from "../components/DesignCanvas";

function convertUIToCanvasChild(ui: any): CanvasChild {  
  //const uipart = ui.uiParts[0];

  const uipart = normalizeToUiDef(ui);
  if (!uipart) {
    throw new Error("Cannot convert child: invalid structure");
  }

  return {
      id: uipart.name,
      x: uipart.frame.x,
      y: uipart.frame.y,
      w: uipart.frame.width,
      h: uipart.frame.height,
      childdef: uipart
  };
}

function normalizeToUiDef(input: any): any | null {
  // Case 1: already a CanvasChild-like object
  if (input?.childdef && input?.childdef.frame) {
    return input.childdef;
  }

  // Case 2: wrapper with uiParts
  if (Array.isArray(input?.uiParts) && input.uiParts[0]?.frame) {
    return input.uiParts[0];
  }

  // Case 3: already a uiDef
  if (input?.frame && input?.name) {
    return input;
  }

  // Unknown / invalid
  console.warn("Unknown child shape:", input);
  return null;
}

export function usePageChildren(
  pageKey: string | number,
  rawUiList: any[],
  onCommit?: (nextChildren: any[]) => void
) {
  const [items, setItems] = useState<CanvasChild[]>([]);

  /* ---------------------------
     PAGE → CANVAS (sync)
  --------------------------- */

  const lastPageKeyRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (lastPageKeyRef.current !== pageKey) {
      lastPageKeyRef.current = pageKey;

      setItems(
        rawUiList
          .map(convertUIToCanvasChild)
          .filter(Boolean)
      );
      return;
    }

    setItems(prev => {
      const map = new Map(prev.map(i => [i.id, i]));

      return rawUiList
        .map(input => {
          const uiDef = normalizeToUiDef(input);
          if (!uiDef) return null;

          const existing = map.get(uiDef.name);
          if (existing) {
            return {
              ...existing,
              x: uiDef.frame.x,
              y: uiDef.frame.y,
              w: uiDef.frame.width,
              h: uiDef.frame.height,
              childdef: uiDef
            };
          }

          return convertUIToCanvasChild(uiDef);
        })
        .filter(Boolean) as CanvasChild[];
    });
  }, [pageKey, rawUiList]);


  /* ---------------------------
     Helper: commit to parent
  --------------------------- */
  const commit = useCallback((nextItems: CanvasChild[]) => {
    if (!onCommit) return;

    const nextUiChildren = nextItems.map(ch => ({
      ...ch.childdef,
      frame: {
        ...ch.childdef.frame,
        x: ch.x,
        y: ch.y,
        width: ch.w,
        height: ch.h
      }
    }));

    onCommit(nextUiChildren);
  }, [onCommit]);

  /* ---------------------------
     API used by Canvas
  --------------------------- */
  const updateItem = useCallback((id: string, metaPatch: any) => {
    setItems(prev => {
      const next = prev.map(it =>
        it.id === id
          ? { ...it, childdef: { ...it.childdef, ...metaPatch } }
          : it
      );
      commit(next);
      return next;
    });
  }, [commit]);

  const updateFrame = useCallback((id: string, framePatch: Partial<{ x: number; y: number; width: number; height: number }>) => {
    setItems(prev => {
      const next = prev.map(it => {
        if (it.id !== id) return it;
        const x = framePatch.x ?? it.x;
        const y = framePatch.y ?? it.y;
        const w = framePatch.width ?? it.w;
        const h = framePatch.height ?? it.h;
        return {
          ...it,
          x, y, w, h,
          childdef: {
            ...it.childdef,
            frame: { ...it.childdef.frame, x, y, width: w, height: h }
          }
        };
      });
      commit(next);
      return next;
    });
  }, [commit]);

  const addItem = useCallback((uiDef: any) => {
    const uiObj = {
      uiParts: [uiDef],
      viewType: uiDef.viewType,
      _uid: ""
    }
    setItems(prev => {
      const next = [...prev, convertUIToCanvasChild(uiObj)];
      commit(next);
      return next;
    });
  }, [commit]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      commit(next);
      return next;
    });
  }, [commit]);

  return { items, updateItem, updateFrame, addItem, removeItem };
}