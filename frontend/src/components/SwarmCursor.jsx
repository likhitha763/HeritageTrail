import { useEffect, useRef } from 'react';
import './SwarmCursor.css';

export default function SwarmCursor({
  children,
  count = 180,
  size = 1.7,
  spread = 76,
  color = '#7cb5cf',
  accentColor = '#d0b778',
  speed = 0.7,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, active: false };
    let particles = [];
    let frame = 0;
    let visible = true;
    let width = 0;
    let height = 0;

    function resize() {
      const bounds = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const actualCount = reduceMotion ? Math.min(count, 70) : count;
      particles = Array.from({ length: actualCount }, (_, index) => {
        const angle = (index / actualCount) * Math.PI * 2 + Math.random();
        const radius = pointer.active
          ? spread * (0.15 + Math.random() * 0.55)
          : spread * (0.25 + Math.random() * 0.75);
        return {
          x: width * (0.25 + Math.random() * 0.5),
          y: height * (0.25 + Math.random() * 0.5),
          vx: Math.cos(angle) * radius * 0.002,
          vy: Math.sin(angle) * radius * 0.002,
          depth: 0.35 + Math.random() * 0.65,
          phase: Math.random() * Math.PI * 2,
          accent: Math.random() > 0.86,
        };
      });
    }

    function locate(event) {
      const bounds = container.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= bounds.width &&
        pointer.y <= bounds.height;
    }

    function onPointerMove(event) {
      locate(event);
      if (pointer.active) {
        particles.forEach((particle, index) => {
          const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
          if (distance < spread * 2.2) {
            const impulse = (1 - distance / (spread * 2.2)) * 0.72;
            particle.vx += ((pointer.x - particle.x) * impulse * 0.018);
            particle.vy += ((pointer.y - particle.y) * impulse * 0.018);
            particle.phase = (particle.phase + ((index % 7) - 3) * 0.008);
          }
        });
      }
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function animate(time) {
      if (!visible) return;
      context.clearRect(0, 0, width, height);
      const anchorX = pointer.active ? pointer.x : width * (0.5 + 0.18 * Math.sin(time * 0.00018));
      const anchorY = pointer.active ? pointer.y : height * (0.5 + 0.12 * Math.cos(time * 0.00021));

      particles.forEach((particle) => {
        const dx = anchorX - particle.x;
        const dy = anchorY - particle.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (pointer.active) {
          const influence = (1 - Math.min(distance / (spread * 2.4), 1)) * 0.055 * speed;
          particle.vx += (dx / distance) * influence;
          particle.vy += (dy / distance) * influence;
          particle.vx += (-dy / distance) * influence * 0.34;
          particle.vy += (dx / distance) * influence * 0.34;
        } else {
          particle.vx += Math.sin(time * 0.0012 * speed + particle.phase) * 0.002;
          particle.vy += Math.cos(time * 0.0011 * speed + particle.phase) * 0.002;
        }

        particle.vx *= pointer.active ? 0.92 : 0.985;
        particle.vy *= pointer.active ? 0.92 : 0.985;
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;

        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;

        context.beginPath();
        context.fillStyle = particle.accent ? accentColor : color;
        context.globalAlpha = pointer.active
          ? 0.28 + particle.depth * 0.22
          : 0.14 + particle.depth * 0.12;
        context.arc(
          particle.x,
          particle.y,
          size * particle.depth,
          0,
          Math.PI * 2,
        );
        context.fill();
      });

      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) frame = window.requestAnimationFrame(animate);
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    observer.observe(container);
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    resize();
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [accentColor, count, size, spread, speed, color]);

  return (
    <div ref={containerRef} className={`swarm-cursor ${className}`}>
      <canvas ref={canvasRef} className="swarm-cursor-canvas" aria-hidden="true" />
      <div className="swarm-cursor-content">{children}</div>
    </div>
  );
}
