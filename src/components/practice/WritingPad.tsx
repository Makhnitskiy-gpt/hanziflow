import { useRef, useState, useEffect, useCallback } from 'react';
import { db } from '@/db';
import type { StylusPoint, Stroke } from '@/types';

interface WritingPadProps {
  itemId?: number;
  itemType?: 'radical' | 'character';
}

export function WritingPad({ itemId, itemType }: WritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<StylusPoint[]>([]);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const saveState = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [getContext]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPoint = (e: React.PointerEvent): StylusPoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    saveState();
    setIsDrawing(true);
    currentStrokeRef.current = [];

    const point = getPoint(e);
    currentStrokeRef.current.push(point);

    const ctx = getContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penSize * 6;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#e8e0d4'; // rice color
      ctx.lineWidth = penSize * (0.5 + point.pressure);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPoint(e);
    currentStrokeRef.current.push(point);

    const ctx = getContext();
    if (!ctx) return;

    if (!isEraser) {
      ctx.lineWidth = penSize * (0.5 + point.pressure);
    }
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const ctx = getContext();
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
  };

  const handleUndo = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas || undoStackRef.current.length === 0) return;

    redoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const prev = undoStackRef.current.pop()!;
    ctx.putImageData(prev, 0, 0);

    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas || redoStackRef.current.length === 0) return;

    undoStackRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const next = redoStackRef.current.pop()!;
    ctx.putImageData(next, 0, 0);

    setCanRedo(redoStackRef.current.length > 0);
    setCanUndo(true);
  };

  const handleClear = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !itemId || !itemType) return;

    const dataUrl = canvas.toDataURL('image/png');
    const now = new Date();

    // Check if mnemonic already exists
    const existing = await db.mnemonics
      .where('[itemType+itemId]')
      .equals([itemType, itemId])
      .first();

    if (existing) {
      await db.mnemonics.update(existing.id!, { dataUrl, updatedAt: now });
    } else {
      await db.mnemonics.add({
        itemId,
        itemType,
        dataUrl,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-1">
        {/* Pen sizes */}
        {[1, 3, 5].map((s) => (
          <button
            key={s}
            onClick={() => { setPenSize(s); setIsEraser(false); }}
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
              penSize === s && !isEraser
                ? 'bg-cinnabar text-rice'
                : 'bg-ink-elevated text-rice-muted hover:text-rice'
            }`}
            title={`Толщина ${s}`}
          >
            <span
              className="rounded-full bg-current"
              style={{ width: s * 2 + 2, height: s * 2 + 2 }}
            />
          </button>
        ))}

        <div className="w-px h-5 bg-ink-border mx-1" />

        {/* Eraser */}
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            isEraser
              ? 'bg-cinnabar text-rice'
              : 'bg-ink-elevated text-rice-muted hover:text-rice'
          }`}
        >
          Ластик
        </button>

        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="px-2 py-1 text-xs rounded-md bg-ink-elevated text-rice-muted hover:text-rice disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Отмена
        </button>

        {/* Redo */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="px-2 py-1 text-xs rounded-md bg-ink-elevated text-rice-muted hover:text-rice disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Повтор
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="px-2 py-1 text-xs rounded-md bg-ink-elevated text-rice-muted hover:text-rice transition-colors"
        >
          Очистить
        </button>

        {/* Save */}
        {itemId && itemType && (
          <button
            onClick={handleSave}
            className="ml-auto px-3 py-1 text-xs rounded-md bg-jade text-rice hover:bg-jade-dim transition-colors"
          >
            Сохранить
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 mizige rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
    </div>
  );
}
