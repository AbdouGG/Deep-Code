import React, { useEffect, useRef } from 'react';

interface SunraysBackgroundProps {
  isDark: boolean;
}

export function SunraysBackground({ isDark }: SunraysBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const drawRay = (
      startX: number,
      startY: number,
      angle: number,
      length: number,
      width: number,
      alpha: number
    ) => {
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = isDark 
        ? `rgba(148, 163, 184, ${alpha})`  // slate-400
        : `rgba(251, 191, 36, ${alpha})`; // amber-400
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x, y } = mouseRef.current;
      const numRays = 12;
      const baseLength = Math.min(canvas.width, canvas.height) * 0.4;

      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2;
        const time = Date.now() * 0.001;
        const oscillation = Math.sin(time + i) * 0.2;
        const length = baseLength * (0.8 + Math.sin(time + i) * 0.2);
        const width = 2 + Math.sin(time + i) * 1;
        const alpha = 0.1 + Math.sin(time + i) * 0.05;

        drawRay(
          x,
          y,
          angle + oscillation,
          length,
          width,
          alpha
        );
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}