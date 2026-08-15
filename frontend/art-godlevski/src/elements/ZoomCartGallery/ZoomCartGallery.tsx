import { useCallback, useEffect, useRef, useState } from 'react';
import { Atom, LayoutDashboard, ShoppingBag, X } from 'lucide-react';
import { Gallery } from './gallery/Gallery';
import { Preview } from '../preview/Preview';
import { photos } from '../../data/photos';
import Loading from '../../components/Loading/Loading';
import { Photo, ViewMode } from '../../types';
import { MIN_SCALE, MAX_SCALE } from './gallery/Camera';
import { useCartStore } from '../../store/cartStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const SPACING     = 8;
const LOG_MIN     = Math.log(MIN_SCALE);
const LOG_MAX     = Math.log(MAX_SCALE);
const TRACK_W     = 40;
const TRACK_HIT_W = 48;
const TRACK_PAD   = 24;
const TRACK_PAD_V = 8;
const TRACK_TOP   = 38;  // starts at the title's top edge for maximum track height
const SEL_BAR_H   = 48;
const SEL_LIST_H  = 87;

// ── ZoomTrack ─────────────────────────────────────────────────────────────────

function ZoomTrack({ scale, fitScale, onZoom, onReset }: {
  scale: number; fitScale: number; onZoom: (factor: number) => void; onReset: () => void;
}) {
  const [vw, setVw] = useState(window.innerWidth);
  const [vh, setVh] = useState(window.innerHeight);
  const dragging   = useRef(false);
  const lastPos    = useRef(0);
  const movedRef   = useRef(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const portrait = vh > vw;

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      movedRef.current = true;
      if (portrait) {
        const dx = e.clientX - lastPos.current;
        lastPos.current = e.clientX;
        if (dx !== 0) onZoom(Math.exp(dx * 0.008));
      } else {
        const dy = e.clientY - lastPos.current;
        lastPos.current = e.clientY;
        if (dy !== 0) onZoom(Math.exp(-dy * 0.008));
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (!dragging.current) return;
      e.preventDefault();
      movedRef.current = true;
      if (portrait) {
        const dx = e.touches[0].clientX - lastPos.current;
        lastPos.current = e.touches[0].clientX;
        if (dx !== 0) onZoom(Math.exp(dx * 0.008));
      } else {
        const dy = e.touches[0].clientY - lastPos.current;
        lastPos.current = e.touches[0].clientY;
        if (dy !== 0) onZoom(Math.exp(-dy * 0.008));
      }
    }
    function onDragEnd() { dragging.current = false; }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onDragEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend',  onDragEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onDragEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onDragEnd);
    };
  }, [onZoom, portrait]);

  function handleClick(t: number) {
    if (movedRef.current) return;
    const targetScale = Math.exp(LOG_MIN + Math.max(0, Math.min(1, t)) * (LOG_MAX - LOG_MIN));
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onReset();
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onZoom(targetScale / scale);
    }, 260);
  }

  const t = (Math.log(scale) - LOG_MIN) / (LOG_MAX - LOG_MIN);

  if (portrait) {
    const trackLeft  = TRACK_PAD;
    const trackRight = vw - TRACK_PAD;
    const trackLen   = trackRight - trackLeft;
    const ay         = TRACK_W / 2;
    const dotX       = trackLeft + t * trackLen;

    const ticks: { x: number; len: number; opacity: number; clickable: boolean; t: number }[] = [];
    for (let x = trackLeft; x <= trackRight; x += SPACING) {
      const idx = Math.round((x - trackLeft) / SPACING);
      const isMajor = idx % 10 === 0;
      const isHalf  = idx % 10 === 5;
      ticks.push({
        x,
        len:       isMajor ? 18 : isHalf ? 12 : 6,
        opacity:   isMajor ? 0.35 : isHalf ? 0.22 : 0.12,
        clickable: isMajor || isHalf,
        t:         (x - trackLeft) / trackLen,
      });
    }
    const tFit        = (Math.log(fitScale) - LOG_MIN) / (LOG_MAX - LOG_MIN);
    const defaultDotX = trackLeft + tFit * trackLen;

    return (
      <svg
        onMouseDown={(e) => { dragging.current = true; movedRef.current = false; lastPos.current = e.clientX; e.preventDefault(); }}
        onTouchStart={(e) => { dragging.current = true; movedRef.current = false; lastPos.current = e.touches[0].clientX; e.preventDefault(); }}
        style={{ position: 'fixed', left: 0, top: 0, width: vw, height: TRACK_W, zIndex: 15, cursor: 'ew-resize' }}
      >
        <rect x={0} y={0} width={vw} height={TRACK_W} fill="rgba(14,13,34,0.6)" />
        {ticks.map(({ x, len, opacity, clickable, t: tickT }, i) =>
          clickable ? (
            <g key={i} className="tick-btn" style={{ opacity }}
              onClick={(e) => { e.stopPropagation(); handleClick(tickT); }}>
              <line x1={x} y1={ay - len / 4} x2={x} y2={ay + len / 4} stroke="rgba(216,212,204,1)" strokeWidth="1" pointerEvents="none" />
              <line x1={x} y1={ay - 16} x2={x} y2={ay + 16} stroke="transparent" strokeWidth="18" style={{ cursor: 'pointer' }} />
            </g>
          ) : (
            <line key={i} x1={x} y1={ay - len / 4} x2={x} y2={ay + len / 4} stroke={`rgba(216,212,204,${opacity})`} strokeWidth="1" pointerEvents="none" />
          )
        )}
        <circle cx={defaultDotX} cy={ay} r={14} fill="transparent" style={{ cursor: 'pointer' }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); onReset(); }}
          onClick={(e) => { e.stopPropagation(); onReset(); }} />
        <circle cx={defaultDotX} cy={ay} r={2.5} fill="rgba(216,212,204,0.28)" pointerEvents="none" />
        <circle cx={dotX} cy={ay} r={14} fill="transparent" pointerEvents="all" />
        <circle cx={dotX} cy={ay} r={3} fill="#c8b89a" pointerEvents="none" />
      </svg>
    );
  }

  const trackTop    = TRACK_TOP;
  const trackBottom = vh + TRACK_TOP - TRACK_PAD_V;
  const trackLen    = trackBottom - trackTop;
  const ax          = TRACK_HIT_W / 2;
  const dotY        = trackBottom - t * trackLen;

  const ticks: { y: number; len: number; opacity: number; clickable: boolean; t: number }[] = [];
  for (let y = trackTop; y <= trackBottom; y += SPACING) {
    const idx     = Math.round((y - trackTop) / SPACING);
    const isMajor = idx % 10 === 0;
    const isHalf  = idx % 10 === 5;
    ticks.push({
      y,
      len:       isMajor ? 11 : isHalf ? 7.5 : 3.75,
      opacity:   isMajor ? 0.65 : isHalf ? 0.5 : 0.35,
      clickable: isMajor || isHalf,
      t:         (trackBottom - y) / trackLen,
    });
  }
  const tFit        = (Math.log(fitScale) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  const defaultDotY = trackBottom - tFit * trackLen;

  return (
    <svg
      onMouseDown={(e) => { dragging.current = true; movedRef.current = false; lastPos.current = e.clientY; e.preventDefault(); }}
      onTouchStart={(e) => { dragging.current = true; movedRef.current = false; lastPos.current = e.touches[0].clientY; e.preventDefault(); }}
      style={{ position: 'fixed', left: 0, top: -TRACK_TOP, width: TRACK_HIT_W, height: vh + TRACK_TOP, zIndex: 15, cursor: 'ns-resize' }}
    >
      <rect x={0} y={0} width={TRACK_HIT_W} height={vh + TRACK_TOP} fill="rgba(14,13,34,0.6)" />
      {ticks.map(({ y, len, opacity, clickable, t: tickT }, i) =>
        clickable ? (
          <g key={i} className="tick-btn" style={{ opacity }}
            onClick={(e) => { e.stopPropagation(); handleClick(tickT); }}>
            <line x1={ax - len / 4} y1={y} x2={ax + len / 4} y2={y} stroke="rgba(216,212,204,1)" strokeWidth="1" pointerEvents="none" />
            <line x1={ax - 16} y1={y} x2={ax + 16} y2={y} stroke="transparent" strokeWidth="18" style={{ cursor: 'pointer' }} />
          </g>
        ) : (
          <line key={i} x1={ax - len / 4} y1={y} x2={ax + len / 4} y2={y} stroke={`rgba(216,212,204,${opacity})`} strokeWidth="1" pointerEvents="none" />
        )
      )}
      <circle cx={ax} cy={defaultDotY} r={14} fill="transparent" style={{ cursor: 'pointer' }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); onReset(); }}
        onClick={(e) => { e.stopPropagation(); onReset(); }} />
      <circle cx={ax} cy={defaultDotY} r={2.5} fill="rgba(216,212,204,0.28)" pointerEvents="none" />
      <circle cx={ax} cy={dotY} r={14} fill="transparent" pointerEvents="all" />
      <circle cx={ax} cy={dotY} r={3} fill="#c8b89a" pointerEvents="none" />
    </svg>
  );
}

