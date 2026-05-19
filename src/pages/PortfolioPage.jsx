import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { getProjects } from '../services/api';

const PortfolioPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      const projects = await getProjects();
      if (mounted) {
        setProjectsList(projects);
      }
    };

    fetchProjects();

    const handleUpdate = () => fetchProjects();
    window.addEventListener('app-data-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('app-data-updated', handleUpdate);
    };
  }, []);

  const defaultCategories = ['Web', 'Design', 'UI/UX'];
  const dynamicCategories = ['All', ...new Set([...defaultCategories, ...projectsList.map(p => p.category).filter(Boolean)])];

  const filtered = activeCategory === 'All'
    ? projectsList
    : projectsList.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ── */}
      <section className="page-hero relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: '360px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d4a1f_0%,#000000_70%)] hero-bg-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#04C24415_0%,transparent_60%)] hero-bg-overlay"></div>
        <div className="relative z-10 px-6 py-28">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Our <span className="text-[#04C244]">Projects</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Explore our portfolio of successful projects that demonstrate our expertise in building modern digital solutions.
          </motion.p>
        </div>
      </section>

      {/* ── Projects Grid ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-3 justify-center mb-14"
          >
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-[#04C244] text-black border-[#04C244] shadow-lg shadow-[#04C244]/20'
                    : 'border-white/15 text-slate-400 hover:border-[#04C244] hover:text-[#04C244]'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Count badge */}
          <motion.p
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-400 text-sm mb-10"
          >
            Showing <span className="text-[#04C244] font-semibold">{filtered.length}</span> project{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' && <span> in <span className="text-[#04C244] font-semibold">{activeCategory}</span></span>}
          </motion.p>

          {/* Projects Grid with AnimatePresence */}
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#04C244] shadow-lg shadow-[#04C244]/20 dark:shadow-2xl hover:shadow-[#04C244]/40 transition-all"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-[#1e1e1e]">
                    <img
                      src={project.image || 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'; }}
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 project-overlay">
                    <span className="text-[#04C244] text-xs font-semibold uppercase tracking-widest mb-1 text-shadow-sm">{project.category}</span>
                    <h3 className="text-xl font-bold text-white mb-2 text-shadow-md">{project.title}</h3>
                    <p className="text-slate-300 text-sm mb-4 text-shadow-sm">{project.desc}</p>
                    <div className="flex gap-3 mt-auto">
                      {project.url && project.url !== '#' && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors keep-white">
                          <ExternalLink size={18} />
                        </a>
                      )}
                      {project.github_link && (
                        <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors keep-white">
                          <i className="fab fa-github text-lg"></i>
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Always-visible card footer */}
                  <div className="p-3 sm:p-5 border-t border-slate-100 dark:border-white/5 transition-colors">
                    <span className="text-[#04C244] text-[10px] sm:text-xs font-semibold uppercase tracking-widest">{project.category}</span>
                    <h3 className="text-slate-900 dark:text-white text-sm sm:text-base font-semibold mt-1 transition-colors truncate">{project.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-slate-500"
            >
              <p className="text-lg font-medium">No projects found in this category.</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 text-[#04C244] hover:underline text-sm"
              >
                View all projects →
              </button>
            </motion.div>
          )}

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="dark-cta py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d4a1f_0%,#000000_70%)] hero-bg-overlay"></div>
        <div className="relative z-10 text-center container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Want us to build your <span className="text-[#04C244]">next project?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 mb-8 max-w-xl mx-auto"
          >
            Let's create something amazing together.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#04C244] text-black font-semibold hover:bg-[#03a837] hover:shadow-lg hover:shadow-[#04C244]/30 transition-all group"
            >
              Get In Touch
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default PortfolioPage;
