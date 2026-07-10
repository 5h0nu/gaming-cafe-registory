import React, { useEffect, useRef } from 'react';

const ThreeDBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive sizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactive tracking
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const handleMouseMove = (e) => {
      mouse.tx = (e.clientX - width / 2) * 0.2;
      mouse.ty = (e.clientY - height / 2) * 0.2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create 3D particles
    const particleCount = 100;
    const particles = [];
    const connectionDistance = 140;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        baseSize: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#00f2fe' : '#fe019a', // cyan vs magenta
      });
    }

    const fov = 400; // Field of view
    let angleX = 0.001;
    let angleY = 0.001;

    // Render loop
    const render = () => {
      // Clear with slight trailing opacity for motion blur
      ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Adjust rotation angles based on mouse
      const currentAngleX = angleX + mouse.y * 0.00001;
      const currentAngleY = angleY + mouse.x * 0.00001;

      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      // Project particles to 2D
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply velocities
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundaries check (bounce back)
        if (Math.abs(p.x) > 400) p.vx *= -1;
        if (Math.abs(p.y) > 400) p.vy *= -1;
        if (Math.abs(p.z) > 400) p.vz *= -1;

        // 3D Rotations
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Camera calculations
        const camZ = z2 + 600; // Offset camera
        
        if (camZ > 50) {
          const scale = fov / camZ;
          const sx = x1 * scale + width / 2;
          const sy = y2 * scale + height / 2;
          const size = p.baseSize * scale;

          projected.push({ sx, sy, sz: camZ, size, color: p.color, raw: p });
        }
      }

      // Draw connections first
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          // Compute actual distance in 3D
          const dx = p1.raw.x - p2.raw.x;
          const dy = p1.raw.y - p2.raw.y;
          const dz = p1.raw.z - p2.raw.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < connectionDistance) {
            const alpha = (1 - dist3D / connectionDistance) * 0.15;
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            
            // Gradient connection line between cyan and magenta
            const grad = ctx.createLinearGradient(p1.sx, p1.sy, p2.sx, p2.sy);
            grad.addColorStop(0, p1.color === '#00f2fe' ? `rgba(0, 242, 254, ${alpha})` : `rgba(254, 1, 154, ${alpha})`);
            grad.addColorStop(1, p2.color === '#00f2fe' ? `rgba(0, 242, 254, ${alpha})` : `rgba(254, 1, 154, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      // Draw particles on top
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size, 0, Math.PI * 2);
        
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for lines speed
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanups
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -5,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ThreeDBackground;
