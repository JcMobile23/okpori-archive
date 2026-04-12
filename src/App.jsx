import React, { useState } from 'react';
import Hero from './components/Hero';
import FamilyTree from './components/FamilyTree';
import ProfilePortal from './components/ProfilePortal';
import Search from './components/Search';
import Pillars from './components/Pillars';
import VisualArchive from './components/VisualArchive';
import lineageData from './data/lineage.json';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [showTree, setShowTree] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('okpori_lineage');
    return saved ? JSON.parse(saved) : lineageData;
  });
  const [galleryItems, setGalleryItems] = useState(() => {
    const saved = localStorage.getItem('okpori_gallery');
    return saved ? JSON.parse(saved) : [];
  });

  const savePerson = (updatedPerson) => {
    const updateRecursive = (node) => {
      if (node.id === updatedPerson.id) {
        return { ...node, ...updatedPerson };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };

    const newData = updateRecursive(data);
    setData(newData);
    localStorage.setItem('okpori_lineage', JSON.stringify(newData));
  };

  const saveGalleryItem = (item) => {
    const newGallery = [item, ...galleryItems];
    setGalleryItems(newGallery);
    localStorage.setItem('okpori_gallery', JSON.stringify(newGallery));
  };

  const removeGalleryItem = (id) => {
    const newGallery = galleryItems.filter(item => item.id !== id);
    setGalleryItems(newGallery);
    localStorage.setItem('okpori_gallery', JSON.stringify(newGallery));
  };

  const resetArchive = () => {
    console.log("Resetting archive...");
    const confirmed = window.confirm("This will reset all lineage edits and reload from the source file. Photographic archive will remain intact. Proceed?");
    if (confirmed) {
      localStorage.removeItem('okpori_lineage');
      window.location.reload();
    }
  };

  const importArchive = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const archive = JSON.parse(event.target.result);
          if (archive.lineage && archive.gallery) {
            localStorage.setItem('okpori_lineage', JSON.stringify(archive.lineage));
            localStorage.setItem('okpori_gallery', JSON.stringify(archive.gallery));
            window.location.reload();
          } else {
            alert("This file doesn't seem to be a valid Okpori Archive.");
          }
        } catch (err) {
          alert("Failed to read the archive file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadArchive = () => {
    const archiveData = {
      lineage: data,
      gallery: galleryItems
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(archiveData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "okpori_complete_archive.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleNodeClick = (person) => {
    setSelectedPerson(person);
    setIsPortalOpen(true);
    setActiveNodeId(person.id);
  };

  const findPerson = (node, id) => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findPerson(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSearchResult = (person) => {
    setActiveNodeId(person.id);
    const fullPerson = findPerson(data, person.id);
    if (fullPerson) {
      setSelectedPerson(fullPerson);
      setIsPortalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal selection:bg-gold/30 selection:text-gold">
      <AnimatePresence mode="wait">
        {!showTree ? (
          <Hero key="hero" onEnter={() => setShowTree(true)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex flex-col"
          >
            {/* Header & Search Area */}
            <div className="relative pt-32 pb-16 px-6 flex flex-col items-center">
              {/* Legacy Mark - Floating above search */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <img 
                  src="/crest.png" 
                  alt="Legacy Mark" 
                  className="w-16 h-16 object-contain opacity-60 hover:opacity-100 transition-opacity cursor-pointer drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                />
              </motion.div>
              
              <Search data={data} onResultClick={handleSearchResult} />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-16 max-w-2xl"
              >
                <div className="h-px w-12 bg-gold/40 mx-auto mb-6" />
                <h2 className="text-gold uppercase tracking-[0.5em] text-[10px] mb-2 font-sans font-light">The Okpori Archive</h2>
                <h1 className="text-5xl md:text-6xl font-serif text-parchment italic mb-6 tracking-tight">Hall of Records</h1>
                <p className="text-parchment/50 font-serif italic text-lg leading-relaxed">
                  "Each name a story, each branch a legacy. Navigate through time to find your place in the Okpori flame."
                </p>
              </motion.div>
            </div>

            {/* Interactive Tree Section */}
            <FamilyTree
              data={data}
              onNodeClick={handleNodeClick}
              activeNodeId={activeNodeId}
            />

            {/* Cinematic Pillars Section */}
            <Pillars />

            {/* Dedicated Photographic Archive */}
            <VisualArchive 
              items={galleryItems} 
              onAdd={saveGalleryItem} 
              onDelete={removeGalleryItem} 
            />

            {/* Footer */}
            <footer className="py-24 border-t border-gold/10 text-center bg-black relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex pointer-events-auto">
                <button
                  onClick={downloadArchive}
                  className="bg-charcoal border border-gold/30 text-gold px-8 py-3 rounded-l-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold hover:text-black transition-all shadow-xl flex items-center gap-3 group border-r-0"
                >
                  <span className="w-2 h-2 bg-gold rounded-full group-hover:bg-black group-hover:animate-ping" />
                  Backup
                </button>
                <div className="relative group">
                   <button
                    className="bg-charcoal border border-gold/30 text-gold px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold/10 transition-all shadow-xl flex items-center gap-3 border-x-0"
                  >
                    Import Archive
                  </button>
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={importArchive}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <button
                  onClick={resetArchive}
                  className="bg-charcoal border border-gold/30 text-gold px-8 py-3 rounded-r-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold/20 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center gap-3 group border-l-gold/10"
                >
                  Sync Archive
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-6 pt-12"
              >
                <img 
                  src="/crest.png" 
                  alt="Okpori Signature Seal" 
                  className="w-20 h-20 mx-auto opacity-40 hover:opacity-80 transition-all duration-700 hover:scale-110 mb-4"
                />
                <p className="text-gold font-serif text-4xl italic tracking-widest">Okpori</p>
                <div className="h-px w-8 bg-gold/20 mx-auto" />
                <p className="text-[10px] text-parchment/20 uppercase tracking-[0.4em] font-sans">
                  The Ancestral Portal &copy; 2026. Forever Preserving Our Heritage.
                </p>
              </motion.div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfilePortal
        person={selectedPerson}
        isOpen={isPortalOpen}
        onSave={savePerson}
        onClose={() => {
          setIsPortalOpen(false);
          setSelectedPerson(null);
        }}
      />
    </div>
  );
};

export default App;
