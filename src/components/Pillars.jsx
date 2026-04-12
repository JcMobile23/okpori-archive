import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Crown, ScrollText, Users, Award } from 'lucide-react';

const pillars = [
  {
    name: "OKPORI",
    role: "The Founding Father",
    icon: <Crown className="text-gold" />,
    summary: "The root of the lineage, whose vision established the strength of the name that endures to this day.",
  },
  {
    name: "IGWE AKUBUEZE",
    role: "The First Pillar",
    icon: <Shield className="text-gold" />,
    summary: "The eldest son who carried the weight of leadership and expanded the ancestral reach of the family.",
  },
  {
    name: "JOSEPH",
    role: "The Great Branch",
    icon: <Users className="text-gold" />,
    summary: "A patriarch whose descendants form one of the most prolific and scholarly branches of the family tree.",
  },
  {
    name: "VEN CALEB",
    role: "The Scholar",
    icon: <BookOpen className="text-gold" />,
    summary: "A leader in mind and spirit, known for preserving the family history and guiding the younger generations.",
  },
  {
    name: "CHIEF CALEB",
    role: "The Guardian",
    icon: <Award className="text-gold" />,
    summary: "A man of community and character, his legacy remains a cornerstone of the branch he established.",
  },
  {
    name: "OJIAKOR {AJIE}",
    role: "The Oral Tradition",
    icon: <ScrollText className="text-gold" />,
    summary: "The keeper of the AJIE title, whose wisdom and stories bridged the ancient and the modern.",
  }
];

const Pillars = () => {
  return (
    <section className="py-32 px-4 bg-gradient-to-b from-charcoal to-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-gold uppercase tracking-[0.4em] text-xs mb-4">Legacy Highlights</h2>
          <h3 className="text-5xl font-serif text-parchment italic">The Pillars of Okpori</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-[#111] border border-gold/10 p-8 rounded-2xl transition-all duration-500 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]"
            >
              <div className="w-12 h-12 bg-gold/5 border border-gold/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
                {pillar.icon}
              </div>
              
              <h4 className="text-gold font-serif text-2xl mb-2">{pillar.name}</h4>
              <p className="text-gold-muted uppercase tracking-widest text-[10px] mb-6">{pillar.role}</p>
              
              <div className="h-px w-12 bg-gold/20 mb-6 group-hover:w-full transition-all duration-700" />
              
              <p className="text-parchment/60 font-serif italic leading-relaxed text-lg">
                "{pillar.summary}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pillars;
