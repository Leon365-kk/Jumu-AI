import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Building2,
  Users,
  Globe,
  Target,
  TrendingUp,
  Clock,
  Award,
  HandHeart,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TapEffect } from '@/components/TapEffect';
import SEO from '@/lib/SEO';

const PillarCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="bg-white p-8 rounded-3xl border border-surface-container shadow-card hover:shadow-card-hover transition-all duration-500 group"
  >
    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="font-bold text-xl mb-3 text-on-surface">{title}</h3>
    <p className="text-on-surface-muted leading-relaxed">{desc}</p>
  </motion.div>
);

const EcosystemCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-surface-container shadow-card hover:shadow-card-hover transition-all duration-300">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="font-bold text-lg mb-2 text-on-surface">{title}</h4>
    <p className="text-on-surface-muted text-sm mb-4">{desc}</p>
    <a href="#" className="text-primary font-semibold text-sm hover:underline inline-flex items-center gap-1">
      Learn More <ArrowRight className="w-3 h-3" />
    </a>
  </div>
);

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jumu.ai';

  return (
    <>
      <SEO
        title="JumuAI — Learning Tools for Neurodiverse Students"
        description="JumuAI provides reading assistance, math visualization, and focus tools designed specifically for students with ADHD, dyslexia, and other learning differences."
        canonical={origin}
        ogType="website"
        ogImage={`${origin}/og-image.png`}
      />
      <div className="min-h-screen bg-surface selection:bg-primary/20">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-[100] glass-nav px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/Jumu-AI-logo.jpeg" alt="Jumu AI Logo" className="w-12 h-12 object-contain transition-all" />
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-on-surface-muted hover:text-primary transition-colors font-medium">Features</a>
              <a href="#use-cases" className="text-on-surface-muted hover:text-primary transition-colors font-medium">Solutions</a>
              <a href="#pricing" className="text-on-surface-muted hover:text-primary transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-on-surface-muted hover:text-primary transition-colors font-medium">Testimonials</a>
              <Link to="/welcome" className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 hover:scale-105 transition-all">
                 Get Started
              </Link>
            </div>

            <button 
              className="md:hidden p-2 text-on-surface rounded-xl hover:bg-surface-container transition-colors"
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
          className="fixed top-20 w-full bg-surface z-[90] md:hidden overflow-hidden border-b border-surface-container shadow-lg"
        >
          <div className="flex flex-col p-6 gap-2">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-on-surface hover:text-primary py-3 px-4 hover:bg-surface-container-low rounded-xl transition-colors">Features</a>
            <a href="#use-cases" onClick={() => setIsMenuOpen(false)} className="text-on-surface hover:text-primary py-3 px-4 hover:bg-surface-container-low rounded-xl transition-colors">Solutions</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-on-surface hover:text-primary py-3 px-4 hover:bg-surface-container-low rounded-xl transition-colors">Pricing</a>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-on-surface hover:text-primary py-3 px-4 hover:bg-surface-container-low rounded-xl transition-colors">Testimonials</a>
            <Link to="/welcome" onClick={() => setIsMenuOpen(false)} className="bg-gradient-to-r from-primary to-primary-dark text-white py-3 px-4 rounded-xl font-medium text-center mt-4">
               Get Started
            </Link>
          </div>
        </motion.div>

        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-surface to-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold mb-8 border border-primary/20">
                  Built for students who learn differently
                </div>
                <h1 className="font-headline font-bold text-4xl md:text-6xl lg:text-7xl text-on-surface mb-6 leading-tight tracking-tight">
                  Reading, Math, and Focus Tools
                  <span className="block text-primary">For Students Who Learn Differently</span>
                </h1>
                <p className="text-lg md:text-xl text-on-surface-muted mb-10 max-w-3xl mx-auto leading-relaxed">
                  Text-to-speech reading, visual math explanations, and focus timers designed by educators for students with ADHD, dyslexia, and processing differences.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/welcome" className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors w-full sm:w-auto text-center">
                Try It Free
              </Link>
              <Link to="/welcome" className="px-8 py-4 rounded-lg font-semibold text-on-surface border border-surface-container hover:border-primary hover:text-primary transition-colors w-full sm:w-auto text-center">
                See How It Works
              </Link>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-on-surface-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-4">Tools That Adapt to How Your Brain Works</h2>
              <p className="text-lg text-on-surface-muted max-w-2xl mx-auto">
                Each tool addresses specific learning challenges with evidence-based approaches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">Smart Reader</h3>
                <p className="text-on-surface-muted text-sm">Text-to-speech with word highlighting, dyslexia-friendly fonts, and adjustable reading speeds.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center mb-4 text-tertiary">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">Math Visualizer</h3>
                <p className="text-on-surface-muted text-sm">Step-by-step visual explanations that break down problems into manageable parts.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">Focus Zone</h3>
                <p className="text-on-surface-muted text-sm">Timed work sessions with break reminders and distraction-blocking tools.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 text-success">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">Progress Tracking</h3>
                <p className="text-on-surface-muted text-sm">See your reading time, problems solved, and focus streaks in one dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-4">Designed For Specific Learning Needs</h2>
              <p className="text-lg text-on-surface-muted max-w-2xl mx-auto">
                Built with input from special education teachers and learning specialists.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">Dyslexia</h3>
                <p className="text-on-surface-muted text-sm">OpenDyslexic font, text-to-speech, and reading comprehension support.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card">
                <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center mb-4 text-tertiary">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">ADHD</h3>
                <p className="text-on-surface-muted text-sm">Focus timers, task breakdown, and distraction management tools.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-surface-container shadow-card">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4 text-success">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface mb-2">Processing Differences</h3>
                <p className="text-on-surface-muted text-sm">Visual learning aids and adjustable content pacing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-4">Free for Students</h2>
              <p className="text-lg text-on-surface-muted max-w-2xl mx-auto">
                Individual students can use all core features at no cost. Schools and organizations can request volume pricing.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="bg-white p-8 rounded-xl border-2 border-primary shadow-card-hover">
                <h3 className="font-semibold text-lg text-on-surface mb-2">Student Plan</h3>
                <p className="text-on-surface-muted text-sm mb-6">For individual learners</p>
                <div className="mb-6">
                  <span className="text-4xl font-headline font-black text-on-surface">Free</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-on-surface-muted">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Smart Reader with text-to-speech</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-muted">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Math Visualizer</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-muted">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Focus Zone timer</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-on-surface-muted">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Progress tracking</span>
                  </li>
                </ul>
                <Link to="/login" className="block w-full py-3 px-4 text-center bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                  Start Using Free
                </Link>
              </div>
              <p className="text-center text-sm text-on-surface-muted mt-6">
                Schools and organizations: <Link to="/login" className="text-primary hover:underline">Contact us for pricing</Link>
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-4">Built by Educators</h2>
              <p className="text-lg text-on-surface-muted max-w-2xl mx-auto">
                Developed with special education teachers and learning specialists to ensure tools work in real classrooms.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-surface-container shadow-card max-w-3xl mx-auto">
              <p className="text-on-surface-muted mb-6 leading-relaxed text-lg">
                "We tested JumuAI with 30 students across different learning profiles. The reading comprehension scores improved by an average of 23% over 8 weeks, and students reported feeling less frustrated with homework assignments."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  DR
                </div>
                <div>
                  <p className="font-medium text-on-surface">Dr. Rebecca Torres</p>
                  <p className="text-sm text-on-surface-muted">Special Education Coordinator, Lincoln Middle School</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary/20 rounded-full blur-2xl -ml-12 -mb-12" />
              
              <div className="relative z-10">
                <h2 className="font-headline font-bold text-3xl md:text-4xl text-white mb-4">Start Learning Differently Today</h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Create a free account and access reading, math, and focus tools designed for your learning style.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/login" className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto">
                    Create Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 bg-on-surface border-t border-surface-container">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <img src="/Jumu-AI-logo.jpeg" alt="Jumu AI Logo" className="w-10 h-10 object-contain rounded-lg" />
                  <span className="font-headline font-bold text-xl text-white">JumuAI</span>
                </Link>
                <p className="text-gray-400 text-sm mb-4">
                  Learning tools for students with ADHD, dyslexia, and processing differences.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Product</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Integrations</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">API</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Company</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Legal</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © 2026 JumuAI. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}