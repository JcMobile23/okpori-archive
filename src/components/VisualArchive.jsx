import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Camera,
  Users,
  Calendar,
  MapPin,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LayoutGrid,
} from 'lucide-react';

const VisualArchive = ({ items, onAdd, onDelete, isAdminMode }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('deck'); // 'deck' (Storybook) or 'grid'
  const [dragDirection, setDragDirection] = useState(0); // 1 = right/prev, -1 = left/next

  const [formData, setFormData] = useState({
    url: '',
    subjects: '',
    occasion: '',
    year: '',
    location: '',
  });
  const formRef = React.useRef(null);

  const handleNext = () => {
    if (!items || items.length === 0) return;
    setDragDirection(-1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    if (!items || items.length === 0) return;
    setDragDirection(1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formRef.current && !formRef.current.reportValidity()) return;
    if (!formData.url) return;

    onAdd({
      id: Date.now().toString(),
      ...formData,
    });

    setFormData({ url: '', subjects: '', occasion: '', year: '', location: '' });
    setIsAdding(false);
  };

  // Safe current index within bounds
  const safeIndex = items.length > 0 ? currentIndex % items.length : 0;
  const currentItem = items[safeIndex];

  // Stack of 3 cards for the Storybook deck
  const stackItems = [];
  if (items.length > 0) {
    stackItems.push({ item: items[safeIndex], depth: 0 });
    if (items.length > 1) {
      stackItems.push({ item: items[(safeIndex + 1) % items.length], depth: 1 });
    }
    if (items.length > 2) {
      stackItems.push({ item: items[(safeIndex + 2) % items.length], depth: 2 });
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 bg-charcoal relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <h2 className="text-gold uppercase tracking-[0.4em] text-[10px] font-sans">
                The Visual Archive
              </h2>
            </div>
            <h3 className="text-4xl sm:text-5xl font-serif text-parchment italic">
              Frozen in Time
            </h3>
            <p className="text-parchment/50 font-serif italic text-base sm:text-lg max-w-xl">
              "A collection of moments that define our journey. Every face tells a story, every
              gathering strengthens the bond."
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* View Mode Switcher Pill */}
            {items.length > 0 && (
              <div className="flex items-center bg-black/60 border border-gold/20 rounded-full p-1 backdrop-blur-md">
                <button
                  onClick={() => setViewMode('deck')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    viewMode === 'deck'
                      ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-gold/60 hover:text-gold'
                  }`}
                >
                  <BookOpen size={12} />
                  <span>Storybook</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'text-gold/60 hover:text-gold'
                  }`}
                >
                  <LayoutGrid size={12} />
                  <span>Grid</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gold text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* 1. STORYBOOK STACK DECK MODE (Animated Swipe & Book Page Turn) */}
        {items.length > 0 && viewMode === 'deck' && (
          <div className="flex flex-col items-center max-w-lg mx-auto py-6">
            {/* Instruction Cue */}
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/40 mb-6 font-sans flex items-center gap-2">
              <span>✦</span> Swipe card or tap arrows to flip pages <span>✦</span>
            </p>

            {/* The Stacked Cards Container */}
            <div className="relative w-full aspect-[4/5] max-h-[560px] min-h-[460px] flex items-center justify-center">
              {stackItems
                .slice()
                .reverse()
                .map(({ item, depth }) => {
                  const isTop = depth === 0;

                  return (
                    <motion.div
                      key={item.id + '-' + depth}
                      className="absolute inset-0 rounded-3xl bg-[#0e0e0e] border border-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden cursor-grab active:cursor-grabbing select-none"
                      style={{
                        zIndex: 10 - depth,
                        touchAction: 'pan-y',
                      }}
                      initial={
                        isTop
                          ? {
                              scale: 0.94,
                              y: 15,
                              opacity: 0.8,
                              rotate: dragDirection * 6,
                            }
                          : false
                      }
                      animate={{
                        scale: depth === 0 ? 1 : depth === 1 ? 0.94 : 0.88,
                        y: depth === 0 ? 0 : depth === 1 ? 16 : 30,
                        rotate: depth === 0 ? 0 : depth === 1 ? 2 : -2,
                        opacity: depth === 0 ? 1 : depth === 1 ? 0.75 : 0.45,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                      }}
                      drag={isTop ? 'x' : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.7}
                      onDragEnd={(e, { offset, velocity }) => {
                        if (!isTop) return;
                        if (offset.x < -45 || velocity.x < -200) {
                          handleNext();
                        } else if (offset.x > 45 || velocity.x > 200) {
                          handlePrev();
                        }
                      }}
                    >
                      {/* Photo Area */}
                      <div className="relative w-full h-[62%] bg-black overflow-hidden group">
                        <img
                          src={item.url}
                          alt={item.occasion}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-90" />

                        {/* Top-Right Quick Expand Icon */}
                        {isTop && (
                          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(item);
                              }}
                              className="p-2.5 bg-black/60 hover:bg-black/90 border border-gold/30 text-gold rounded-full backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
                              aria-label="View full size"
                              title="View Full Size"
                            >
                              <Maximize2 size={15} />
                            </button>
                            {isAdminMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(item.id);
                                }}
                                className="p-2.5 bg-red-950/70 hover:bg-red-900 border border-red-500/30 text-red-400 rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                                aria-label="Delete Memory"
                                title="Delete Memory"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Year Badge */}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-gold/30 px-3 py-1 rounded-full text-gold flex items-center gap-1.5 shadow-md">
                          <Calendar size={11} />
                          <span className="text-[10px] uppercase font-bold tracking-widest font-sans">
                            {item.year || 'Era Recorded'}
                          </span>
                        </div>
                      </div>

                      {/* Information Lower Deck */}
                      <div className="p-6 pt-2 flex flex-col justify-between h-[38%]">
                        <div>
                          <h4 className="text-2xl sm:text-3xl font-serif italic text-parchment leading-tight mb-2 line-clamp-1">
                            {item.occasion || 'Untold Memory'}
                          </h4>

                          <div className="space-y-1.5 mt-2">
                            <div className="flex items-start gap-2 text-gold/70 text-xs">
                              <Users size={13} className="shrink-0 mt-0.5" />
                              <span className="font-serif italic text-parchment/80 line-clamp-2 leading-snug">
                                {item.subjects || 'Family Lineage Members'}
                              </span>
                            </div>
                            {item.location && (
                              <div className="flex items-center gap-2 text-gold/60 text-[11px]">
                                <MapPin size={12} className="shrink-0" />
                                <span className="font-sans tracking-wide truncate">
                                  {item.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tap to Flip Prompt */}
                        {isTop && (
                          <div className="pt-2 border-t border-gold/10 flex items-center justify-between text-gold/50 text-[10px] uppercase tracking-widest font-sans">
                            <span>Page {safeIndex + 1} of {items.length}</span>
                            <span className="text-gold italic font-serif text-xs">
                              Swipe ➔
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Carousel Navigation Controller */}
            <div className="mt-8 flex items-center justify-between w-full px-2 gap-4">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-black/60 hover:bg-black/90 border border-gold/30 hover:border-gold text-gold rounded-full text-xs uppercase font-bold tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Progress Scrubber Dots */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1 px-2 no-scrollbar">
                {items.map((it, idx) => (
                  <button
                    key={it.id}
                    onClick={() => {
                      setDragDirection(idx > safeIndex ? -1 : 1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === safeIndex
                        ? 'w-6 bg-[#FFD700] shadow-[0_0_8px_#FFD700]'
                        : 'w-1.5 bg-gold/25 hover:bg-gold/50'
                    }`}
                    aria-label={`Jump to page ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-black/60 hover:bg-black/90 border border-gold/30 hover:border-gold text-gold rounded-full text-xs uppercase font-bold tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 2. EXPANDED GRID VIEW (Alternative Layout) */}
        {items.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-[4/5] bg-black rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/40 transition-all duration-500 animate-fade-in"
                >
                  <img
                    src={item.url}
                    alt={item.occasion}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 text-gold">
                        <Calendar size={12} />
                        <span className="text-[10px] uppercase tracking-widest font-bold font-sans">
                          {item.year || 'Recorded'}
                        </span>
                      </div>

                      <h4 className="text-parchment text-xl font-serif italic mb-1">
                        {item.occasion}
                      </h4>

                      <div className="space-y-1">
                        <p className="text-[10px] text-gold/60 uppercase tracking-widest flex items-center gap-1.5">
                          <Users size={12} /> Who is in the picture
                        </p>
                        <p className="text-parchment/80 font-serif text-xs italic">
                          {item.subjects}
                        </p>
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => setSelectedImage(item)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gold transition-colors cursor-pointer"
                          aria-label="View full size"
                        >
                          <Maximize2 size={15} />
                        </button>
                        {isAdminMode && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/30 rounded-full text-red-400 transition-colors cursor-pointer"
                            aria-label="Delete photo"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty Archive State */}
        {items.length === 0 && !isAdding && (
          <div className="py-24 text-center border-2 border-dashed border-gold/15 rounded-3xl bg-black/30 p-8 flex flex-col items-center justify-center">
            <Camera size={48} className="mx-auto text-gold/30 mb-6" />
            <p className="text-gold/60 font-serif italic text-xl mb-4">
              The visual archive is awaiting photographs.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gold text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              <Plus size={14} />
              Add First Photograph
            </button>
          </div>
        )}
      </div>

      {/* Add New Memory Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in"
            />

            <div
              className="relative w-full max-w-xl bg-charcoal border border-gold/20 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-10 animate-fade-in"
              style={{ animationDuration: '350ms' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-gold/40 hover:text-gold transition-colors p-2"
                aria-label="Close"
              >
                <X size={22} />
              </button>

              <h3 className="text-3xl font-serif text-gold italic mb-8">New Archive Entry</h3>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div
                    className={`w-full h-44 rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center overflow-hidden bg-black/50 ${
                      formData.url ? 'border-gold/40' : 'border-gold/10 hover:border-gold/30'
                    }`}
                  >
                    {formData.url ? (
                      <img
                        src={formData.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera size={32} className="text-gold/20 mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-gold/40">
                          Select Photograph
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">
                      The Occasion
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Traditional Wedding, Family Gathering"
                      value={formData.occasion}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, occasion: e.target.value }))
                      }
                      className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">
                        Who is in the picture
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Names of ancestors, relatives"
                        value={formData.subjects}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, subjects: e.target.value }))
                        }
                        className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">
                        Year / Era
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. 1974 or Early 80s"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, year: e.target.value }))
                        }
                        className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gold text-black rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mt-4 cursor-pointer"
                >
                  Commit to Archive
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/95 pb-20 pt-10 px-6 sm:px-10 animate-fade-in"
            >
              <div
                className="w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage.url}
                  alt={selectedImage.occasion}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-gold/20"
                />

                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 sm:top-10 sm:right-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-parchment transition-colors"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>

                <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 bg-charcoal/90 backdrop-blur-md border border-gold/30 p-6 rounded-3xl min-w-[280px] sm:min-w-[340px] text-center shadow-2xl">
                  <h4 className="text-2xl sm:text-3xl font-serif text-parchment italic mb-2">
                    {selectedImage.occasion}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-gold/70 text-xs mb-3 font-sans">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {selectedImage.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {selectedImage.subjects}
                    </span>
                    {selectedImage.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {selectedImage.location}
                      </span>
                    )}
                  </div>
                  {isAdminMode && (
                    <button
                      onClick={() => {
                        onDelete(selectedImage.id);
                        setSelectedImage(null);
                      }}
                      className="flex items-center gap-2 mx-auto text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-widest pt-2 border-t border-white/10 cursor-pointer"
                    >
                      <Trash2 size={13} /> Remove from Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VisualArchive;
