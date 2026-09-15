import React, { useState, useRef } from 'react';
import Hero from './components/Hero';
import FamilyTree from './components/FamilyTree';
import FamilyTree3D from './components/FamilyTree3D';
import ProfilePortal from './components/ProfilePortal';
import Search from './components/Search';
import Pillars from './components/Pillars';
import VisualArchive from './components/VisualArchive';
import VisualArchive3D from './components/VisualArchive3D';
import lineageData from './data/lineage.json';
import { motion, AnimatePresence } from 'framer-motion';
import { STORAGE_KEYS } from './constants';
import { updateRecursive, findPerson, validateLineageShape } from './utils/tree';

const safeReadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Okpori] Failed to parse localStorage key "${key}", using fallback.`, err);
    return fallback;
  }
};

const safeWriteStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err && err.name === 'QuotaExceededError') {
      alert(
        'Storage full (5MB browser limit). Photos are stored on this device — please remove older large photos or back them up externally.'
      );
    } else {
      alert('Failed to save changes to this browser.');
      console.error(err);
    }
    return false;
  }
};

const App = () => {
  const [showTree, setShowTree] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [data, setData] = useState(() => safeReadStorage(STORAGE_KEYS.LINEAGE, lineageData));
  const [galleryItems, setGalleryItems] = useState(() => safeReadStorage(STORAGE_KEYS.GALLERY, []));
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showNavGuide, setShowNavGuide] = useState(false);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const adminClickRef = useRef(0);
  const adminTimerRef = useRef(null);

  React.useEffect(() => {
    if (showTree) {
      setShowNavGuide(true);
      const timer = setTimeout(() => setShowNavGuide(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showTree]);

  const handleAdminToggle = () => {
    if (adminTimerRef.current) {
      clearTimeout(adminTimerRef.current);
      adminTimerRef.current = null;
    }
    adminClickRef.current += 1;
    if (adminClickRef.current >= 3) {
      setIsAdminMode(true);
      adminClickRef.current = 0;
      return;
    }
    adminTimerRef.current = setTimeout(() => {
      adminClickRef.current = 0;
      adminTimerRef.current = null;
    }, 2000);
  };

  const savePerson = (updatedPerson) => {
    const newData = updateRecursive(data, updatedPerson);
    setData(newData);
    setSelectedPerson(updatedPerson);
    safeWriteStorage(STORAGE_KEYS.LINEAGE, newData);
  };

  const saveGalleryItem = (item) => {
    const newGallery = [item, ...galleryItems];
    if (!safeWriteStorage(STORAGE_KEYS.GALLERY, newGallery)) return;
    setGalleryItems(newGallery);
  };

  const removeGalleryItem = (id) => {
    const newGallery = galleryItems.filter((item) => item.id !== id);
    if (!safeWriteStorage(STORAGE_KEYS.GALLERY, newGallery)) return;
    setGalleryItems(newGallery);
  };

  const resetArchive = () => {
    const confirmed = window.confirm(
      'This will reset all lineage edits and reload from the source file. Photographic archive will remain intact. Proceed?'
    );
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEYS.LINEAGE);
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
          if (
            archive.lineage &&
            Array.isArray(archive.gallery) &&
            validateLineageShape(archive.lineage)
          ) {
            safeWriteStorage(STORAGE_KEYS.LINEAGE, archive.lineage);
            safeWriteStorage(STORAGE_KEYS.GALLERY, archive.gallery);
            window.location.reload();
          } else {
            alert("This file doesn't seem to be a valid Okpori Archive.");
          }
        } catch (err) {
          console.error('[Okpori] Failed to parse imported archive:', err);
          alert('Failed to read the archive file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadArchive = () => {
    const archiveData = {
      lineage: data,
      gallery: galleryItems,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(archiveData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', STORAGE_KEYS.ARCHIVE_FILENAME);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleNodeClick = (person) => {
    setSelectedPerson(person);
    setIsPortalOpen(true);
    setActiveNodeId(person.id);
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
            <div className="relative pt-32 pb-16 px-6 flex flex-col items-center">
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
                <h2 className="text-gold uppercase tracking-[0.5em] text-[10px] mb-2 font-sans font-light">
                  The Okpori Archive
                </h2>
                <h1 className="text-5xl md:text-6xl font-serif text-parchment italic mb-6 tracking-tight">
                  Hall of Records
                </h1>
                <p className="text-parchment/50 font-serif italic text-lg leading-relaxed">
                  "Each name a story, each branch a legacy. Navigate through time to find your place
                  in the Okpori flame."
                </p>
              </motion.div>
            </div>

            {!isLiteMode ? (
              <FamilyTree3D
                data={data}
                onNodeClick={handleNodeClick}
                activeNodeId={activeNodeId}
                onToggleLiteMode={() => setIsLiteMode(true)}
              />
            ) : (
              <div className="relative">
                <div className="absolute top-6 right-6 z-10">
                  <button
                    onClick={() => setIsLiteMode(false)}
                    className="border border-gold/30 text-gold px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-gold/10 transition-colors rounded-full"
                  >
                    Switch to 3D Mode
                  </button>
                </div>
                <FamilyTree
                  data={data}
                  onNodeClick={handleNodeClick}
                  activeNodeId={activeNodeId}
                />
              </div>
            )}

            <Pillars />

            {!isLiteMode ? (
              <VisualArchive3D
                items={galleryItems}
                onAdd={saveGalleryItem}
                onDelete={removeGalleryItem}
                onToggleLiteMode={() => setIsLiteMode(true)}
              />
            ) : (
              <VisualArchive
                items={galleryItems}
                onAdd={saveGalleryItem}
                onDelete={removeGalleryItem}
              />
            )}

            <AnimatePresence>
              {showNavGuide && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md border border-gold/20 px-8 py-4 rounded-full shadow-2xl pointer-events-none"
                >
                  <p className="text-gold/80 font-serif italic text-sm tracking-wide">
                    "Select an ancestor to view their story • Explore the landscape with your touch"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="py-24 border-t border-gold/10 text-center bg-black relative">
              <AnimatePresence>
                {isAdminMode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex pointer-events-auto shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                  >
                    <button
                      onClick={downloadArchive}
                      className="bg-charcoal border border-gold/40 text-gold px-8 py-3 rounded-l-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold hover:text-black transition-all shadow-xl flex items-center gap-3 group border-r-0"
                    >
                      <span className="w-2 h-2 bg-gold rounded-full group-hover:bg-black group-hover:animate-ping" />
                      Backup
                    </button>
                    <div className="relative group">
                      <button className="bg-charcoal border border-gold/40 text-gold px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold/10 transition-all shadow-xl flex items-center gap-3 border-x-0">
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
                      className="bg-charcoal border border-gold/40 text-gold px-8 py-3 rounded-r-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold/20 transition-all shadow-xl flex items-center gap-3 group border-l-gold/10"
                    >
                      Reset Lineage
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

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
                <button
                  onClick={handleAdminToggle}
                  className="text-gold font-serif text-4xl italic tracking-widest hover:brightness-125 transition-all select-none focus:outline-none"
                >
                  Okpori
                </button>
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
        key={selectedPerson?.id ?? 'portal-empty'}
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