// ── ViewToggle ────────────────────────────────────────────────────────────────

function ViewToggle({ viewMode, onSwitch, onReset }: {
  viewMode: ViewMode; onSwitch: (m: ViewMode) => void; onReset: () => void;
}) {
  return (
    <div className="view-toggle">
      <button
        className={`vt-btn${viewMode === 'circle' ? ' vt-btn--active' : ''}`}
        onClick={() => viewMode === 'circle' ? onReset() : onSwitch('circle')}
        title="Circle layout"
      >
        <Atom size={15} strokeWidth={1.5} />
      </button>
      <button
        className={`vt-btn${viewMode === 'axis' ? ' vt-btn--active' : ''}`}
        onClick={() => viewMode === 'axis' ? onReset() : onSwitch('axis')}
        title="Grid layout"
      >
        <LayoutDashboard size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ── ZoomCartGallery ───────────────────────────────────────────────────────────

export default function ZoomCartGallery() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const galleryRef = useRef<Gallery | null>(null);
  const previewRef = useRef<Preview | null>(null);

  const [loading, setLoading]   = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('axis');
  const [scale, setScale]       = useState(1);
  const [fitScale, setFitScale] = useState(1);

  const { selected, selectionMode, toggleSelectionMode, toggleSelected, clearSelection } = useCartStore();

  const selectionModeRef = useRef(selectionMode);
  const selectedRef      = useRef<Photo[]>(selected);
  const selListRef       = useRef<HTMLDivElement>(null);
  const prevSelectedLen  = useRef(0);

  useEffect(() => { selectionModeRef.current = selectionMode; }, [selectionMode]);
  useEffect(() => {
    selectedRef.current = selected;
    previewRef.current?.syncCart();
  }, [selected]);

  function applyInset(listOpen: boolean) {
    galleryRef.current?.setInset(listOpen ? SEL_BAR_H + SEL_LIST_H : SEL_BAR_H, 0);
  }

  useEffect(() => { applyInset(selectionMode); }, [selectionMode]);

  useEffect(() => {
    const onResize = () => applyInset(selectionMode);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selectionMode]);

  useEffect(() => {
    const list = selListRef.current;
    if (!list || selected.length <= prevSelectedLen.current) {
      prevSelectedLen.current = selected.length;
      return;
    }
    prevSelectedLen.current = selected.length;
    requestAnimationFrame(() => { list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' }); });
  }, [selected]);

  function handleInquire() {
    const list = selected
      .map(p => `• ${p.title} (${p.year}), Edition of ${p.edition}`)
      .join('\n');
    const body =
      `Hello,\n\nI am interested in the following works from Intraverses:\n\n${list}\n\nCould you please share availability and pricing information?\n\nThank you`;
    window.location.href =
      `mailto:dmitriy@godlevski.com` +
      `?subject=${encodeURIComponent('Inquiry — Intraverses')}` +
      `&body=${encodeURIComponent(body)}`;
  }

  const onZoom   = useCallback((f: number) => galleryRef.current?.adjustZoom(f), []);
  const onReset  = useCallback(() => galleryRef.current?.adjustZoom(fitScale / scale), [fitScale, scale]);

  function switchMode(mode: ViewMode) {
    setViewMode(mode);
    galleryRef.current?.setViewMode(mode);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gallery: Gallery | null = null;

    const preview = new Preview(
      () => { gallery?.resume(); },
      () => setLoading(true),
      () => setLoading(false),
      (photo) => toggleSelected(photo),
      (photo) => selectedRef.current.some(p => p.id === photo.id),
    );
    previewRef.current = preview;

    gallery = new Gallery({
      canvasEl: canvas,
      onScaleChange: setScale,
      onFitScale: setFitScale,
      onPhotoClick: (photo: Photo, rect: DOMRect) => {
        if (selectionModeRef.current) {
          toggleSelected(photo);
        } else {
          cancelAnimationFrame((gallery as any).rafId);
          preview.show(photos, photo.id, rect);
        }
      },
    });

    galleryRef.current = gallery;
    gallery.load(photos);
    gallery.setInset(SEL_BAR_H, 0);

    const initialId = new URLSearchParams(location.search).get('p');
    if (initialId && photos.find(p => p.id === initialId)) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      cancelAnimationFrame((gallery as any).rafId);
      preview.show(photos, initialId, new DOMRect(cx - 1, cy - 1, 2, 2));
    }

    return () => { gallery?.destroy(); galleryRef.current = null; };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="gallery-canvas" />

      <div className="view-toggle-anchor">
        <ViewToggle
          viewMode={viewMode}
          onSwitch={switchMode}
          onReset={() => galleryRef.current?.adjustZoom(fitScale / scale)}
        />
      </div>

      <ZoomTrack scale={scale} fitScale={fitScale} onZoom={onZoom} onReset={onReset} />

      {/* Selection list panel */}
      <div className={`sel-panel${selectionMode ? ' sel-panel--open' : ''}`}>
        <button className="sel-panel-close" onClick={toggleSelectionMode}>
          {selectionMode
            ? <X size={14} strokeWidth={1.5} />
            : <ShoppingBag size={14} strokeWidth={1.5} />}
        </button>
        <div className="sel-list" ref={selListRef}>
          {selected.length === 0 ? (
            <span className="sel-empty sel-empty--hint">Click works in the gallery to add them to your selection</span>
          ) : (
            <>
              {selected.map(photo => (
                <div
                  key={photo.id}
                  className="sel-item"
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    cancelAnimationFrame((galleryRef.current as any)?.rafId);
                    previewRef.current?.show(photos, photo.id, rect);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    className="sel-item-img"
                    src={`${photo.src}?h=200&p=true`}
                    alt={photo.title}
                    style={{ aspectRatio: `${photo.printW} / ${photo.printH}` }}
                  />
                  <div className="sel-item-info">
                    <span className="sel-item-title">{photo.title}</span>
                    <span className="sel-item-year">{photo.year}</span>
                    <span className="sel-item-edition">Ed.&thinsp;{photo.edition}</span>
                  </div>
                  <button
                    className="sel-item-remove"
                    onClick={(e) => { e.stopPropagation(); toggleSelected(photo); }}
                    title="Remove"
                  >×</button>
                </div>
              ))}
              <button className="sel-clear" onClick={clearSelection}>clear all</button>
            </>
          )}
        </div>
      </div>

      {/* Cart bar */}
      <div className={`sel-bar${selectionMode ? ' sel-bar--open' : ''}`}>
        {!selectionMode && selected.length > 0 && (
          <button className="sel-bar-toggle sel-bar-toggle--active" onClick={toggleSelectionMode}>
            <ShoppingBag size={14} strokeWidth={1.5} />
            <span className="sel-bar-count">{selected.length}</span>
          </button>
        )}
        {selectionMode ? (
          <button className="sel-bar-inquire" disabled={selected.length === 0} onClick={handleInquire}>
            Inquire about selected works
          </button>
        ) : selected.length > 0 ? (
          <div className="sel-bar-hint sel-bar-hint--filled">
            <span className="sel-bar-count">{selected.length}</span>
            <span>items selected</span>
          </div>
        ) : (
          <div className="sel-bar-hint">
            cart mode
          </div>
        )}
      </div>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', opacity: 0.25 }}>
          <Loading scheme="white" size="medium" position="centered" style={{ width: 130, height: 130 }} />
        </div>
      )}
    </>
  );
}
