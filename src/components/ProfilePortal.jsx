import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, User, Quote, Edit3, Save, Camera, Trash2 } from 'lucide-react';

const ProfilePortal = ({ person, isOpen, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(() => (person ? { ...person } : null));

  if (!person || !editedData) return null;

  const handleInputChange = (field, value) => {
    setEditedData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prev) => (prev ? { ...prev, imageUrl: reader.result } : prev));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editedData) onSave(editedData);
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-fade-in"
          />

          <div
            className="relative w-full max-w-5xl bg-[#0a0a0a] border border-gold/20 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.05)] animate-fade-in"
            style={{ animationDuration: '400ms' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-20" />

            <div className="absolute top-8 right-8 flex items-center gap-4 z-30">
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
                  isEditing
                    ? 'bg-gold text-black border-gold font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-gold/5 text-gold border-gold/20 hover:bg-gold/10'
                }`}
              >
                {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                <span className="text-[10px] uppercase tracking-widest">
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="text-gold/40 hover:text-gold transition-all p-2 bg-white/5 hover:bg-white/10 rounded-full"
                aria-label="Close profile"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 max-h-[85vh] overflow-y-auto">
              <aside className="md:col-span-2 relative border-r border-gold/10 bg-gradient-to-b from-gold/5 to-transparent p-10 flex flex-col items-center text-center">
                <div className="w-40 h-40 rounded-full border-2 border-gold/30 overflow-hidden bg-black mb-8 flex items-center justify-center group relative">
                  {editedData.imageUrl ? (
                    <img
                      src={editedData.imageUrl}
                      alt={editedData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={56} className="text-gold/20" />
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={24} className="text-gold" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h1 className="text-4xl font-serif text-gold italic tracking-wider leading-tight mb-2">
                  {isEditing ? (
                    <input
                      value={editedData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-transparent border-b border-gold/30 focus:border-gold outline-none text-center"
                    />
                  ) : (
                    editedData.name
                  )}
                </h1>

                <p className="text-[10px] uppercase tracking-[0.4em] text-gold-muted mb-8">
                  {editedData.gender === 'female' ? 'Matriarch' : 'Patriarch'} Record
                </p>

                <div className="w-full space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-gold/50 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-gold-muted mb-1">
                        Lifespan
                      </div>
                      {isEditing ? (
                        <div className="flex gap-2 items-center text-sm text-parchment">
                          <input
                            value={editedData.birthYear || ''}
                            onChange={(e) => handleInputChange('birthYear', e.target.value)}
                            placeholder="Birth"
                            className="w-24 bg-black border border-gold/20 rounded px-2 py-1 text-sm"
                          />
                          <span className="text-gold-muted">—</span>
                          <input
                            value={editedData.deathYear || ''}
                            onChange={(e) => handleInputChange('deathYear', e.target.value)}
                            placeholder="Death"
                            className="w-24 bg-black border border-gold/20 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      ) : (
                        <p className="text-parchment/80 font-serif text-sm">
                          {editedData.birthYear || 'Unknown'} — {editedData.deathYear || 'Present'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gold/50 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-gold-muted mb-1">
                        Homeland
                      </div>
                      {isEditing ? (
                        <input
                          value={editedData.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Town, Region"
                          className="w-full bg-black border border-gold/20 rounded px-2 py-1 text-sm text-parchment"
                        />
                      ) : (
                        <p className="text-parchment/80 font-serif text-sm">
                          {editedData.location || 'Recorded in the Archive'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </aside>

              <section className="md:col-span-3 p-10 md:p-14 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Quote size={18} className="text-gold/40 shrink-0" />
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
                      Their Story
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedData.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={8}
                      placeholder="Write the biography, memories, and legacy of this ancestor..."
                      className="w-full bg-black border border-gold/20 rounded-xl p-4 text-parchment font-serif italic text-lg leading-relaxed focus:border-gold/50 outline-none transition-all resize-none"
                    />
                  ) : (
                    <p className="font-serif italic text-parchment/90 text-lg leading-relaxed">
                      {editedData.bio ||
                        '"Their story waits to be told. Click Edit Profile to record the memory of their days, the weight of their wisdom, and the lives they touched forever."'}
                    </p>
                  )}
                </div>

                <div className="h-px w-16 bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-gold-muted">
                      Generation Depth
                    </div>
                    <p className="font-serif text-2xl text-parchment italic">
                      {editedData.generation || '—'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-gold-muted">
                      Offspring Count
                    </div>
                    <p className="font-serif text-2xl text-parchment italic">
                      {editedData.children ? editedData.children.length : 0}
                    </p>
                  </div>
                </div>

                {isEditing &&
                  (editedData.imageUrl || editedData.bio || editedData.birthYear) && (
                    <div className="pt-6 border-t border-gold/10 flex justify-end">
                      <button
                        onClick={() => {
                          if (window.confirm('Remove this saved image and personal data from this profile?')) {
                            setEditedData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    imageUrl: undefined,
                                    bio: undefined,
                                    birthYear: undefined,
                                    deathYear: undefined,
                                    location: undefined,
                                  }
                                : prev
                            );
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-full hover:bg-red-500/10 transition-colors text-[10px] uppercase tracking-widest"
                      >
                        <Trash2 size={14} />
                        Clear Personal Edits
                      </button>
                    </div>
                  )}
              </section>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePortal;
