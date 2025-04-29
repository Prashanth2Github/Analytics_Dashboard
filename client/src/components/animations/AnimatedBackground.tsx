import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

interface AnimatedBackgroundProps {
  type: 'weather' | 'finance';
  weatherCondition?: string;
  financeTrend?: 'up' | 'down' | 'neutral';
}

export function AnimatedBackground({ type, weatherCondition, financeTrend }: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const animationRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize particles based on type
    const particles: THREE.Points[] = [];
    
    if (type === 'weather') {
      // Weather animation based on condition
      const particleCount = 200;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      
      let particleMaterial: THREE.PointsMaterial;
      
      // Different particle styles based on weather condition
      if (weatherCondition === 'rain') {
        // Blue elongated particles for rain
        for (let i = 0; i < particleCount * 3; i += 3) {
          particlePositions[i] = (Math.random() - 0.5) * 10;
          particlePositions[i + 1] = (Math.random() - 0.5) * 10;
          particlePositions[i + 2] = (Math.random() - 0.5) * 10;
        }
        particleMaterial = new THREE.PointsMaterial({
          color: resolvedTheme === 'dark' ? 0x4a9df7 : 0x1e78f7,
          size: 0.1,
          transparent: true,
          opacity: 0.7,
        });
      } else if (weatherCondition === 'snow') {
        // White round particles for snow
        for (let i = 0; i < particleCount * 3; i += 3) {
          particlePositions[i] = (Math.random() - 0.5) * 10;
          particlePositions[i + 1] = (Math.random() - 0.5) * 10;
          particlePositions[i + 2] = (Math.random() - 0.5) * 10;
        }
        particleMaterial = new THREE.PointsMaterial({
          color: resolvedTheme === 'dark' ? 0xffffff : 0xd8e4f0,
          size: 0.1,
          transparent: true,
          opacity: 0.8,
        });
      } else if (weatherCondition === 'clouds') {
        // Grey soft particles for clouds
        for (let i = 0; i < particleCount * 3; i += 3) {
          particlePositions[i] = (Math.random() - 0.5) * 10;
          particlePositions[i + 1] = (Math.random() - 0.5) * 10;
          particlePositions[i + 2] = (Math.random() - 0.5) * 10;
        }
        particleMaterial = new THREE.PointsMaterial({
          color: resolvedTheme === 'dark' ? 0xa1a3a6 : 0xcacbce,
          size: 0.15,
          transparent: true,
          opacity: 0.5,
        });
      } else {
        // Default sunny particles (yellow/orange)
        for (let i = 0; i < particleCount * 3; i += 3) {
          particlePositions[i] = (Math.random() - 0.5) * 10;
          particlePositions[i + 1] = (Math.random() - 0.5) * 10;
          particlePositions[i + 2] = (Math.random() - 0.5) * 10;
        }
        particleMaterial = new THREE.PointsMaterial({
          color: resolvedTheme === 'dark' ? 0xffc865 : 0xffad33,
          size: 0.08,
          transparent: true,
          opacity: 0.6,
        });
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const weatherParticles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(weatherParticles);
      particles.push(weatherParticles);
      
    } else if (type === 'finance') {
      // Finance animation based on trend
      const lineCount = 20;
      let color: number;
      
      if (financeTrend === 'up') {
        color = resolvedTheme === 'dark' ? 0x4caf50 : 0x2e7d32;
      } else if (financeTrend === 'down') {
        color = resolvedTheme === 'dark' ? 0xf44336 : 0xc62828;
      } else {
        color = resolvedTheme === 'dark' ? 0x90caf9 : 0x1976d2;
      }
      
      // Create multiple line segments for a stock chart effect
      for (let i = 0; i < lineCount; i++) {
        const lineGeometry = new THREE.BufferGeometry();
        const points = [];
        const segmentCount = 10;
        let trend = Math.random() > 0.5 ? 1 : -1;
        
        for (let j = 0; j < segmentCount; j++) {
          const x = (j / segmentCount) * 10 - 5;
          // Adjust y values based on trend
          let yFactor;
          if (financeTrend === 'up') {
            yFactor = 0.7;
          } else if (financeTrend === 'down') {
            yFactor = -0.7;
          } else {
            yFactor = 0;
          }
          
          const y = ((Math.random() * 2 - 1) + yFactor) * (j / segmentCount) + (i / lineCount) * 4 - 2;
          const z = 0;
          
          points.push(new THREE.Vector3(x, y, z));
        }
        
        lineGeometry.setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: color,
          opacity: 0.5 + (i / lineCount) * 0.5,
          transparent: true,
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      animationRef.current = requestAnimationFrame(animate);
      
      // Rotate and animate particles
      particles.forEach((particle) => {
        if (type === 'weather') {
          if (weatherCondition === 'rain') {
            particle.rotation.y += 0.001;
            const positions = particle.geometry.attributes.position.array as Float32Array;
            for (let i = 1; i < positions.length; i += 3) {
              positions[i] -= 0.05;
              if (positions[i] < -5) {
                positions[i] = 5;
              }
            }
            particle.geometry.attributes.position.needsUpdate = true;
          } else if (weatherCondition === 'snow') {
            particle.rotation.y += 0.001;
            const positions = particle.geometry.attributes.position.array as Float32Array;
            for (let i = 1; i < positions.length; i += 3) {
              positions[i] -= 0.01;
              positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
              if (positions[i] < -5) {
                positions[i] = 5;
              }
            }
            particle.geometry.attributes.position.needsUpdate = true;
          } else {
            particle.rotation.y += 0.002;
            particle.rotation.x += 0.001;
          }
        }
      });
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, [type, weatherCondition, financeTrend, resolvedTheme]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0" />;
}

export default AnimatedBackground;
