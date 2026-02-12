import { ZoomIn, ZoomOut, PanTool, PanToolOutlined, CenterFocusStrong } from "@mui/icons-material";
import { Box, Divider, Paper, Switch, Tooltip, Typography } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ThemedToggleButton from "./ThemedToggleButton";
import { useAssetStore } from "../store/appAssetsStore";

/**
 * DesignCanvas.tsx
 * - World-space canvas (Option A)
 * - Multi-select, rubberband, resize handles (selected-only)
 * - Grid & edge snapping
 * - Keyboard shortcuts, copy/paste/duplicate, group move
 *
 * Notes:
 *  - childrenItems are maintained in world coordinates (x,y,w,h)
 *  - parent container is expected to fill an area; canvas clamps inside parent.
 */

/* =======================
   Types & Interfaces
   ======================= */

export interface CanvasChild {
  id: string;
  x: number; // world coordinates
  y: number;
  w: number;
  h: number;
  childdef?: any;
}

export type CanvasChangeOp = "add" | "remove" | "move" | "resize" | "update";
export interface CanvasChangeMeta {
  op: CanvasChangeOp;
  ids: string[];
  children?: CanvasChild[];
  note?: string;
}

export interface DesignCanvasProps {
  childrenItems: CanvasChild[]; // initial / controlled list
  onChildrenChange?: (items: CanvasChild[], meta?: CanvasChangeMeta) => void;
  onSelectionChange?: (ids: string[]) => void;
  minZoom?: number;
  maxZoom?: number;
  width?: number; // world width (content area)
  height?: number; // world height
  background?: string;
  initialSnap?: boolean;
  gridSize?: number;
  enablePan?: boolean;
}

export interface DesignCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  resetView: () => void;
  toggleSnap: () => void;
  isSnapOn: () => boolean;
}

const INFOHEIGHT_MARGIN = 48;

/* =======================
   Helpers
   ======================= */
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* =======================
   Component
   ======================= */
