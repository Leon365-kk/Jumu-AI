import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import SEO from '@/lib/SEO';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout hideNav>
      <SEO
        title="Jumu AI — Welcome"
        description="Jumu AI: A cognitive sanctuary for neurodiverse learners. Smart reader, AI story maker, math visualizer, and more."
        canonical={typeof window !== 'undefined' ? window.location.origin : 'https://jumu.ai'}
        noIndex
      />
      <div className="h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150 animate-pulse" />
          <div className="relative z-10 w-full flex flex-col items-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col gap-4 max-w-md"
            >
              <h1 className="font-headline font-extrabold text-7xl md:text-8xl tracking-tighter text-on-surface">
                Jumu Ai
              </h1>
              <p className="text-on-surface-variant text-xl md:text-2xl font-medium tracking-wide opacity-80 italic">
                Gather & Learn
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "12rem" }}
          transition={{ delay: 1, duration: 2 }}
          className="mt-24 h-1 bg-surface-container-highest rounded-full overflow-hidden"
        >
          <div className="h-full bg-primary w-1/3 rounded-full opacity-60 animate-[loading_2s_infinite]" />
        </motion.div>

        <footer className="fixed bottom-12 w-full text-center px-6">
          <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
            Creating a calm space for your thoughts
          </p>
        </footer>
      </div>
    </Layout>
  );
}
