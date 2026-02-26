/**
 * HanziFlow — Stylus / PointerEvent utilities
 *
 * Helpers for M-Pencil and other stylus input, extracting
 * pressure and tilt data from PointerEvents.
 */

import type { StylusPoint } from '@/types';

/**
 * Returns true if the PointerEvent originated from a stylus/pen.
 */
export function isStylusEvent(e: PointerEvent): boolean {
  return e.pointerType === 'pen';
}

/**
 * Extract stylus-specific data from a PointerEvent.
 * Falls back to sensible defaults for mouse/touch input.
 */
export function getStylusData(e: PointerEvent): StylusPoint {
  return {
    x: e.clientX,
    y: e.clientY,
    // Pressure: 0..1 for pen, 0.5 fallback for mouse (which reports 0.5)
    pressure: e.pointerType === 'pen' ? e.pressure : 0.5,
    tiltX: e.tiltX ?? 0,
    tiltY: e.tiltY ?? 0,
  };
}

/**
 * Convert a StylusPoint from client coordinates to canvas-local coordinates,
 * accounting for the canvas element's position and any CSS scaling.
 */
export function toCanvasCoords(
  point: StylusPoint,
  canvas: HTMLCanvasElement,
): StylusPoint {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    ...point,
    x: (point.x - rect.left) * scaleX,
    y: (point.y - rect.top) * scaleY,
  };
}

/**
 * Calculate the stroke width from pressure.
 * Maps pressure 0..1 to a min..max pixel range.
 */
export function pressureToWidth(
  pressure: number,
  minWidth: number = 1,
  maxWidth: number = 6,
): number {
  return minWidth + pressure * (maxWidth - minWidth);
}
