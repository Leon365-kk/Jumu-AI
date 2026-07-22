import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Building2, ArrowRight, ChevronLeft, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';
import { persistInstitutionOnboarding } from '@/services/onboardingService';

export default function OnboardingInstitutionDetails() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!name.trim()) return;

    localStorage.setItem('onboarding_institution_name', name);
    localStorage.setItem('onboarding_institution_address', address);
    localStorage.setItem('onboarding_institution_email', contactEmail);

    try {
      if (user && user.id !== 'guest-user') {
        await persistInstitutionOnboarding(user.id);
      }
      navigate('/onboarding/personalize');
    } catch (error) {
      console.error('Failed to persist institution onboarding:', error);
      navigate('/dashboard');
    }
  };

  return (
    <Layout hideNav>
      <SEO
        title="Institution Details — Jumu AI"
        description="Enter your institution details to set up your account."
        canonical="https://jumu.ai/onboarding/institution-details"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/onboarding/institution-type')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Building2 className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            Institution Details
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Tell us about your institution.
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 block">
                Institution Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter institution name"
                className="w-full bg-surface-container-low border-2 border-surface-container-highest rounded-2xl px-5 py-4 text-lg font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 block">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  className="w-full bg-surface-container-low border-2 border-surface-container-highest rounded-2xl pl-12 pr-5 py-4 text-lg font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 block">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter contact email"
                  className="w-full bg-surface-container-low border-2 border-surface-container-highest rounded-2xl pl-12 pr-5 py-4 text-lg font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!name.trim()}
            className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            Continue
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}