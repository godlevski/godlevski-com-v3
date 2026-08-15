export interface Photo {
  id: string;
  src: string;     // full-res path via slides server, e.g. '/files/slides/foo.jpg'
  year: number;
  title: string;
  haiku: string[]; // 5–7 lines
  printW: number;  // print width in inches  (e.g. 20 for a 20×30 print)
  printH: number;  // print height in inches (e.g. 30 for a 20×30 print)
  edition: number; // total edition size (e.g. 11)
}

export interface LayoutCell {
  photo: Photo;
  baseX: number;
  baseY: number;
  w: number;
  h: number;
  col: number;
}

export interface GroupBounds {
  label: string;
  x: number; y: number;
  w: number; h: number;
  openSides: ('top' | 'right' | 'bottom' | 'left')[];
}

export interface LayoutResult {
  cells:    LayoutCell[];
  groups:   GroupBounds[];
  initScale: number;
}

export interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  scaleV: number;
  alpha: number;
  image: HTMLImageElement | null;
  imageLoaded: boolean;
}

export type ViewMode = 'axis' | 'circle';

export interface GalleryConfig {
  canvasEl:       HTMLCanvasElement;
  onPhotoClick:   (photo: Photo, screenRect: DOMRect) => void;
  onScaleChange?: (scale: number) => void;
  onFitScale?:    (scale: number) => void;
  bgColor?:       string;
}
