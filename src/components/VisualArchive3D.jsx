import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Image as DreiImage, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Plus, Camera, Trash2, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const GalleryItem = ({ item, index, total, radius, onClick }) => {
  const angle = (index / total) * Math.PI * 2;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  
  // Make the image face outward from the center
  const rotationY = angle;

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh onClick={(e) => { e.stopPropagation(); onClick(item); }}>
          <planeGeometry args={[60, 80]} />
          <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Render the image if we have a URL */}
        {item.url && (
          <DreiImage 
            url={item.url} 
            transparent 
            opacity={0.9} 
            position={[0, 0, 0.5]} 
            scale={[58, 78]} 
          />
        )}
        
        {/* A simple frame/border */}
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[62, 82]} />
          <meshBasicMaterial color="#D4AF37" wireframe />
        </mesh>

        {/* Text Metadata Floating Below */}
        <Text
          position={[0, -45, 0]}
          fontSize={4}
          color="#D4AF37"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff"
        >
          {item.occasion || "Unknown Occasion"}
        </Text>
        <Text
          position={[0, -50, 0]}
          fontSize={3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          opacity={0.7}
        >
          {item.year || "Unknown Era"}
        </Text>
      </Float>
    </group>
  );
};

const Carousel = ({ items, radius, onImageClick }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    // Slowly rotate the entire carousel
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {items.map((item, index) => (
        <GalleryItem 
          key={item.id} 
          item={item} 
          index={index} 
          total={items.length} 
          radius={radius} 
          onClick={onImageClick}
        />
      ))}
    </group>
  );
};

const VisualArchive3D = ({ items, onAdd, onDelete, isLiteMode, onToggleLiteMode }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    subjects: '',
    occasion: '',
    year: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.url) return;
    
    onAdd({
      id: Date.now().toString(),
      ...formData
    });
    
    setFormData({ url: '', subjects: '', occasion: '', year: '' });
    setIsAdding(false);
  };

  // Determine radius based on number of items, minimum 100
  const radius = Math.max(120, items.length * 15);

  return (
    <section className="relative w-full h-[800px] bg-charcoal overflow-hidden border-t border-gold/10">
      {/* 3D Background & UI Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-charcoal to-black z-0" />
      
      <div className="absolute top-16 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="space-y-2 pointer-events-auto">
          <h2 className="text-gold uppercase tracking-[0.4em] text-[10px] font-sans">The 3D Archive</h2>
          <h3 className="text-4xl font-serif text-parchment italic">Floating Memories</h3>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-6 py-3 mt-4 bg-gold text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          >
            <Plus size={16} />
            Add to Archive
          </button>
        </div>
        
        <div className="pointer-events-auto">
           <button 
            onClick={onToggleLiteMode}
            className="border border-gold/30 text-gold px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gold/10 transition-colors rounded-full bg-black/50 backdrop-blur-md"
          >
            Switch to Lite Mode (2D)
          </button>
        </div>
      </div>

      {items.length === 0 && !isAdding && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <Camera size={48} className="text-gold/10 mb-6" />
          <p className="text-gold/30 font-serif italic text-xl">The visual archive is empty.</p>
        </div>
      )}

      {/* R3F Canvas */}
      {items.length > 0 && (
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 20, radius + 100], fov: 50 }}>
            <fog attach="fog" args={['#111111', radius, radius + 300]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 100, 0]} intensity={1} color="#D4AF37" />
            
            <Carousel items={items} radius={radius} onImageClick={setSelectedImage} />
            
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              minDistance={radius * 0.5}
              maxDistance={radius * 2}
              maxPolarAngle={Math.PI / 1.8}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </div>
      )}

      {/* Add Photo Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-charcoal border border-gold/20 rounded-3xl overflow-hidden shadow-2xl p-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Form fields here (similar to 2D version) */}
              <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-gold/40 hover:text-gold transition-colors">✕</button>
              <h3 className="text-3xl font-serif text-gold italic mb-8">New Archive Entry</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div className={`w-full h-48 rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center overflow-hidden bg-black/50 ${formData.url ? 'border-gold/40' : 'border-gold/10 hover:border-gold/30'}`}>
                    {formData.url ? (
                      <img src={formData.url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera size={32} className="text-gold/20 mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-gold/40">Select Photograph</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">The Occasion</label>
                    <input required type="text" placeholder="e.g. Traditional Wedding" value={formData.occasion} onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))} className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20"/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">Who is in the picture</label>
                      <input required type="text" placeholder="Names of siblings, etc." value={formData.subjects} onChange={(e) => setFormData(prev => ({ ...prev, subjects: e.target.value }))} className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">Year / Era</label>
                      <input required type="text" placeholder="e.g. 1984" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))} className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20"/>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-gold text-black rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mt-4">
                  Commit to Archive
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Size View Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black pb-20 pt-10 px-10"
            >
               <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={selectedImage.url} alt={selectedImage.occasion} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 rounded-full text-parchment transition-colors"
                >
                  ✕
                </button>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md border border-gold/20 p-8 rounded-3xl min-w-[320px] text-center">
                   <h4 className="text-3xl font-serif text-parchment italic mb-2">{selectedImage.occasion}</h4>
                   <p className="text-gold/60 text-xs mb-4">
                      {selectedImage.year} • {selectedImage.subjects}
                   </p>
                   <button 
                    onClick={() => { onDelete(selectedImage.id); setSelectedImage(null); }}
                    className="flex items-center gap-2 mx-auto text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest"
                   >
                     <Trash2 size={14} /> Remove from Archive
                   </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VisualArchive3D;
