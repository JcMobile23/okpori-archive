import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera, Users, Calendar, MapPin, Trash2, Maximize2 } from 'lucide-react';

const VisualArchive = ({ items, onAdd, onDelete }) => {
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

  return (
    <section className="py-24 px-6 bg-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-gold uppercase tracking-[0.4em] text-[10px] font-sans">The Visual Archive</h2>
            <h3 className="text-5xl font-serif text-parchment italic">Frozen in Time</h3>
            <p className="text-parchment/40 font-serif italic text-lg max-w-xl">
              "A collection of moments that define our journey. Every face tells a story, every gathering strengthens the bond."
            </p>
          </div>
          
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 px-8 py-4 bg-gold text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
          >
            <Plus size={16} />
            Add to Archive
          </button>
        </div>

        {/* Organized Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-[4/5] bg-black rounded-2xl overflow-hidden border border-gold/10 hover:border-gold/40 transition-all duration-500"
              >
                <img 
                  src={item.url} 
                  alt={item.occasion} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                
                {/* Overlay Metadata */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 text-gold">
                      <Calendar size={12} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">{item.year || 'Unknown Date'}</span>
                    </div>
                    
                    <h4 className="text-parchment text-2xl font-serif italic mb-1">{item.occasion}</h4>
                    
                    <div className="space-y-2">
                       <p className="text-[10px] text-gold/50 uppercase tracking-widest flex items-center gap-2">
                        <Users size={12} /> Who is in the picture
                       </p>
                       <p className="text-parchment/80 font-serif text-sm italic">{item.subjects}</p>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => setSelectedImage(item)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gold transition-colors"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/30 rounded-full text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {items.length === 0 && !isAdding && (
          <div className="py-32 text-center border-2 border-dashed border-gold/10 rounded-3xl">
            <Camera size={48} className="mx-auto text-gold/10 mb-6" />
            <p className="text-gold/30 font-serif italic text-xl">The visual archive is empty. Begin preserving your history.</p>
          </div>
        )}
      </div>

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
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-gold/40 hover:text-gold transition-colors"
              >
                <X size={24} />
              </button>

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
                    <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">The Occasion</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Traditional Wedding, Family Reunion"
                      value={formData.occasion}
                      onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                      className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">Who is in the picture</label>
                      <input 
                        required
                        type="text"
                        placeholder="Names of siblings, etc."
                        value={formData.subjects}
                        onChange={(e) => setFormData(prev => ({ ...prev, subjects: e.target.value }))}
                        className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-gold/50 ml-1">Year / Era</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. 1984 or Early 90s"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-parchment focus:border-gold/50 outline-none transition-all placeholder:text-parchment/20"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gold text-black rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mt-4"
                >
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
                  <X size={32} />
                </button>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md border border-gold/20 p-8 rounded-3xl min-w-[320px] text-center">
                   <h4 className="text-3xl font-serif text-parchment italic mb-2">{selectedImage.occasion}</h4>
                   <div className="flex items-center justify-center gap-4 text-gold/60 text-xs mb-4">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {selectedImage.year}</span>
                      <span className="flex items-center gap-1"><Users size={12}/> {selectedImage.subjects}</span>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VisualArchive;
