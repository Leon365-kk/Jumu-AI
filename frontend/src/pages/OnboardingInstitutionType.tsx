import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Building2, ArrowRight, ChevronLeft, GraduationCap, Book, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

const INSTITUTION_TYPES = [
  { value: 'school', label: 'School', icon: <GraduationCap className="w-8 h-8" /> },
  { value: 'college', label: 'College', icon: <Book className="w-8 h-8" /> },
  { value: 'university', label: 'University', icon: <Building2 className="w-8 h-8" /> },
  { value: 'training_center', label: 'Training Center', icon: <Users className="w-8 h-8" /> },
];

export default function OnboardingInstitutionType() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleContinue = () => {
    if (selectedType) {
      localStorage.setItem('onboarding_institution_type', selectedType);
      navigate('/onboarding/institution-details');
    }
  };

  return (
    <Layout hideNav>
      <SEO
        title="Institution Type — Jumu AI"
        description="Select your institution type to set up your account."
        canonical="https://jumu.ai/onboarding/institution-type"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Building2 className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            What type of institution?
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Select the type that best describes your organization.
          </p>

          <div className="space-y-3 mb-8">
            {INSTITUTION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  selectedType === type.value
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container-highest bg-white hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedType === type.value ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {type.icon}
                </div>
                <span className="font-bold text-on-surface">{type.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedType}
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