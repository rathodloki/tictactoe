import React, { useEffect, useRef, useState } from 'react';

const SpaceParticles = () => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      checkMobile();
      particles = createParticles();
    };

    const createParticles = () => {
      const particleCount = isMobile ? 25 : 50;
      const newParticles = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: isMobile ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1,
          alpha: Math.random(),
          speed: isMobile ? 0.05 : 0.1,
        });
      }
      return newParticles;
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        ctx.fill();

        particle.alpha = (particle.alpha + 0.01) % 1;
        particle.x += particle.speed;
        if (particle.x > canvas.width) particle.x = 0;
      });
    };

    const animate = () => {
      drawParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default SpaceParticles;