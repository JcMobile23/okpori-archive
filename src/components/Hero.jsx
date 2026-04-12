import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ onEnter }) => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-charcoal overflow-hidden">
      {/* Cinematic Background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-gold-glow)_0%,_transparent_70%)] opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000')] bg-cover bg-center brightness-50 contrast-125 grayscale-[40%] animate-subtle-zoom opacity-30" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="z-20 text-center px-4 max-w-4xl"
      >
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 2, ease: "easeOut" }}
           className="mb-8 flex justify-center"
        >
          <img 
            src="/crest.png" 
            alt="Okpori Family Crest" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.3)] filter brightness-110"
          />
        </motion.div>

        <motion.p 
          initial={{ letterSpacing: "0.2em", opacity: 0 }}
          animate={{ letterSpacing: "0.5em", opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="text-gold-muted uppercase text-xs mb-6 font-sans font-light"
        >
          Preserving the Ancestral Flame
        </motion.p>
        
        <h1 className="text-8xl md:text-[12rem] font-serif gold-gradient mb-8 leading-none select-none tracking-tight">
          Okpori
        </h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="space-y-8"
        >
          <p className="max-w-2xl mx-auto text-parchment/70 font-serif italic text-xl md:text-2xl leading-relaxed">
            "Roots that reach deep into the earth, branches that touch the heavens. 
            The story of us, beginning with him."
          </p>
          
          <div className="flex flex-col items-center gap-6 pt-8">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px var(--color-gold-glow)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnter}
              className="group relative px-12 py-5 overflow-hidden"
            >
              <div className="absolute inset-0 border border-gold/40 transition-colors group-hover:border-gold" />
              <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-gold uppercase tracking-[0.3em] text-sm font-sans font-medium transition-all group-hover:tracking-[0.4em]">
                Explore the Great Tree
              </span>
            </motion.button>
            
            <div className="animate-bounce mt-4">
              <div className="w-px h-16 bg-gradient-to-b from-gold/60 to-transparent" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] z-15" />
    </div>
  );
};

export default Hero;
