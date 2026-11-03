import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Text, RoundedBox } from '@react-three/drei';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as d3 from 'd3';
import * as THREE from 'three';
import { isHonoree } from '../constants';

const Node = ({ node, activeNodeId, onClick }) => {
  const isActive = node.data.id === activeNodeId;
  const isRoot = node.depth === 0;
  const isBirthday = isHonoree(node.data);

  const bgColor = isBirthday ? '#221800' : isActive ? '#111111' : isRoot ? '#2A2000' : '#1A1A1A';
  const borderColor = isBirthday ? '#FFD700' : isActive ? '#ffffff' : isRoot ? '#D4AF37' : '#554411';
  const textColor = isBirthday || isActive || isRoot ? '#FFD700' : '#E8DCC4';

  return (
    <group
      position={[node.x, 0, node.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.data);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <RoundedBox args={[160, 60, 2]} radius={4} smoothness={4} position={[0, 0, 4]}>
          <meshBasicMaterial color={bgColor} />
        </RoundedBox>

        <RoundedBox args={[164, 64, 2]} radius={5} smoothness={4} position={[0, 0, 1]}>
          <meshBasicMaterial color={borderColor} />
        </RoundedBox>

        {isBirthday && (
          <>
            <Text
              position={[0, 46, 8]}
              fontSize={18}
              anchorX="center"
              anchorY="middle"
              raycast={() => null}
            >
              👑
            </Text>
            <Text
              position={[0, -21, 6]}
              fontSize={6.5}
              color="#FFD700"
              fontWeight="bold"
              letterSpacing={0.15}
              anchorX="center"
              anchorY="middle"
              raycast={() => null}
            >
              ✨ BIRTHDAY HONOREE ✨
            </Text>
          </>
        )}

        <Text
          position={[0, isBirthday ? 12 : 10, 6]}
          fontSize={12}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.05}
          maxWidth={140}
          textAlign="center"
          lineHeight={1.2}
          raycast={() => null}
        >
          {node.data.name.toUpperCase()}
        </Text>

        {node.data.birthYear && (
          <Text
            position={[0, -10, 6]}
            fontSize={10}
            color="#888888"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.1}
            raycast={() => null}
          >
            {node.data.birthYear} - {node.data.deathYear || ''}
          </Text>
        )}
      </group>
    </group>
  );
};

const Connection = ({ source, target }) => {
  const zMid = (source.z + target.z) / 2;

  const points = [
    new THREE.Vector3(source.x, -2, source.z),
    new THREE.Vector3(source.x, -2, zMid),
    new THREE.Vector3(target.x, -2, zMid),
    new THREE.Vector3(target.x, -2, target.z),
  ];

  return <Line points={points} color="#D4AF37" opacity={0.3} transparent lineWidth={1.5} />;
};

const CameraController = ({ activeNodeId, nodes }) => {
  const { camera, controls } = useThree();
  const controlsRef = useRef(controls);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const camPos = useRef(new THREE.Vector3(0, 400, 400));
  const isAnimating = useRef(false);

  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!activeNodeId || !ctrl || !nodes.length) return;

    const targetNode = nodes.find((n) => n.data.id === activeNodeId);
    if (targetNode) {
      targetPos.current.set(targetNode.x, targetNode.y, targetNode.z);
      camPos.current.set(targetNode.x, 150, targetNode.z + 150);
      isAnimating.current = true;
    }
  }, [activeNodeId, nodes]);

  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    if (isAnimating.current && ctrl) {
      ctrl.target.lerp(targetPos.current, 4 * delta);
      camera.position.lerp(camPos.current, 4 * delta);
      ctrl.update();

      if (
        ctrl.target.distanceTo(targetPos.current) < 2 &&
        camera.position.distanceTo(camPos.current) < 2
      ) {
        isAnimating.current = false;
      }
    }
  });

  return null;
};

const ZoomController = ({ zoomSignal }) => {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!zoomSignal) return;
    if (zoomSignal.type === 'in') {
      camera.position.multiplyScalar(0.82);
    } else if (zoomSignal.type === 'out') {
      camera.position.multiplyScalar(1.22);
    } else if (zoomSignal.type === 'slider') {
      const dist = zoomSignal.value;
      const dir = camera.position.clone().normalize();
      camera.position.copy(dir.multiplyScalar(dist));
    } else if (zoomSignal.type === 'fit') {
      camera.position.set(0, 450, 450);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }
  }, [zoomSignal, camera, controls]);

  return null;
};

