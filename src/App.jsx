import React, { useState, useRef, lazy } from 'react';
import FamilyTree from './components/FamilyTree';
import ProfilePortal from './components/ProfilePortal';
import Search from './components/Search';
import Pillars from './components/Pillars';
import VisualArchive from './components/VisualArchive';
import lineageData from './data/lineage.json';
import { motion, AnimatePresence } from 'framer-motion';
import { STORAGE_KEYS } from './constants';
import { updateRecursive, findPerson, validateLineageShape } from './utils/tree';
import ThreeSafe from './components/ThreeSafe';
import { BoundaryFallback } from './components/ErrorBoundary';

const LazyHero = lazy(() => import('./components/Hero'));
const LazyFamilyTree3D = lazy(() => import('./components/FamilyTree3D'));
const LazyVisualArchive3D = lazy(() => import('./components/VisualArchive3D'));

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

const HeroStatic2DFallback = ({ onEnter }) => (
  <div className="relative h-screen w-full flex flex-col items-center justify-center bg-charcoal overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center brightness-50 contrast-125 grayscale-[40%] opacity-20 pointer-events-none"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')",
      }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.18)_0%,_transparent_70%)] opacity-40 animate-pulse pointer-events-none" />
    <div className="absolute inset-0 bg-black/55 z-10 pointer-events-none" />
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
  const [boundaryToast, setBoundaryToast] = useState(null);
  const adminClickRef = useRef(0);
  const adminTimerRef = useRef(null);

  React.useEffect(() => {
    if (!boundaryToast) return;
    const t = setTimeout(() => setBoundaryToast(null), 4500);
    return () => clearTimeout(t);
  }, [boundaryToast]);

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

  const handleDegradeTree = () => {
    setIsLiteMode(true);
    setBoundaryToast({ kind: 'tree', label: '3D Lineage unavailable — using interactive 2D map' });
  };

  const handleDegradeArchive = () => {
    setIsLiteMode(true);
    setBoundaryToast({ kind: 'archive', label: '3D Archive unavailable — using 2D gallery' });
  };

  const handleEnterApp = () => setShowTree(true);

  return (
    <div className="min-h-screen bg-charcoal selection:bg-gold/30 selection:text-gold">
      <AnimatePresence mode="wait">
        {boundaryToast && (
          <motion.div
            key="boundary-toast"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="fixed top-6 right-6 z-[200] max-w-sm bg-charcoal/95 backdrop-blur-md border border-gold/30 px-5 py-3.5 shadow-[0_0_50px_rgba(212,175,55,0.15)] flex items-start gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.6)] animate-pulse" />
            <p className="text-[11px] text-parchment/70 font-serif italic tracking-wide leading-snug pr-2">
              {boundaryToast.label}
            </p>
            <button
              onClick={() => setBoundaryToast(null)}
              className="text-parchment/30 hover:text-gold transition-colors text-xs leading-none flex-shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showTree ? (
          <motion.div key="hero" exit={{ opacity: 0 }}>
            <ThreeSafe
              boundaryTitle="The Ancestral Flame couldn't render"
              boundaryDetail="WebGL hardware acceleration is unavailable on this device."
              suspenseLabel="Kindling the Ancestral Flame"
              onDegrade={handleEnterApp}
              degradeLabel="Enter Without 3D"
              fallback={() => (
                <BoundaryFallback
                  title="The Ancestral Flame couldn't render"
                  detail="WebGL hardware acceleration is unavailable on this device."
                  degradeLabel="Explore the Archive"
                  onDegrade={handleEnterApp}
                />
              )}
            >
              <LazyHero onEnter={handleEnterApp} />
            </ThreeSafe>
          </motion.div>
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
              <React.Fragment key="tree-3d">
                <ThreeSafe
                  boundaryTitle="3D Lineage unavailable"
                  boundaryDetail="Falling back to the interactive 2D map."
                  suspenseLabel="Weaving the 3D Ancestral Canopy"
                  onDegrade={handleDegradeTree}
                  degradeLabel="Use 2D Lineage"
                >
                  <LazyFamilyTree3D
                    data={data}
                    onNodeClick={handleNodeClick}
                    activeNodeId={activeNodeId}
                    onToggleLiteMode={() => setIsLiteMode(true)}
                  />
                </ThreeSafe>
              </React.Fragment>
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
              <React.Fragment key="archive-3d">
                <ThreeSafe
                  boundaryTitle="3D Visual Archive unavailable"
                  boundaryDetail="Falling back to the 2D gallery."
                  suspenseLabel="Unfurling the 3D Ancestral Scrolls"
                  onDegrade={handleDegradeArchive}
                  degradeLabel="Use 2D Archive"
                >
                  <LazyVisualArchive3D
                    items={galleryItems}
                    onAdd={saveGalleryItem}
                    onDelete={removeGalleryItem}
                    onToggleLiteMode={() => setIsLiteMode(true)}
                    isAdminMode={isAdminMode}
                  />
                </ThreeSafe>
              </React.Fragment>
            ) : (
              <VisualArchive
                items={galleryItems}
                onAdd={saveGalleryItem}
                onDelete={removeGalleryItem}
                isAdminMode={isAdminMode}
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
