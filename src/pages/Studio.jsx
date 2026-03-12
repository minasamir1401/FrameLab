import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FolderOpen, 
  Trash2, 
  Download, 
  ExternalLink,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { getStudioHistory, deleteFromStudio, clearStudioHistory } from '../services/storageService';

const Studio = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getStudioHistory();
      setHistory(data);
    };
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    await deleteFromStudio(id);
    const data = await getStudioHistory();
    setHistory(data);
  };

  const handleClearAll = async () => {
    if (window.confirm(t('studio.confirm_clear'))) {
      await clearStudioHistory();
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => 
    (item.prompt || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FolderOpen className="text-primary" />
              {t('studio.title')}
            </h1>
            <p className="text-muted">{t('studio.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text"
                placeholder={t('studio.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-muted'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-black' : 'text-muted'}`}
              >
                <List size={18} />
              </button>
            </div>

            {history.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Clear All"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <FolderOpen className="text-muted w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('studio.empty_title')}</h3>
            <p className="text-muted max-w-sm">
              {searchTerm ? t('studio.no_results') : t('studio.empty_description')}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
          }>
            {filteredHistory.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card group overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-6 p-4' : ''}`}
              >
                <div className={`relative overflow-hidden rounded-xl bg-stone-900 ${viewMode === 'list' ? 'w-32 h-32 shrink-0' : 'aspect-square'}`}>
                  {item.url?.includes('video') || item.url?.includes('.mp4') || item.url?.startsWith('data:video') || (item.model && item.model.toLowerCase().includes('video')) ? (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover" 
                      onClick={(e) => {
                        const v = e.target;
                        if (v.paused) v.play(); else v.pause();
                      }}
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                      muted
                      loop
                    />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    {(item.url?.includes('video') || item.url?.includes('.mp4') || (item.model && item.model.toLowerCase().includes('video'))) ? (
                      <span className="bg-primary/90 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-xl">Video</span>
                    ) : (
                      <span className="bg-white/10 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Image</span>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => window.open(item.url, '_blank')}
                      className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <a 
                      href={item.url} 
                      download={`framelab-${item.id}.${(item.url?.includes('video') || item.url?.includes('.mp4')) ? 'mp4' : 'png'}`}
                      className="p-2 bg-primary text-black rounded-lg hover:bg-primary/90"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>

                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <p className="text-sm text-white font-medium line-clamp-2 mb-2 leading-relaxed" dir="auto">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between gap-4 mt-auto pt-2 border-t border-white/5">
                    <span className="text-[10px] text-muted font-bold truncate max-w-[150px]">
                      {item.model ? item.model.split('/').pop() : 'Default Model'}
                    </span>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-muted hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;
