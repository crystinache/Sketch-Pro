export type ToolType = 'pen' | 'felt' | 'marker' | 'pencil' | 'ruler' | 'crayon';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  tool: ToolType;
  color: string;
  width: number;
  points: Point[];
  opacity: number;
}

export interface PresetDrawing {
  id: string;
  name: string;
  triggerWord: string;
  strokes: Stroke[];
}

export interface CanvasState {
  strokes: Stroke[];
  redoStack: Stroke[];
}
