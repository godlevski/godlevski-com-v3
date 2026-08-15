import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number; // 1 or -1, for slow drift in opacity
}

interface DustCanvasProps {
  bgColor?: string;
  particleCount?: number;
  className?: string;
}

const PARTICLE_COUNT = 180;
const SPEED          = 0.18;
const ALPHA_SPEED    = 0.003;

function makeParticle(w: number, h: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = SPEED * (0.3 + Math.random() * 0.7);
  return {
    x:        Math.random() * w,
    y:        Math.random() * h,
    vx:       Math.cos(angle) * speed,
    vy:       Math.sin(angle) * speed,
    radius:   0.5 + Math.random() * 1.2,
    alpha:    0.05 + Math.random() * 0.35,
    alphaDir: Math.random() < 0.5 ? 1 : -1,
  };
}

export default function DustCanvas({
  bgColor = '#0d0b1e',
  particleCount = PARTICLE_COUNT,
  className,
}: DustCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;

    const particles: Particle[] = Array.from({ length: particleCount }, () =>
      makeParticle(w, h)
    );

    function onResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width  = w;
      canvas!.height = h;
    }
    window.addEventListener('resize', onResize);

    let raf: number;

    function tick() {
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, w, h);

      for (const p of particles) {
        // move
        p.x += p.vx;
        p.y += p.vy;

        // wrap edges
        if (p.x < 0)  p.x = w;
        if (p.x > w)  p.x = 0;
        if (p.y < 0)  p.y = h;
        if (p.y > h)  p.y = 0;

        // drift alpha
        p.alpha += p.alphaDir * ALPHA_SPEED;
        if (p.alpha > 0.4)  { p.alpha = 0.4;  p.alphaDir = -1; }
        if (p.alpha < 0.04) { p.alpha = 0.04; p.alphaDir =  1; }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 190, 230, ${p.alpha})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [bgColor, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'block',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