const TreeGraph = ({ data, activeNodeId, onNodeClick }) => {
  const { nodes, links } = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    const root = d3.hierarchy(data);

    const treeLayout = d3.tree().nodeSize([220, 180]);
    treeLayout(root);

    root.each((d) => {
      const tempX = d.x;
      const tempDepth = d.y;

      d.x = tempX;
      d.y = 0;
      d.z = tempDepth;
    });

    return {
      nodes: root.descendants(),
      links: root.links(),
    };
  }, [data]);

  return (
    <group position={[0, 0, -200]}>
      {links.map((link, i) => (
        <Connection key={`link-${i}`} source={link.source} target={link.target} />
      ))}
      {nodes.map((node, i) => (
        <Node
          key={`node-${i}`}
          node={node}
          activeNodeId={activeNodeId}
          onClick={onNodeClick}
        />
      ))}
      <CameraController activeNodeId={activeNodeId} nodes={nodes} />
    </group>
  );
};

const FamilyTree3D = ({ data, onNodeClick, activeNodeId, onToggleLiteMode }) => {
  const [zoomSignal, setZoomSignal] = useState(null);
  const [sliderVal, setSliderVal] = useState(560);

  const handleZoomIn = () => setZoomSignal({ id: Date.now(), type: 'in' });
  const handleZoomOut = () => setZoomSignal({ id: Date.now(), type: 'out' });
  const handleFit = () => setZoomSignal({ id: Date.now(), type: 'fit' });
  const handleSlider = (e) => {
    const val = parseFloat(e.target.value);
    setSliderVal(val);
    setZoomSignal({ id: Date.now(), type: 'slider', value: val });
  };

  return (
    <div
      className="w-full h-[650px] sm:h-[750px] relative bg-black border-t border-b border-gold/10 overflow-hidden cursor-move touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-charcoal to-black opacity-80 pointer-events-none" />

      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-gold font-serif text-xl tracking-widest">Ancestral Map</h3>
        <p className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] italic">
          Drag to orbit • Pinch or use slider to zoom
        </p>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onToggleLiteMode}
          className="bg-black/50 backdrop-blur-md border border-gold/30 text-gold px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gold/10 hover:border-gold transition-all rounded-full shadow-[0_0_15px_rgba(212,175,55,0.1)] cursor-pointer"
        >
          Switch to Lite Mode (2D)
        </button>
      </div>

      {/* Floating Navigation & Zoom Dock */}
      <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-md border border-gold/30 px-3 py-1.5 sm:py-2 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.85)]">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-gold/80 hover:text-gold hover:bg-gold/10 rounded-full transition-colors active:scale-90 cursor-pointer"
          aria-label="Zoom Out"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <div className="flex items-center gap-1.5 px-1">
          <input
            type="range"
            min="200"
            max="1200"
            step="20"
            value={sliderVal}
            onChange={handleSlider}
            className="w-16 sm:w-28 accent-[#FFD700] cursor-pointer h-1.5 bg-gold/20 rounded-lg"
            aria-label="3D Zoom level"
          />
        </div>

        <button
          onClick={handleZoomIn}
          className="p-1.5 text-gold/80 hover:text-gold hover:bg-gold/10 rounded-full transition-colors active:scale-90 cursor-pointer"
          aria-label="Zoom In"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <div className="h-4 w-px bg-gold/20 mx-0.5" />

        <button
          onClick={handleFit}
          className="flex items-center gap-1 px-2.5 py-1 text-gold/90 hover:text-gold hover:bg-gold/10 rounded-full text-[10px] uppercase tracking-wider transition-colors active:scale-90 font-medium cursor-pointer"
          title="Reset View / Fit to Screen"
        >
          <Maximize2 size={12} />
          <span>Fit</span>
        </button>
      </div>

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 400, 400], fov: 45, near: 50, far: 10000 }}
      >
        <gridHelper
          args={[10000, 200, '#D4AF37', '#111111']}
          position={[0, -5, 0]}
          opacity={0.15}
          transparent
        />

        <ambientLight intensity={0.5} />
        <TreeGraph data={data} activeNodeId={activeNodeId} onNodeClick={onNodeClick} />
        <ZoomController zoomSignal={zoomSignal} />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={80}
          maxDistance={4500}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 8}
          screenSpacePanning={true}
          touches={{
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </div>
  );
};

export default FamilyTree3D;
