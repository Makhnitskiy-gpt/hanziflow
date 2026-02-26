/**
 * HanziFlow — useStylus hook
 *
 * Attaches pointer event listeners to a canvas ref for stylus
 * (M-Pencil) drawing. Supports pressure-sensitive strokes,
 * undo/redo, and export to data-URL.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { getStylusData, toCanvasCoords, pressureToWidth } from '@/lib/stylus';
import type { StylusPoint, Stroke } from '@/types';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

interface UseStylusReturn {
  /** Attach this ref to a <canvas> element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Whether the user is currently drawing */
  isDrawing: boolean;
  /** Current pen pressure (0..1), 0 when not drawing */
  currentPressure: number;
  /** All committed strokes */
  strokes: Stroke[];
  /** Undo the last stroke */
  undo: () => void;
  /** Redo the last undone stroke */
  redo: () => void;
  /** Clear all strokes */
  clear: () => void;
  /** Export the canvas to a PNG data-URL */
  toDataUrl: () => string | null;
}

// ---------------------------------------------------------------------------
// Drawing config
// ---------------------------------------------------------------------------

function getStrokeColor(): string {
  if (typeof document === 'undefined') return '#1a1714';
  return getComputedStyle(document.documentElement).getPropertyValue('--color-stroke').trim() || '#1a1714';
}
const MIN_WIDTH = 1.5;
const MAX_WIDTH = 7;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStylus(): UseStylusReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPressure, setCurrentPressure] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  // Current in-progress stroke (not yet committed)
  const activeStrokeRef = useRef<Stroke>([]);

  // ------ Canvas rendering ------

  const redrawCanvas = useCallback(
    (allStrokes: Stroke[], activeStroke: Stroke) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all committed strokes + the active one
      const toDraw = [...allStrokes, activeStroke];

      for (const stroke of toDraw) {
        if (stroke.length < 2) continue;

        ctx.strokeStyle = getStrokeColor();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < stroke.length; i++) {
          const prev = stroke[i - 1];
          const curr = stroke[i];

          ctx.beginPath();
          ctx.lineWidth = pressureToWidth(curr.pressure, MIN_WIDTH, MAX_WIDTH);
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      }
    },
    [],
  );

  // ------ Pointer event handlers ------

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Prevent scrolling while drawing
      e.preventDefault();

      const raw = getStylusData(e);
      const point = toCanvasCoords(raw, canvas);

      activeStrokeRef.current = [point];
      setIsDrawing(true);
      setCurrentPressure(point.pressure);
      // Clear redo stack on new input
      setRedoStack([]);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      e.preventDefault();

      const raw = getStylusData(e);
      const point = toCanvasCoords(raw, canvas);

      activeStrokeRef.current.push(point);
      setCurrentPressure(point.pressure);

      redrawCanvas(strokes, activeStrokeRef.current);
    },
    [isDrawing, strokes, redrawCanvas],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDrawing) return;

      e.preventDefault();

      const finished = [...activeStrokeRef.current];
      activeStrokeRef.current = [];

      if (finished.length > 1) {
        setStrokes((prev) => {
          const next = [...prev, finished];
          redrawCanvas(next, []);
          return next;
        });
      }

      setIsDrawing(false);
      setCurrentPressure(0);
    },
    [isDrawing, redrawCanvas],
  );

  // ------ Attach / detach events ------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use { passive: false } to allow preventDefault on touch devices
    canvas.addEventListener('pointerdown', handlePointerDown, {
      passive: false,
    });
    canvas.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    });
    canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
    canvas.addEventListener('pointerleave', handlePointerUp, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // ------ Undo / Redo / Clear ------

  const undo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((r) => [...r, last]);
      const next = prev.slice(0, -1);
      redrawCanvas(next, []);
      return next;
    });
  }, [redrawCanvas]);

  const redo = useCallback(() => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      const last = prevRedo[prevRedo.length - 1];
      setStrokes((prevStrokes) => {
        const next = [...prevStrokes, last];
        redrawCanvas(next, []);
        return next;
      });
      return prevRedo.slice(0, -1);
    });
  }, [redrawCanvas]);

  const clear = useCallback(() => {
    setStrokes([]);
    setRedoStack([]);
    activeStrokeRef.current = [];
    redrawCanvas([], []);
  }, [redrawCanvas]);

  // ------ Export ------

  const toDataUrl = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, []);

  return {
    canvasRef,
    isDrawing,
    currentPressure,
    strokes,
    undo,
    redo,
    clear,
    toDataUrl,
  };
}
