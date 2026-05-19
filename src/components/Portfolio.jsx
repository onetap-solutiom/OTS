import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { getProjects } from '../services/api';

const Portfolio = () => {
  const [projectsList, setProjectsList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      const projects = await getProjects();
      if (mounted) {
        setProjectsList(projects.slice(0, 3));
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

  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / projectsList.length;
    const index = Math.round(scrollPosition / cardWidth);
    if (index >= 0 && index < projectsList.length) {
      setActiveIndex(index);
    }
  };

  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Our <span className="text-gradient">Projects</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            A collection of our latest innovative digital projects, crafted with creativity and precision.
          </motion.p>
        </div>

        {/* Desktop Container */}
        <div className="hidden md:flex flex-wrap justify-center gap-8">
          {projectsList.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#04C244] shadow-lg shadow-[#04C244]/20 dark:shadow-2xl hover:shadow-[#04C244]/40 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-sm transition-all"
            >
              <div className="aspect-video overflow-hidden bg-zinc-900">
                <img 
                  src={project.image || 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'; }}
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/75 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6 project-overlay">
                <span className="text-[#04C244] text-sm font-medium mb-1 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 text-shadow-sm">
                  {project.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 delay-75 text-shadow-md">
                  {project.title}
                </h3>
                <div className="flex gap-3 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 delay-100">
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
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipeable Slider with Card Peeking */}
        <div className="md:hidden relative w-full overflow-hidden">
          <div 
            id="projects-slider"
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[10vw] scrollbar-none py-4 w-full"
            style={{ scrollBehavior: 'smooth' }}
          >
            {projectsList.map((project, index) => (
              <div
                key={index}
                className="snap-center shrink-0 w-[80vw] max-w-[320px] group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#04C244] shadow-lg shadow-[#04C244]/20 dark:shadow-2xl hover:shadow-[#04C244]/40 transition-all flex flex-col justify-between"
              >
                <div className="aspect-video overflow-hidden bg-zinc-900 shrink-0">
                  <img 
                    src={project.image || 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/75 to-transparent opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 project-overlay">
                  <span className="text-[#04C244] text-xs font-medium mb-0.5 text-shadow-sm">
                    {project.category}
                  </span>
                  <h3 className="text-base font-bold text-white mb-3 text-shadow-md">
                    {project.title}
                  </h3>
                  <div className="flex gap-2.5">
                    {project.url && project.url !== '#' && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors keep-white">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {project.github_link && (
                      <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors keep-white">
                        <i className="fab fa-github text-base"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {projectsList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const container = document.getElementById('projects-slider');
                  if (container) {
                    const cardWidth = container.scrollWidth / projectsList.length;
                    container.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-[#04C244]' : 'w-1.5 bg-slate-600/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/portfolio" className="inline-block px-8 py-3 rounded-full border border-black/15 dark:border-white/10 hover:border-[#04C244] dark:hover:border-[#04C244] text-black dark:text-white font-medium transition-colors">
            See All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
