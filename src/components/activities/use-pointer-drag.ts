"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/** Distance in pixels a pointer must move before a press becomes a drag (otherwise it is a tap). */
const DRAG_THRESHOLD = 8;
/** While dragging near the top or bottom edge, the page scrolls so far-away drop zones stay reachable on phones. */
const EDGE_SCROLL_ZONE = 64;
const EDGE_SCROLL_STEP = 14;

export interface DragState {
  readonly itemId: string;
  readonly x: number;
  readonly y: number;
}

export interface DropTarget {
  readonly slotId: string | null;
  /** True when dropped on the tray (return the item). */
  readonly isTray: boolean;
}

/**
 * Pointer-events drag that works the same for mouse, pen and touch.
 * Drop targets are found by `data-slot-id` / `data-tray` attributes under the
 * pointer, so the hook stays independent of activity layout.
 */
export function usePointerDrag(onDrop: (itemId: string, target: DropTarget) => void, disabled: boolean) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const pressRef = useRef<{ itemId: string; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, itemId: string) => {
      if (disabled || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      pressRef.current = { itemId, x: event.clientX, y: event.clientY, dragging: false };
    },
    [disabled],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const press = pressRef.current;
    if (!press) return;
    if (!press.dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) < DRAG_THRESHOLD) return;
    press.dragging = true;
    setDrag({ itemId: press.itemId, x: event.clientX, y: event.clientY });
    if (event.clientY < EDGE_SCROLL_ZONE) window.scrollBy(0, -EDGE_SCROLL_STEP);
    else if (event.clientY > window.innerHeight - EDGE_SCROLL_ZONE) window.scrollBy(0, EDGE_SCROLL_STEP);
  }, []);

  const finish = useCallback(
    (event: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
      const press = pressRef.current;
      pressRef.current = null;
      if (!press?.dragging) return;
      setDrag(null);
      suppressClickRef.current = true;
      if (cancelled) return;
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const slot = element?.closest<HTMLElement>("[data-slot-id]");
      const tray = element?.closest("[data-tray]");
      if (slot?.dataset.slotId) onDrop(press.itemId, { slotId: slot.dataset.slotId, isTray: false });
      else if (tray) onDrop(press.itemId, { slotId: null, isTray: true });
    },
    [onDrop],
  );

  /** Returns true when the click that follows a drag should be ignored. */
  const consumeSuppressedClick = useCallback(() => {
    const suppressed = suppressClickRef.current;
    suppressClickRef.current = false;
    return suppressed;
  }, []);

  return {
    drag,
    consumeSuppressedClick,
    handlers: (itemId: string) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => onPointerDown(event, itemId),
      onPointerMove,
      onPointerUp: (event: ReactPointerEvent<HTMLElement>) => finish(event, false),
      onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => finish(event, true),
    }),
  };
}
