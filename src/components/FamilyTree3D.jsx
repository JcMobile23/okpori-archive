import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Text, RoundedBox } from '@react-three/drei';
import * as d3 from 'd3';
import * as THREE from 'three';

const Node = ({ node, activeNodeId, onClick }) => {
  const isActive = node.data.id === activeNodeId;
  const isRoot = node.depth === 0;

  // Colors
  const bgColor = isActive ? '#111111' : (isRoot ? '#2A2000' : '#1A1A1A');
  const borderColor = isActive ? '#ffffff' : (isRoot ? '#D4AF37' : '#554411');
  const textColor = isActive || isRoot ? '#D4AF37' : '#E8DCC4'; // parchment roughly

  return (
    <group 
      position={[node.x, 0, node.z]} 
      onClick={(e) => { e.stopPropagation(); onClick(node.data); }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* 
        3D Card laying flat on the ground.
        Increased Z-spacing between layers to prevent Z-fighting at a distance.
      */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Main Card Background */}
        <RoundedBox args={[160, 60, 2]} radius={4} smoothness={4} position={[0, 0, 4]}>
          <meshBasicMaterial color={bgColor} />
        </RoundedBox>
        
        {/* Border / Accent (placed distinctly underneath) */}
        <RoundedBox args={[164, 64, 2]} radius={5} smoothness={4} position={[0, 0, 1]}>
          <meshBasicMaterial color={borderColor} />
        </RoundedBox>

        {/* Crisp 3D Text (placed safely above the card) */}
        <Text
          position={[0, 10, 6]}
          fontSize={12}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
          fontWeight="bold"
          letterSpacing={0.05}
          maxWidth={140}
          textAlign="center"
          lineHeight={1.2}
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
            font="https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpntPqQ.woff"
            letterSpacing={0.1}
          >
            {node.data.birthYear} - {node.data.deathYear || ''}
          </Text>
        )}
      </group>
    </group>
  );
};

const Connection = ({ source, target }) => {
  // Map coordinates: X is horizontal, Z is depth. Y is 0 (ground).
  const zMid = (source.z + target.z) / 2;
  
  // Strict Manhattan Line (Right Angles)
  const points = [
    new THREE.Vector3(source.x, -2, source.z), // Slightly below cards so it doesn't clip
    new THREE.Vector3(source.x, -2, zMid),
    new THREE.Vector3(target.x, -2, zMid),
    new THREE.Vector3(target.x, -2, target.z)
  ];

  return (
    <Line
      points={points}
      color="#D4AF37"
      opacity={0.3}
      transparent
      lineWidth={1.5}
    />
  );
};

// Component to handle smooth flying camera over the map
const CameraController = ({ activeNodeId, nodes }) => {
  const { camera, controls } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const camPos = useRef(new THREE.Vector3(0, 400, 400));
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!activeNodeId || !controls || !nodes.length) return;
    
    const targetNode = nodes.find(n => n.data.id === activeNodeId);
    if (targetNode) {
      // Focus exactly on the node
      targetPos.current.set(targetNode.x, targetNode.y, targetNode.z);
      
      // Position camera above and slightly behind to look down at an angle
      camPos.current.set(targetNode.x, 150, targetNode.z + 150);
      isAnimating.current = true;
    }
  }, [activeNodeId, nodes]);

  useFrame((state, delta) => {
    if (isAnimating.current && controls) {
      // Smoothly fly to target
      controls.target.lerp(targetPos.current, 4 * delta);
      camera.position.lerp(camPos.current, 4 * delta);
      controls.update();

      // Stop forcing animation when close enough
      if (controls.target.distanceTo(targetPos.current) < 2 && camera.position.distanceTo(camPos.current) < 2) {
        isAnimating.current = false;
      }
    }
  });

  return null;
};

const TreeGraph = ({ data, activeNodeId, onNodeClick }) => {
  const { nodes, links } = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    const root = d3.hierarchy(data);
    
    // X spacing = 220, Z spacing (depth) = 180
    const treeLayout = d3.tree().nodeSize([220, 180]);
    treeLayout(root);

    // Map layout: Lay flat on the ground
    root.each(d => {
      // D3 standard assigns X to horizontal, Y to depth.
      // For a 3D map, we keep X as X, force Y to 0 (ground), and map D3's Y to Z (depth).
      const tempX = d.x;
      const tempDepth = d.y; 
      
      d.x = tempX;
      d.y = 0; 
      d.z = tempDepth; 
    });

    return {
      nodes: root.descendants(),
      links: root.links()
    };
  }, [data]);

  return (
    <group position={[0, 0, -200]}>
      {links.map((link, i) => (
        <Connection key={`link-${i}`} source={link.source} target={link.target} />
      ))}
      {nodes.map((node, i) => (
        <Node key={`node-${i}`} node={node} activeNodeId={activeNodeId} onClick={onNodeClick} />
      ))}
      <CameraController activeNodeId={activeNodeId} nodes={nodes} />
    </group>
  );
};

const FamilyTree3D = ({ data, onNodeClick, activeNodeId, onToggleLiteMode }) => {
  return (
    <div className="w-full h-[700px] relative bg-black border-t border-b border-gold/10 overflow-hidden cursor-move">
      {/* Ambient background styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-charcoal to-black opacity-80 pointer-events-none" />
      
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-gold font-serif text-xl tracking-widest">Ancestral Map</h3>
        <p className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] italic">Drag to pan map / Scroll to zoom</p>
      </div>
      
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={onToggleLiteMode}
          className="bg-black/50 backdrop-blur-md border border-gold/30 text-gold px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gold/10 hover:border-gold transition-all rounded-full shadow-[0_0_15px_rgba(212,175,55,0.1)]"
        >
          Switch to Lite Mode (2D)
        </button>
      </div>

      <Canvas dpr={[1, 2]} camera={{ position: [0, 400, 400], fov: 45, near: 50, far: 10000 }}>
        {/* Subtle grid on the floor to enhance the "Map" feeling */}
        <gridHelper args={[10000, 200, '#D4AF37', '#111111']} position={[0, -5, 0]} opacity={0.15} transparent />
        
        <ambientLight intensity={0.5} />
        <TreeGraph data={data} activeNodeId={activeNodeId} onNodeClick={onNodeClick} />
        
        {/* OrbitControls tuned for a Map experience (pan/zoom heavy, limited rotation) */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={100} 
          maxDistance={4000}
          maxPolarAngle={Math.PI / 2.2} // Prevent looking completely from ground level
          minPolarAngle={Math.PI / 6}   // Prevent looking completely top-down (keep it 2.5D)
          screenSpacePanning={false}    // True map panning (moves along XZ plane)
        />
      </Canvas>
    </div>
  );
};

export default FamilyTree3D;
