import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, User, Quote, Edit3, Save, Camera, Trash2 } from 'lucide-react';

const ProfilePortal = ({ person, isOpen, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    if (person) {
      setEditedData({ ...person });
    }
    setIsEditing(false);
  }, [person, isOpen]);

  if (!person || !editedData) return null;

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            className="relative w-full max-w-5xl bg-[#0a0a0a] border border-gold/20 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.05)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-20" />

            {/* Navigation Controls */}
            <div className="absolute top-8 right-8 flex items-center gap-4 z-30">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
                  isEditing 
                  ? "bg-gold text-black border-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  : "bg-gold/5 text-gold border-gold/20 hover:bg-gold/10"
                }`}
              >
                {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                <span className="text-[10px] uppercase tracking-widest">{isEditing ? "Editing Mode" : "Edit Profile"}</span>
              </button>

              <button
                onClick={onClose}
                className="text-gold/40 hover:text-gold transition-all p-2 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              {/* Image / Portrait Section */}
              <div className="w-full md:w-[40%] relative bg-[#0d0d0d] flex flex-col items-center justify-center p-12 lg:p-16 border-b md:border-b-0 md:border-r border-gold/10">
                <div className="relative group">
                  <div className="absolute -inset-8 bg-gold/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative w-56 h-56 lg:w-64 lg:h-64 rounded-full border border-gold/20 flex items-center justify-center overflow-hidden bg-black ring-4 ring-gold/5 ring-offset-4 ring-offset-black">
                    {editedData.imageUrl ? (
                      <img src={editedData.imageUrl} alt={editedData.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={120} className="text-gold/5" />
                    )}
                    
                    {isEditing && (
                      <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={40} className="text-gold mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Upload Portrait</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  
                  {isEditing && editedData.imageUrl && (
                    <button 
                      onClick={() => handleInputChange('imageUrl', null)}
                      className="absolute bottom-4 right-4 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="mt-12 text-center w-full space-y-4">
                   {isEditing ? (
                     <div className="space-y-4">
                       <input 
                         type="text" 
                         value={editedData.name}
                         onChange={(e) => handleInputChange('name', e.target.value)}
                         className="w-full bg-black border border-gold/30 text-gold font-serif text-3xl text-center rounded-lg p-3 focus:outline-none focus:border-gold"
                         placeholder="Enter Full Name"
                       />
                       <select 
                         value={editedData.gender}
                         onChange={(e) => handleInputChange('gender', e.target.value)}
                         className="bg-black border border-gold/20 text-gold uppercase text-[10px] p-2 rounded tracking-widest"
                       >
                         <option value="male">Patriarch</option>
                         <option value="female">Matriarch</option>
                       </select>
                     </div>
                   ) : (
                     <>
                       <h2 className="text-gold font-serif text-5xl lg:text-6xl tracking-tight leading-tight">{person.name}</h2>
                       <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mt-6" />
                       <p className="text-gold/40 font-sans text-[10px] uppercase tracking-[0.4em] mt-4">
                         {person.gender === 'male' ? 'Patriarch' : 'Matriarch'}
                       </p>
                     </>
                   )}
                </div>
              </div>

              {/* Information Section */}
              <div className="w-full md:w-[60%] p-12 lg:p-16 overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-black custom-scrollbar">
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/30 flex items-center gap-2 font-sans">
                        <Calendar size={12} className="text-gold/50" /> Life Span
                      </p>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={editedData.birthYear || ''}
                            onChange={(e) => handleInputChange('birthYear', e.target.value)}
                            className="w-24 bg-black border border-gold/20 text-parchment font-serif text-lg rounded p-2"
                            placeholder="Birth"
                          />
                          <span className="text-gold/30">—</span>
                          <input 
                            type="text" 
                            value={editedData.deathYear || ''}
                            onChange={(e) => handleInputChange('deathYear', e.target.value)}
                            className="w-24 bg-black border border-gold/20 text-parchment font-serif text-lg rounded p-2"
                            placeholder="Death"
                          />
                        </div>
                      ) : (
                        <p className="text-parchment font-serif text-2xl tracking-wide">
                          {person.birthYear || 'Unknown'} — {person.deathYear || 'Present'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/30 flex items-center gap-2 font-sans">
                        <MapPin size={12} className="text-gold/50" /> Origins
                      </p>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full bg-black border border-gold/20 text-parchment font-serif text-lg rounded p-2"
                          placeholder="Place of Origin"
                        />
                      ) : (
                        <p className="text-parchment font-serif text-2xl tracking-wide">
                          {person.location || 'Okpori Ancestral Lands'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold/30 flex items-center gap-2 font-sans">
                      <Quote size={12} className="text-gold/50" /> The Legacy
                    </p>
                    <div className="relative pt-2">
                      <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-gold/10 rounded-full" />
                      {isEditing ? (
                        <textarea 
                          value={editedData.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          className="w-full h-48 bg-black border border-gold/20 text-parchment/80 font-serif text-lg rounded p-4 leading-relaxed italic focus:border-gold/40 focus:outline-none"
                          placeholder="Whisper their story into the archive..."
                        />
                      ) : (
                        <p className="text-parchment/80 font-serif leading-relaxed italic text-2xl lg:text-3xl pl-4 drop-shadow-sm">
                          {person.bio || "Story pending archive verification. This ancestor's contribution to the Okpori flame is a testament to the family's enduring strength."}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-8 flex justify-end">
                      <button
                        onClick={handleSave}
                        className="px-10 py-4 bg-gold text-black uppercase text-xs tracking-[0.3em] font-bold rounded-lg hover:bg-gold-muted transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:scale-105"
                      >
                        Commit to Memory
                      </button>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="pt-10 border-t border-gold/5">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-gold/20 mb-6 font-sans">Lineage Records</p>
                      <div className="flex flex-wrap gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="px-6 py-3 bg-white/5 border border-gold/10 text-gold/60 text-[9px] uppercase tracking-[0.2em] rounded-full">
                          Verified Carrier
                        </div>
                        <div className="px-6 py-3 bg-white/5 border border-gold/10 text-gold/60 text-[9px] uppercase tracking-[0.2em] rounded-full">
                          Okpori Bloodline
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePortal;
