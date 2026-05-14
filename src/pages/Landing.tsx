import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Rocket, 
  ShieldCheck, 
  Heart, 
  Brain,
  MessageSquare,
  PlayCircle,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TapEffect } from '@/components/TapEffect';

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="bg-white p-8 rounded-[32px] border-2 border-surface-container-highest shadow-sm hover:shadow-xl transition-all duration-500 group"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">{title}</h3>
    <p className="text-on-surface-variant leading-relaxed">{desc}</p>
  </motion.div>
);

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-surface/80 backdrop-blur-xl border-b border-surface-container-high/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-headline font-black text-xl group-hover:rotate-12 transition-transform">
              J
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tighter text-on-surface">Jumu Ai</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-bold text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <a href="#about" className="font-bold text-on-surface-variant hover:text-primary transition-colors">Philosophy</a>
            <Link to="/login">
              <TapEffect>
                <button className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95">
                  Get Started
                </button>
              </TapEffect>
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-on-surface-variant"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div 
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
        className="fixed top-20 w-full bg-white z-[90] md:hidden overflow-hidden border-b border-surface-container-high shadow-lg"
      >
        <div className="flex flex-col p-6 gap-4">
          <a href="#features" onClick={() => setIsMenuOpen(false)} className="font-bold p-4 hover:bg-surface rounded-xl">Features</a>
          <a href="#about" onClick={() => setIsMenuOpen(false)} className="font-bold p-4 hover:bg-surface rounded-xl">Philosophy</a>
          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-primary text-white p-4 rounded-xl font-bold text-center">
            Sign In / Sign Up
          </Link>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-black uppercase tracking-widest">Empowering Neurodiversity</span>
              </div>
              <h1 className="font-headline font-black text-6xl md:text-8xl text-on-surface mb-8 leading-[0.95] tracking-tighter">
                Learn with <span className="text-primary italic">joy,</span> not struggle.
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant mb-12 max-w-2xl leading-relaxed">
                Jumu Ai is more than an app—it's a digital companion designed for neurodiverse minds. From gentle 
                reading assistance to creative story-making, discover a platform where you truly belong.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <TapEffect>
                  <Link to="/login" className="bg-primary text-white px-10 py-5 rounded-[24px] font-headline text-xl font-bold flex items-center gap-3 shadow-2xl shadow-primary/30 group">
                    Start Your Adventure
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </TapEffect>
                <Link to="/login" className="px-8 py-5 rounded-2xl font-bold text-on-surface-variant hover:bg-white hover:shadow-md transition-all">
                  Join as Guest
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center md:justify-start gap-6 text-on-surface-variant/60">
                 <div className="flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5" />
                   <span className="font-bold text-sm">Privately Secure</span>
                 </div>
                 <div className="w-1 h-1 bg-surface-container-high rounded-full" />
                 <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-5 h-5" />
                   <span className="font-bold text-sm">No Ads Forever</span>
                 </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="flex-1 relative"
          >
            <div className="relative z-10 w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-[80px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?auto=format&fit=crop&q=80&w=1280" 
                alt="Creative Lego Learning"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent mix-blend-multiply" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Brain className="w-64 h-64 text-white opacity-20 blur-2xl" />
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 -right-4 bg-white p-6 rounded-3xl shadow-xl border border-surface-container-high"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                    <Rocket />
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase tracking-wider text-stone-400">Streak</div>
                    <div className="font-headline font-bold text-xl">12 Days!</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-headline font-black text-4xl md:text-6xl text-on-surface mb-6 tracking-tight">Tools built for <span className="text-primary underline decoration-primary/20 underline-offset-8">your brain.</span></h2>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-medium">
              We removed the clutter, added the support, and prioritized calmness. 
              Everything you need to focus, learn, and create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BookOpen}
              color="bg-primary"
              title="Smart Reader"
              desc="Text-to-speech, custom fonts (OpenDyslexic), and instant word definitions to make reading a breeze."
            />
            <FeatureCard 
              icon={Zap}
              color="bg-secondary"
              title="Focus Zone"
              desc="A safe harbor with sensory sounds and ambient tools to help you find your calm when the world is too loud."
            />
            <FeatureCard 
              icon={Sparkles}
              color="bg-tertiary"
              title="Story Maker"
              desc="Let AI help you transform your wild ideas into beautiful, unique adventures you can read back later."
            />
            <FeatureCard 
              icon={Brain}
              color="bg-emerald-500"
              title="Math Visualizer"
              desc="Break down complex problems into friendly, step-by-step visual guides that make sense."
            />
            <FeatureCard 
              icon={Rocket}
              color="bg-orange-500"
              title="Earn as you Learn"
              desc="Experience points, badges, and a growing digital garden that celebrates every small victory."
            />
            <FeatureCard 
              icon={MessageSquare}
              color="bg-blue-500"
              title="Voice Assistant"
              desc="Talk to Jumu Ai. Ask questions, seek support, or just share your thoughts—it's always here for you."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="about" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-16 inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full text-primary"
          >
            <Heart className="w-12 h-12" />
          </motion.div>
          
          <h2 className="font-headline font-black text-4xl md:text-7xl text-on-surface mb-12 tracking-tighter leading-tight italic">
            "We don't fix people. <br /> We build bridges."
          </h2>
          
          <div className="space-y-8 text-xl text-on-surface-variant font-medium leading-relaxed max-w-3xl mx-auto mb-16">
            <p>
              The world isn't always built for neurodiverse thinkers. Overwhelming interfaces, 
              rigid structures, and high pressure can make learning feel like a mountain.
            </p>
            <p>
              <strong>Jumu Ai</strong> was built from the ground up by educators and technologists who 
              believe neurodiversity is a strength, not a deficit. We focus on sensory regulation, 
              executive function support, and positive reinforcement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: Heart, text: "Compassion-First UX", sub: "Designed to minimize anxiety and maximize confidence." },
              { icon: ShieldCheck, text: "Privacy by Default", sub: "Your data is yours. We never sell your personal information." },
              { icon: PlayCircle, text: "Multimodal Support", sub: "Read it, hear it, say it—learn the way that works for you." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-surface-container-high shadow-sm">
                <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-on-surface mb-2">{item.text}</h4>
                <p className="text-sm text-on-surface-variant font-medium">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-primary rounded-[56px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <h2 className="font-headline font-black text-4xl md:text-6xl text-white mb-8 tracking-tighter">Ready to gather?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
              Join thousands of learners who have found their digital home with Jumu Ai. 
              Totally free to try, forever yours to grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <TapEffect>
                <Link to="/login" className="bg-white text-primary px-12 py-5 rounded-[24px] font-headline text-2xl font-black shadow-xl hover:scale-105 transition-transform">
                  Get Started Free
                </Link>
              </TapEffect>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-headline font-black text-xl">
                J
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tighter text-on-surface">Jumu Ai</span>
            </Link>
            <p className="text-on-surface-variant font-medium max-w-sm mb-6">
              A gentle, supportive companion for neurodiverse learning and daily growth. 
              Built with love for brains that work differently.
            </p>
          </div>
          
          <div>
            <h5 className="font-black uppercase tracking-widest text-xs text-on-surface mb-6">Product</h5>
            <ul className="space-y-4 font-bold text-on-surface-variant text-sm">
              <li><a href="#features" className="hover:text-primary">Features</a></li>
              <li><a href="#about" className="hover:text-primary">Philosophy</a></li>
              <li><Link to="/login" className="hover:text-primary">Guest Mode</Link></li>
              <li><Link to="/login" className="hover:text-primary">Supporter Plan</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-black uppercase tracking-widest text-xs text-on-surface mb-6">Legal</h5>
            <ul className="space-y-4 font-bold text-on-surface-variant text-sm">
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Use</a></li>
              <li><a href="#" className="hover:text-primary">Cookie Settings</a></li>
              <li><a href="#" className="hover:text-primary">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-surface-container-high text-center">
          <p className="text-sm font-bold text-on-surface-variant/40 italic">
            © 2026 Jumu Ai. Proudly supporting neurodiversity around the globe.
          </p>
        </div>
      </footer>
    </div>
  );
}