const DesignCanvas = forwardRef<DesignCanvasHandle, DesignCanvasProps>(
  function DesignCanvas(
    {
      childrenItems,
      onChildrenChange,
      onSelectionChange,
      minZoom = 0.25,
      maxZoom = 4,
      width = 2000,
      height = 1600,
      background = "#fff",
      initialSnap = false,
      gridSize = 20,
    },
    ref
  ) {
    // refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // state: transform
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // world -> screen mapping via transform

    // children state (semi-controlled)
    const [children, setChildren] = useState<CanvasChild[]>(
      childrenItems ?? []
    );
    
    useEffect(() => {
      if (childrenItems && Array.isArray(childrenItems)) {
        setChildren(childrenItems);
      }
    }, [childrenItems]);

    //console.info(childrenItems, ".... children ....", children);

    const notifyChildren = (next: CanvasChild[], meta?: CanvasChangeMeta) => {
      setChildren(next);
      if (onChildrenChange) onChildrenChange(next, meta);
    };

    // selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const setSelection = (next: string[] | ((prev: string[]) => string[])) => {
      setSelectedIds(prev => {
        const resolved = typeof next === "function" ? (next as (p: string[]) => string[])(prev) : next;
        if (onSelectionChange) onSelectionChange(resolved);
        return resolved;
      });
    };

    // clipboard for copy/paste
    const clipboardRef = useRef<CanvasChild[] | null>(null);

    // snapping
    const [snapEnabled, setSnapEnabled] = useState<boolean>(initialSnap);
    //const snapThreshold = 8; // px in world coords for edge snapping
    const [gridGap, setGridGap] = useState<number>(gridSize);

    // internal flags for interactions
    //const isPanning = useRef(false);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const lastPan = useRef({ x: 0, y: 0 });
    const dragGroup = useRef<string[] | null>(null); // ids being dragged
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const dragChildStart = useRef<Map<string, { x: number; y: number }>>(new Map());

    // rubberband (marquee) selection in world coords
    const [rubber, setRubber] = useState<null | { x: number; y: number; w: number; h: number }>(null);
    const rubberStart = useRef<{ x: number; y: number } | null>(null);
    const isRubberActive = useRef(false);

    // resize state
    const resizingRef = useRef<null | {
      id: string;
      handle: string; // e.g., 'nw','s','e' etc
      startMouse: { x: number; y: number };
      startRect: { x: number; y: number; w: number; h: number };
    }>(null);

    useEffect(() => {
      autoFitOnLoad();
    }, [width, height]);

    function autoFitOnLoad() {
      if (!containerRef.current) return;

      const parentRect = containerRef.current.getBoundingClientRect();

      // canvas world size = your actual design area
      const worldW = width;
      const worldH = height;

      const scaleX = parentRect.width / worldW;
      const scaleY = Math.floor(parentRect.height - INFOHEIGHT_MARGIN) / worldH;

      const newScale = Math.min(scaleX, scaleY, 1); // never exceed 100%

      // center horizontally (and vertically if needed)
      const offsetX = (parentRect.width - worldW * newScale) / 2;
      const offsetY = (parentRect.height - worldH * newScale) / 2;

      setScale(newScale);
      setOffset({ x: offsetX, y: offsetY - INFOHEIGHT_MARGIN/2});
    }

    /* =======================
       Imperative handle (toolbar)
       ======================= */
    useImperativeHandle(ref, () => ({
      zoomIn: () => zoomBy(1.15),
      zoomOut: () => zoomBy(1 / 1.15),
      fitToScreen: () => fitToScreen(),
      resetView: () => resetView(),
      toggleSnap: () => setSnapEnabled((s) => !s),
      isSnapOn: () => snapEnabled,
    }), [scale, offset, snapEnabled, width, height, gridGap]);

    /* =======================
       Coordinate utilities
       ======================= */
    // Client -> World coords (relative to content top-left)
    function clientToWorld(cx: number, cy: number) {
      const cont = contentRef.current;
      if (!cont) return { x: 0, y: 0 };
      const rect = cont.getBoundingClientRect();
      return {
        x: (cx - rect.left) / scale,
        y: (cy - rect.top) / scale,
      };
    }

    // World -> Screen offset for rendering rubberband etc
    function worldToScreenX(wx: number) {
      return offset.x + wx * scale;
    }
    function worldToScreenY(wy: number) {
      return offset.y + wy * scale;
    }

    /* =======================
       Clamp canvas offset inside parent (no auto-centering)
       Behavior:
         - Ensures left edge >= 0 and right edge <= parent.width
         - So offset.x is clamped to [minX, maxX]
         - minX = Math.min(0, parentW - contentW); maxX = Math.max(0, parentW - contentW)? Simpler as below:
    ======================= */
    function clampOffsetInsideParent(nextOffset?: { x: number; y: number }) {
      const parent = containerRef.current?.getBoundingClientRect();
      if (!parent) return;

      const parentW = parent.width;
      const parentH = parent.height - INFOHEIGHT_MARGIN/2;

      const content = {
        w: width * scale,
        h: height * scale,
      };

      let newX = nextOffset?.x ?? 0;
      let newY = nextOffset?.y ?? 0;

      // --- Horizontal boundaries ---
      if (newX < 0) newX = 0; // left edge touches parent
      if (newX + content.w > parentW) newX = parentW - content.w; // right edge touches

      // --- Vertical boundaries ---
      if (newY < 0) newY = 0; // top edge touches
      if (newY + content.h > parentH) newY = parentH - content.h; // bottom edge touches

      return { x: newX, y: newY };
    }

    /* =======================
       Zooming (cursor-centered)
       ======================= */
    function onWheel(e: React.WheelEvent) {
      // ctrlKey or normal wheel both used; prevent page scroll
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = 1 + Math.sign(delta) * Math.min(0.25, Math.abs(delta) / 600);
      const prevScale = scale;
      let newScale = clamp(prevScale * zoomFactor, minZoom, maxZoom);

      // keep world point under cursor stable
      const rect = contentRef.current?.getBoundingClientRect();
      if (!rect) {
        setScale(newScale);
        return;
      }
      const cx = e.clientX;
      const cy = e.clientY;
      const worldBefore = clientToWorld(cx, cy);
      setScale(newScale);

      // compute new offset so worldBefore maps to same client position
      const newOffsetX = cx - rect.left - worldBefore.x * newScale;
      const newOffsetY = cy - rect.top - worldBefore.y * newScale;
      setOffset({ x: newOffsetX, y: newOffsetY });

      // clamp offset afterwards
      requestAnimationFrame(() => clampOffsetInsideParent());
    }
    function zoomTo(scaleTo: number, centerWorld?: { x: number; y: number }) {
      const contRect = contentRef.current?.getBoundingClientRect();
      if (!contRect) { setScale(scaleTo); return; }

      const center = centerWorld
        ? { x: worldToScreenX(centerWorld.x), y: worldToScreenY(centerWorld.y) }
        : { x: contRect.left + contRect.width / 2, y: contRect.top + contRect.height / 2 };
      const worldBefore = clientToWorld(center.x, center.y);

      const newScale = clamp(scaleTo, minZoom, maxZoom);
      setScale(newScale);
      let newOffsetX = center.x - (contentRef.current!.getBoundingClientRect().left) - worldBefore.x * newScale;
      newOffsetX = newOffsetX < 0 ? 10 : newOffsetX;
      let newOffsetY = center.y - (contentRef.current!.getBoundingClientRect().top) - worldBefore.y * newScale;
      newOffsetY = newOffsetY < 0 ? 10 : newOffsetY;
      setOffset({ x: newOffsetX, y: newOffsetY });
      requestAnimationFrame(() => clampOffsetInsideParent());
    }
    function zoomBy(factor: number) {
      zoomTo(scale * factor);
    }
    function fitToScreen() {
      const parent = containerRef.current?.getBoundingClientRect();
      if (!parent) return;
      const sx = parent.width / width;
      const sy = parent.height / height;
      const targetScale = Math.min(sx, sy, 1); // never zoom >1 on fit
      setScale(targetScale);
      // position so top-left of content maps to offset that keeps content inside parent (we choose offset.x = 0)
      // But we must respect "not going outside": place offset.x = 0 so left aligns with parent left
      // and ensure content right <= parent.width: if contentW > parent.width, offset negative; but since targetScale <= parent ratio, contentW <= parent.width
      //const contentW = width * targetScale;
      //const contentH = height * targetScale;
      const newOffsetX = 0; // align left
      const newOffsetY = 0; // align top
      setOffset({ x: newOffsetX, y: newOffsetY });
      requestAnimationFrame(() => clampOffsetInsideParent());
    }

    function resetView() {
      //setScale(1);
      //setOffset({ x: 0, y: 0 });
      autoFitOnLoad();
      requestAnimationFrame(() => clampOffsetInsideParent());
    }

    /* =======================
       Panning (clamped)
       ======================= */

    function clampCanvasPosition(x: number, y: number, contentW: number, contentH: number) {
      const parent = containerRef.current?.getBoundingClientRect();
      if (!parent) return { x, y };

      const parentW = parent.width;
      const parentH = parent.height - INFOHEIGHT_MARGIN/2;

      let newX = x;
      let newY = y;

      // --- Horizontal boundaries ---
      if (newX < 0) newX = 0; // left edge touches parent
      if (newX + contentW > parentW) newX = parentW - contentW; // right edge touches

      // --- Vertical boundaries ---
      if (newY < 0) newY = 0; // top edge touches
      if (newY + contentH > parentH) newY = parentH - contentH; // bottom edge touches

      return { x: newX, y: newY };
    }

    function onPointerDownCanvas(e: React.PointerEvent) {
      // start panning only when clicking the content background (not on child or handle)
      if (e.target !== contentRef.current) return;
      // clear selection unless shift pressed
      if (!e.shiftKey) setSelection([]);

      if(isPanning){
        // start pan on middle-button or left on empty area (we let children stopPropagation when needed)
        if (e.button === 1 || e.button === 0) {
          //setIsPanning(true);
          lastPan.current = { x: e.clientX, y: e.clientY };
          try {
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
          } catch {}
        }
      }else{
        
        //isPanning.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        // also begin possible rubber
        // rubber starts if user moves without initiating child drag
        rubberStart.current = clientToWorld(e.clientX, e.clientY);
        isRubberActive.current = true;
        setRubber({ x: rubberStart.current.x, y: rubberStart.current.y, w: 0, h: 0 });
      }
    }

    function onPointerMoveCanvas(e: React.PointerEvent) {
      // priority: resizing?
      if (resizingRef.current) return;
      // If a child group is being dragged (dragGroup set), handle separately (we attach group dragging on child pointerdown)
      if (dragGroup.current && dragStartPos.current) {
        // group drag is handled on window pointermove attached in child pointerdown handler
        return;
      }

      // if rubber active and user moved more than small threshold -> update rubber rectangle
      if (isRubberActive.current && rubberStart.current) {
        const world = clientToWorld(e.clientX, e.clientY);
        const sx = Math.min(rubberStart.current.x, world.x);
        const sy = Math.min(rubberStart.current.y, world.y);
        const sw = Math.abs(world.x - rubberStart.current.x);
        const sh = Math.abs(world.y - rubberStart.current.y);
        setRubber({ x: sx, y: sy, w: sw, h: sh });
        return;
      }

      //if (!isPanning.current) return;
      if (!isPanning) return;

      const dx = e.clientX - lastPan.current.x;
      const dy = e.clientY - lastPan.current.y;
      lastPan.current = { x: e.clientX, y: e.clientY };

      const newX = offset.x + dx;
      const newY = offset.y + dy;
      // clamp so content cannot leave parent boundaries
      const parent = containerRef.current?.getBoundingClientRect();
      if (!parent) {
        setOffset({ x: newX, y: newY });
        return;
      }
      const contentW = width * scale;
      const contentH = height * scale;

      setOffset(prev => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;
        return clampCanvasPosition(newX, newY, contentW, contentH);
      });
    }

    function onPointerUpCanvas(e?: React.PointerEvent) {
      // end panning or rubber
      //isPanning.current = false;
      setIsPanning(false);
      (e?.currentTarget as Element)?.releasePointerCapture?.(e?.pointerId ?? 0);

      if (isRubberActive.current) {
        isRubberActive.current = false;
        const box = rubber;
        setRubber(null);
        if (box) {
          // select items intersecting box (rubber in world coords)
          const selected = children.filter((c) => {
            if (c.x + c.w < box.x) return false;
            if (c.x > box.x + box.w) return false;
            if (c.y + c.h < box.y) return false;
            if (c.y > box.y + box.h) return false;
            return true;
          }).map(c => c.id);
        setSelection(selected);
        }
      }
    }

    /* =======================
       Child drag (group) handlers
       - start: onPointerDown on child
       - group drag state saved in dragGroup, dragStartPos and dragChildStart (map)
    ======================= */
    function onPointerDownChild(e: React.PointerEvent, id: string) {
      e.stopPropagation();
      // selection handling
      if (e.shiftKey) {
        setSelection(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
      } else {
        setSelection(prev => (prev.includes(id) ? prev : [id]));
      }

      // begin group drag
      dragGroup.current = selectedIds.length > 0 ? selectedIds.includes(id) ? selectedIds.slice() : [id] : [id];
      // set start positions
      dragStartPos.current = clientToWorld(e.clientX, e.clientY);
      dragChildStart.current = new Map();
      dragGroup.current.forEach(sid => {
        const ch = children.find(c => c.id === sid);
        if (ch) dragChildStart.current.set(sid, { x: ch.x, y: ch.y });
      });

      // attach window move/up for robust dragging
      const onMove = (ev: PointerEvent) => {
        if (!dragStartPos.current) return;
        const curWorld = clientToWorld(ev.clientX, ev.clientY);
        const dx = curWorld.x - dragStartPos.current.x;
        const dy = curWorld.y - dragStartPos.current.y;

        // move each child in group with boundary clamp (child inside canvas bounds)
        const updated = children.map(c => {
          if (!dragGroup.current!.includes(c.id)) return c;
          const start = dragChildStart.current.get(c.id)!;
          let nx = start.x + dx;
          let ny = start.y + dy;

          // optionally snap to grid/edges
          if (snapEnabled) {
            nx = Math.round(nx / gridGap) * gridGap;
            ny = Math.round(ny / gridGap) * gridGap;
          }
          // clamp inside canvas bounds (world coordinates)
          nx = clamp(nx, 0, width - c.w);
          ny = clamp(ny, 0, height - c.h);
          return { ...c, x: nx, y: ny };
        });
        notifyChildren(updated, { op: "move", ids: dragGroup.current!, note: "drag-move" });
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        dragGroup.current = null;
        dragStartPos.current = null;
        dragChildStart.current = new Map();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    /* =======================
       Child resizing (selected-only)
    ======================= */
    function startResize(id: string, handle: string, e: React.PointerEvent) {
      e.stopPropagation();
      const ch = children.find(c => c.id === id);
      if (!ch) return;
      resizingRef.current = {
        id,
        handle,
        startMouse: { x: e.clientX, y: e.clientY },
        startRect: { x: ch.x, y: ch.y, w: ch.w, h: ch.h },
      };

      const onMove = (ev: PointerEvent) => {
        if (!resizingRef.current) return;
        const r = resizingRef.current;
        const dx = (ev.clientX - r.startMouse.x) / 1 / /*world units*/ 1; // world units, since mouse in client should be converted to world delta using scale
        const dy = (ev.clientY - r.startMouse.y) / 1 / /*we'll convert*/ 1;
        // convert dx/dy from client -> world: need scale and content rect:
        const contRect = contentRef.current?.getBoundingClientRect();
        if (!contRect) return;
        // mouse movement in world coords:
        const worldDx = dx / scale;
        const worldDy = dy / scale;

        let nx = r.startRect.x;
        let ny = r.startRect.y;
        let nw = r.startRect.w;
        let nh = r.startRect.h;

        // handle codes: 'n','s','e','w' combined e.g. 'nw'
        if (handle.includes("e")) nw = Math.max(20, r.startRect.w + worldDx);
        if (handle.includes("s")) nh = Math.max(20, r.startRect.h + worldDy);
        if (handle.includes("w")) {
          nx = r.startRect.x + worldDx;
          nw = Math.max(20, r.startRect.w - worldDx);
        }
        if (handle.includes("n")) {
          ny = r.startRect.y + worldDy;
          nh = Math.max(20, r.startRect.h - worldDy);
        }

        // snapping
        if (snapEnabled) {
          nx = Math.round(nx / gridGap) * gridGap;
          ny = Math.round(ny / gridGap) * gridGap;
          nw = Math.round(nw / gridGap) * gridGap;
          nh = Math.round(nh / gridGap) * gridGap;
        }

        // clamp inside canvas
        if (nx < 0) { nw += nx; nx = 0; } // if left moved beyond 0, reduce width
        if (ny < 0) { nh += ny; ny = 0; }
        if (nx + nw > width) nw = width - nx;
        if (ny + nh > height) nh = height - ny;
        // minimum
        nw = Math.max(12, nw);
        nh = Math.max(12, nh);

        const updated = children.map(c => c.id === id ? { ...c, x: nx, y: ny, w: nw, h: nh } : c);
        notifyChildren(updated, { op: "resize", ids: [id], note: "resize" });
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        resizingRef.current = null;
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    /* =======================
       Snapping to other elements edges (simple algorithm)
       If any moving edge is within `snapThreshold` world pixels of another element's edge,
       snap to that edge.
    ======================= */
    /*function snapEdgeCandidate(nx: number, ny: number, w: number, h: number, ignoreId?: string) {
      if (!snapEnabled) return { x: nx, y: ny };

      const threshold = snapThreshold;
      let snappedX = nx;
      let snappedY = ny;

      // edges of moving box
      const left = nx;
      const right = nx + w;
      const top = ny;
      const bottom = ny + h;
      // examine other children edges
      for (const ch of children) {
        if (ch.id === ignoreId) continue;
        const othLeft = ch.x;
        const othRight = ch.x + ch.w;
        const othTop = ch.y;
        const othBottom = ch.y + ch.h;
        // horizontal snapping (align left/right to oth left/right)
        if (Math.abs(left - othLeft) <= threshold) snappedX = othLeft;
        if (Math.abs(left - othRight) <= threshold) snappedX = othRight;
        if (Math.abs(right - othLeft) <= threshold) snappedX = othLeft - w;
        if (Math.abs(right - othRight) <= threshold) snappedX = othRight - w;
        // vertical snapping
        if (Math.abs(top - othTop) <= threshold) snappedY = othTop;
        if (Math.abs(top - othBottom) <= threshold) snappedY = othBottom;
        if (Math.abs(bottom - othTop) <= threshold) snappedY = othTop - h;
        if (Math.abs(bottom - othBottom) <= threshold) snappedY = othBottom - h;
      }
      // grid snapping as well
      if (snapEnabled && gridGap > 1) {
        snappedX = Math.round(snappedX / gridGap) * gridGap;
        snappedY = Math.round(snappedY / gridGap) * gridGap;
      }
      return { x: snappedX, y: snappedY };
    }*/

    /* =======================
       Keyboard shortcuts: delete, arrows, ctrl+a, ctrl+c/v, ctrl+d
    ======================= */
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        const ctrl = e.ctrlKey || e.metaKey;

        // Ctrl/Cmd + A => select all
        if (ctrl && e.key.toLowerCase() === "a") {
          e.preventDefault();
          setSelection(children.map(c => c.id));
          return;
        }
        // Ctrl/Cmd + C => copy
        if (ctrl && e.key.toLowerCase() === "c") {
          e.preventDefault();
          clipboardRef.current = children.filter(c => selectedIds.includes(c.id)).map(c => ({ ...c }));
          return;
        }
        // Ctrl/Cmd + V => paste
        if (ctrl && e.key.toLowerCase() === "v") {
          e.preventDefault();
          const clip = clipboardRef.current;
          if (!clip || clip.length === 0) return;
          // paste with offset and new ids, clamp to canvas
          const offsetStep = 20;
          const next: CanvasChild[] = [...children];
          const pastedIds: string[] = [];
          for (const item of clip) {
            const copy = { ...JSON.parse(JSON.stringify(item)), id: uid("p_"), x: clamp(item.x + offsetStep, 0, width - item.w), y: clamp(item.y + offsetStep, 0, height - item.h) };
            copy.childdef['_uid'] = copy.id;
            copy.childdef['name'] = item.childdef['name'] +"_"+ copy.id.replace("p_", "");
            next.push(copy);
            pastedIds.push(copy.id);
          }
          notifyChildren(next, { op: "add", ids: pastedIds, children: next.filter(c => pastedIds.includes(c.id)), note: "paste" });
          setSelection(pastedIds);
          return;
        }
        // Ctrl/Cmd + D => duplicate (quick duplicate)
        /*if (ctrl && e.key.toLowerCase() === "d") {
          e.preventDefault();
          const next = [...children];
          const newSel: string[] = [];
          for (const id of selectedIds) {
            const orig = children.find(c => c.id === id);
            if (!orig) continue;
            const copy = { ...orig, id: uid("dup_"), x: clamp(orig.x + 10, 0, width - orig.w), y: clamp(orig.y + 10, 0, height - orig.h) };
            next.push(copy);
            newSel.push(copy.id);
          }
          notifyChildren(next, { op: "add", ids: newSel, children: next.filter(c => newSel.includes(c.id)), note: "duplicate" });
          setSelection(newSel);
          return;
        }*/
        // Delete
        if (e.key === "Delete" || e.key === "Backspace") {
          if (selectedIds.length === 0) return;
          e.preventDefault();
          const removed = children.filter(c => selectedIds.includes(c.id));
          const next = children.filter(c => !selectedIds.includes(c.id));
          notifyChildren(next, { op: "remove", ids: selectedIds, children: removed, note: "delete" });
          setSelection([]);
          return;
        }
        // Arrows — move selected
        const arrowStep = e.shiftKey ? 10 : 1;
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
          e.preventDefault();
          const dx = e.key === "ArrowLeft" ? -arrowStep : e.key === "ArrowRight" ? arrowStep : 0;
          const dy = e.key === "ArrowUp" ? -arrowStep : e.key === "ArrowDown" ? arrowStep : 0;
          if (dx === 0 && dy === 0) return;
          const next = children.map(c => {
            if (!selectedIds.includes(c.id)) return c;
            let nx = c.x + dx;
            let ny = c.y + dy;
            if (snapEnabled) {
              nx = Math.round(nx / gridGap) * gridGap;
              ny = Math.round(ny / gridGap) * gridGap;
            }
            nx = clamp(nx, 0, width - c.w);
            ny = clamp(ny, 0, height - c.h);
            return { ...c, x: nx, y: ny };
          });
          notifyChildren(next, { op: "move", ids: selectedIds, note: "arrow-move" });
          return;
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [children, selectedIds, gridGap, snapEnabled, width, height]);

    /* =======================
       UIPart helpers
    ======================= */
    const uiPartDicFromStore = useAssetStore(state => state.uiPartDic);

    function resolveUIPart(name: string) {
      const parts = (uiPartDicFromStore as any)?.UIParts || [];
      const base = parts.find((p: any) => p.name === "BaseUI")?.dic || {};
      const target = parts.find((p: any) => p.name === name)?.dic || {};
      // shallow + frame merge so nested frame uses target when provided
      const merged = {
        ...base,
        ...target,
        frame: {
          ...(base?.frame || {}),
          ...(target?.frame || {}),
        },
        name, // ensure name is set
      };
      return merged;
    }

    /* =======================
       Drop handlers for UI components
    ======================= */
    function onDragOver(e: React.DragEvent) {
      // Allow drop only if it's a UI component
      if (e.dataTransfer.types.includes("application/x-ui-item")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    }

    function onDrop(e: React.DragEvent) {
      e.preventDefault();
      e.stopPropagation();

      // Get the UI item data
      const data = e.dataTransfer.getData("application/x-ui-item");
      if (!data) return;

      try {
        const uiItem = JSON.parse(data) as {
          name: string;
          text: string;
          visible: string;
          imagePath: string;
          description?: string;
          type?: string;
        };

        // Convert drop coordinates to world coordinates
        const worldPos = clientToWorld(e.clientX, e.clientY);

        let mergedDic:any = resolveUIPart(uiItem.name);

        // Default dimensions for new component based on UIPartDic frame
        const defaultWidth = mergedDic?.frame?.width ?? 100;
        const defaultHeight = mergedDic?.frame?.height ?? 50;

        // Calculate position (center the component on drop point, or use top-left)
        let x = worldPos.x - defaultWidth / 2;
        let y = worldPos.y - defaultHeight / 2;

        // Apply snapping if enabled
        if (snapEnabled) {
          x = Math.round(x / gridGap) * gridGap;
          y = Math.round(y / gridGap) * gridGap;
        }

        // Clamp to canvas bounds
        x = clamp(x, 0, width - defaultWidth);
        y = clamp(y, 0, height - defaultHeight);

        const addedUIName = `${uiItem.name}_${children.length + 1}`;
        mergedDic.name = addedUIName;

        // Create new child
        const newChild: CanvasChild = {
          id: addedUIName,
          x,
          y,
          w: defaultWidth,
          h: defaultHeight,
          childdef: {
            ...mergedDic,
            // Store the UI component definition
            type: uiItem.type || uiItem.name,
            frame: {
              ...(mergedDic?.frame || {}),
              x,
              y,
              width: defaultWidth,
              height: defaultHeight,
            },
          },
        };

        // Add to children
        const next = [...children, newChild];
        notifyChildren(next, { op: "add", ids: [newChild.id], children: [newChild], note: "drop-add" });
        
        // Select the newly added component
        setSelection([newChild.id]);
      } catch (error) {
        console.error("Failed to parse dropped UI component:", error);
      }
    }

    /* =======================
       Render helpers: resize handles & child boxes
    ======================= */
    function RenderResizeHandles({ child }: { child: CanvasChild }) {
      const handles = [
        { key: "nw", left: 0, top: 0, cursor: "nwse-resize" },
        { key: "n", left: child.w / 2, top: 0, cursor: "ns-resize" },
        { key: "ne", left: child.w, top: 0, cursor: "nesw-resize" },
        { key: "w", left: 0, top: child.h / 2, cursor: "ew-resize" },
        { key: "e", left: child.w, top: child.h / 2, cursor: "ew-resize" },
        { key: "sw", left: 0, top: child.h, cursor: "nesw-resize" },
        { key: "s", left: child.w / 2, top: child.h, cursor: "ns-resize" },
        { key: "se", left: child.w, top: child.h, cursor: "nwse-resize" },
      ];
      return (
        <>
          {handles.map(h => (
            <div
              key={h.key}
              onPointerDown={(e) => startResize(child.id, h.key, e)}
              style={{
                position: "absolute",
                left: h.left - 6,
                top: h.top - 6,
                width: 12,
                height: 12,
                background: "#fff",
                border: "1px solid #0b74ff",
                borderRadius: 3,
                cursor: h.cursor as any,
                boxSizing: "border-box",
                zIndex: 40,
              }}
            />
          ))}
        </>
      );
    }

    /* =======================
       Render
    ======================= */
    return (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column-reverse'}}>
        <Paper elevation={1} 
          sx={{
              display:'flex', justifyContent:'flex-start', alignItems:'center', gap:0.5, 
              border:'1px solid #888', borderRadius:4, boxSizing:'border-box',
              width:'max-content', height:32, px:1, py:0, mx:1, my:0.5,
              position:'relative', zIndex:99
            }}
        >           
          <Tooltip title={isPanning ? "Panning On" : "Panning Off"}>
            <ThemedToggleButton value="Pan" sx={{ width: 20, height: 20 }} onClick={() => setIsPanning(!isPanning)} >
              {isPanning ? <PanTool /> : <PanToolOutlined />}
            </ThemedToggleButton>
          </Tooltip>  
          <Divider orientation="vertical" flexItem sx={{ background: "gray", mx: 0.5 }}/>
          <Tooltip title="Reset View">
            <ThemedToggleButton value="Reset" sx={{ width: 28, height: 28 }} onClick={() => resetView()} >
                <CenterFocusStrong />
            </ThemedToggleButton>   
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ background: "gray", mx: 0.5 }}/>
          <Tooltip title="Zoom In">
            <ThemedToggleButton value="ZoomIn" sx={{ width: 28, height: 28 }} onClick={() => zoomBy(1.15)} >
                <ZoomIn />
            </ThemedToggleButton>   
          </Tooltip>
          <Tooltip title="Zoom Out">
            <ThemedToggleButton value="ZoomOut" sx={{ width: 28, height: 28 }} onClick={() => zoomBy(1/1.15)} >
                <ZoomOut />
            </ThemedToggleButton>   
          </Tooltip>
          [{(scale * 100).toFixed(0)}%]          
          <Divider orientation="vertical" flexItem sx={{ background: "gray", mx: 0.5 }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Typography
                sx={(theme) => ({
                  color: theme.palette.mode === "light"
                            ? theme.palette.primary.dark        // dark text on light theme
                            : theme.palette.primary.light,
                })}
            >
              Snap:
            </Typography>
            <Tooltip title="Snapping On/ Off">
              <Switch checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} />
            </Tooltip>
            <Tooltip title="Snap Grid Size">
              <input id="numinput" style={{border:'2px solid #676767', borderRadius:'4px', width:48, height:24, marginRight:'10px'}}
                  type="number" value={gridGap} min="5" max="100" step="5"
                  onChange={e => setGridGap(Number(e.currentTarget.value))}
              />
            </Tooltip>
          </div>
                  
        </Paper>

        <div id="container"
          ref={containerRef}
          style={{
            touchAction: "none", 
            width: '100%',
            height: `calc(100% - 48px)`,
          }}
          onWheel={onWheel}
          onPointerDown={onPointerDownCanvas}
          onPointerMove={onPointerMoveCanvas}
          onPointerUp={onPointerUpCanvas}
          onPointerLeave={() => setIsPanning(false)}
        >
          {/* content (world) — we use an inner div to get bounding rect & transform */}
          <Box id="contentbox"
            ref={contentRef}
            data-canvas=""
            onDragOver={onDragOver}
            onDrop={onDrop}
            sx={(theme) => ({
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              width,
              height,
              minWidth: width,
              minHeight: height,             
              background: background,
              backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: `${gridGap}px ${gridGap}px, ${gridGap}px ${gridGap}px`,
              borderWidth: "8px",
              borderTopWidth: "12px",
              borderStyle: "solid",
              borderColor:
                theme.palette.mode === "light"
                  ? theme.palette.grey[800]   // dark border
                  : theme.palette.grey[400],  // light border
              borderRadius: "12px",
              cursor: isPanning ? "grabbing" : "auto",
            })}
          >
            {/* background "board" */}
            <div id="backgroundboard"
              style={{
                display: "none",
                width: width,
                height: height,
                background: 'transparent',
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                margin: 0,
                borderRadius: 2,
              }}
            />

            {/* children */}
            {children.map((ch) => {
              const isSelected = selectedIds.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  data-child="true"
                  // pointer events: child handles selection & drag
                  onPointerDown={(e) => onPointerDownChild(e, e.currentTarget ? (ch.id) : ch.id)}
                  style={{
                    position: "absolute",
                    left: ch.x,
                    top: ch.y,
                    width: ch.w,
                    height: ch.h,
                    boxSizing: "border-box",
                    background: getColorValue(ch.childdef.backgroundColor) || "transparent",
                    border: isSelected ? "2px solid #0b74ff" : "1px solid rgba(0,0,0,0.8)",
                    borderRadius: 2,
                    zIndex: isSelected ? 30 : 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "grab",
                  }}
                >
                  <div 
                    style={{ 
                      pointerEvents: "none",
                    }}
                  >
                    {ch.childdef?.text || ch.childdef?.name || ch.id}
                  </div>
                  {/* render resize handles only when selected */}
                  {isSelected && <RenderResizeHandles child={ch} />}
                </div>
              );
            })}

            {/* rubberband overlay (in world coords, scaled by transform because it's inside content div) */}
            {rubber && (
              <div
                style={{
                  position: "absolute",
                  left: rubber.x,
                  top: rubber.y,
                  width: rubber.w,
                  height: rubber.h,
                  border: "1px dashed #0b74ff",
                  background: "rgba(11,116,255,0.4)",
                  zIndex: 60,
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>
        </div>
      </div>
    );
  }
);

function getColorValue(colorObj:any) {
  if(!colorObj) return "transparent";

  const _red = Math.ceil(colorObj.red * 255);
  const _green = Math.ceil(colorObj.green * 255);
  const _blue = Math.ceil(colorObj.blue * 255);

  const colorRGBA = "rgba(" + _red +','+ _green +','+ _blue +','+ colorObj.alpha +  ")";
  return colorRGBA;
}

export default DesignCanvas;