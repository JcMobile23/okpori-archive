import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const generateParticles = (count) => {
  const temp = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * 100;
    const factor = 20 + Math.random() * 100;
    const speed = 0.01 + Math.random() / 200;
    const xFactor = -50 + Math.random() * 100;
    const yFactor = -50 + Math.random() * 100;
    const zFactor = -50 + Math.random() * 100;
    temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
  }
  return temp;
};

const Particles = () => {
  const count = 300;
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [particles] = useState(() => generateParticles(count));

  useFrame((_, delta) => {
    void delta;
    particles.forEach((particle) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = (particle.t += speed / 2);
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
    });
    if (mesh.current) {
      for (let i = 0; i < particles.length; i++) {
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const Hero = ({ onEnter }) => {
  useEffect(() => {
    const handle = () => {};
    return () => handle();
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-charcoal overflow-hidden">
      <div className="absolute inset-0 z-0 bg-black">
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <Particles />
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-gold-glow)_0%,_transparent_70%)] opacity-40 animate-pulse pointer-events-none" />
        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')] bg-cover bg-center brightness-50 contrast-125 grayscale-[40%] animate-subtle-zoom opacity-20 pointer-events-none" />
      </div>

      <div className="z-20 text-center px-4 max-w-4xl animate-fade-in">
        <div className="mb-8 flex justify-center animate-fade-in">
          <img
            src="/crest.png"
            alt="Okpori Family Crest"
            className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.3)] filter brightness-110"
          />
        </div>

        <p className="text-gold-muted uppercase text-xs mb-6 font-sans font-light tracking-[0.5em] opacity-100 animate-fade-in">
          Preserving the Ancestral Flame
        </p>

        <h1 className="text-8xl md:text-[12rem] font-serif gold-gradient mb-8 leading-none select-none tracking-tight">
          Okpori
        </h1>

        <div className="space-y-8">
          <p className="max-w-2xl mx-auto text-parchment/70 font-serif italic text-xl md:text-2xl leading-relaxed animate-fade-in">
            "Roots that reach deep into the earth, branches that touch the heavens. The story of us,
            beginning with him."
          </p>

          <div className="flex flex-col items-center gap-6 pt-8">
            <button
              onClick={onEnter}
              className="group relative px-12 py-5 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className="absolute inset-0 border border-gold/40 transition-colors group-hover:border-gold" />
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-gold uppercase tracking-[0.3em] text-sm font-sans font-medium transition-all group-hover:tracking-[0.4em]">
                Explore the Great Tree
              </span>
            </button>

            <div className="animate-bounce mt-4">
              <div className="w-px h-16 bg-gradient-to-b from-gold/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] z-[15]" />
    </div>
  );
};

export default Hero;
