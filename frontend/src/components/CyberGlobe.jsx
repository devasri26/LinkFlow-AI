import React, { useEffect, useRef } from 'react';

const CyberGlobe = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 400;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 400;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize 3D points
    const points = [];
    const latCount = 16;
    const lonCount = 20;

    // Generate latitude/longitude grid points (unit sphere)
    for (let i = 0; i <= latCount; i++) {
      const lat = (i * Math.PI) / latCount - Math.PI / 2; // -PI/2 to PI/2
      const cosLat = Math.cos(lat);
      const sinLat = Math.sin(lat);

      for (let j = 0; j < lonCount; j++) {
        const lon = (j * 2 * Math.PI) / lonCount; // 0 to 2PI
        const cosLon = Math.cos(lon);
        const sinLon = Math.sin(lon);

        points.push({
          x: cosLat * cosLon,
          y: sinLat,
          z: cosLat * sinLon,
          baseColor: Math.random() > 0.6 ? 'rgba(99, 102, 241, 0.7)' : 'rgba(168, 85, 247, 0.7)'
        });
      }
    }

    // Hotspots/redirection hubs that pulse (unit sphere)
    const hubs = [
      { lat: 0.2, lon: 0.5, size: 4, pulse: 0, color: '#f43f5e' }, // Hot pink
      { lat: -0.3, lon: 1.8, size: 5, pulse: Math.PI / 3, color: '#06b6d4' }, // Cyan
      { lat: 0.8, lon: -1.2, size: 4, pulse: Math.PI * 2 / 3, color: '#10b981' } // Emerald
    ].map(h => {
      const cosLat = Math.cos(h.lat);
      const sinLat = Math.sin(h.lat);
      return {
        x: cosLat * Math.cos(h.lon),
        y: sinLat,
        z: cosLat * Math.sin(h.lon),
        ...h
      };
    });

    let angleX = 0.003;
    let angleY = 0.006;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.40;

      currentRotationX += angleX;
      currentRotationY += angleY;

      const cosRX = Math.cos(currentRotationX);
      const sinRX = Math.sin(currentRotationX);
      const cosRY = Math.cos(currentRotationY);
      const sinRY = Math.sin(currentRotationY);

      // Camera projection details (proportionate to dynamic radius)
      const fov = radius * 3.5;

      // Render back nodes first, then connections, then front nodes (z-sorting)
      const projected = points.map(p => {
        const px_val = p.x * radius;
        const py_val = p.y * radius;
        const pz_val = p.z * radius;

        // Rotate around X axis
        let y1 = py_val * cosRX - pz_val * sinRX;
        let z1 = pz_val * cosRX + py_val * sinRX;

        // Rotate around Y axis
        let x2 = px_val * cosRY - z1 * sinRY;
        let z2 = z1 * cosRY + px_val * sinRY;

        const scale = fov / (fov + z2);
        const px = x2 * scale + cx;
        const py = y1 * scale + cy;

        return { px, py, z: z2, scale, color: p.baseColor };
      });

      // Sort points by depth (z) in descending order (back of sphere rendered first)
      projected.sort((a, b) => b.z - a.z);

      // Draw global coordinate lines
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
      ctx.lineWidth = 0.5;

      // Draw latitude grid lines
      for (let i = 2; i < latCount - 1; i += 2) {
        ctx.beginPath();
        for (let j = 0; j < lonCount; j++) {
          const idx = i * lonCount + j;
          if (idx < projected.length) {
            const pt = projected[idx];
            if (pt.z < 20) { // Only draw lines on front/visible surface primarily
              if (j === 0) ctx.moveTo(pt.px, pt.py);
              else ctx.lineTo(pt.px, pt.py);
            }
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw dots
      projected.forEach(p => {
        // Opacity based on depth
        const opacity = Math.max(0.1, (fov - p.z) / (fov * 1.5));
        ctx.fillStyle = p.color.replace('0.7', opacity.toFixed(2));
        
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.4, p.scale * 1.4), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw glowing redirect hubs
      hubs.forEach(h => {
        const hx_val = h.x * radius;
        const hy_val = h.y * radius;
        const hz_val = h.z * radius;

        let y1 = hy_val * cosRX - hz_val * sinRX;
        let z1 = hz_val * cosRX + hy_val * sinRX;
        let x2 = hx_val * cosRY - z1 * sinRY;
        let z2 = z1 * cosRY + hx_val * sinRY;

        // Hub is on the front side (facing camera)
        if (z2 < 0) {
          const scale = fov / (fov + z2);
          const px = x2 * scale + cx;
          const py = y1 * scale + cy;

          // Pulse increment
          h.pulse += 0.04;
          const pulseScale = 1 + Math.sin(h.pulse) * 0.4;
          const radiusSize = h.size * scale;

          // Outer Glow ring
          ctx.strokeStyle = h.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, radiusSize * pulseScale * 1.8, 0, Math.PI * 2);
          ctx.stroke();

          // Connect hub to center point with fine vector line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Inner solid dot
          ctx.fillStyle = h.color;
          ctx.beginPath();
          ctx.arc(px, py, radiusSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`relative z-10 block mx-auto ${className}`} />;
};

export default CyberGlobe;
