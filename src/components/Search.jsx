import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = ({ data, onResultClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Flatten the tree for searching
  const flattenTree = (node, acc = []) => {
    acc.push({ name: node.name, id: node.id, ...node });
    if (node.children) {
      node.children.forEach(child => flattenTree(child, acc));
    }
    return acc;
  };

  const allMembers = React.useMemo(() => flattenTree(data), [data]);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = allMembers.filter(m => 
        m.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, allMembers]);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gold/50" />
        </div>
        <input
          type="text"
          placeholder="Search for an ancestor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsVisible(true)}
          className="w-full bg-charcoal/80 backdrop-blur-xl border border-gold/20 rounded-full py-3 pl-12 pr-12 text-parchment placeholder:text-parchment/30 focus:outline-none focus:border-gold/50 transition-all shadow-2xl"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-gold/50 hover:text-gold"
          >
            <X size={18} />
          </button>
        )}

        <AnimatePresence>
          {isVisible && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 w-full bg-[#111] border border-gold/20 rounded-2xl overflow-hidden shadow-2xl"
            >
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onResultClick(result);
                    setQuery('');
                    setIsVisible(false);
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gold/10 text-left transition-colors border-b border-gold/5 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center">
                    <User size={14} className="text-gold/40" />
                  </div>
                  <div>
                    <div className="text-gold font-serif text-sm">{result.name}</div>
                    <div className="text-[10px] text-parchment/40 uppercase tracking-widest">{result.birthYear || 'Archived'}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;
