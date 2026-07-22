import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { User, Building2, Users, ArrowRight, GraduationCap, Heart, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

type EntityType = 'student' | 'institution' | 'organization';

interface EntityOption {
  type: EntityType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function OnboardingEntity() {
  const navigate = useNavigate();
  const { t } = useApp();

  const entityOptions: EntityOption[] = [
    {
      type: 'student',
      title: 'Student',
      description: 'Personalized learning for individual students',
      icon: <GraduationCap className="w-12 h-12" />,
      color: 'primary'
    },
    {
      type: 'institution',
      title: 'School',
      description: 'For schools, colleges, and training centers',
      icon: <Building2 className="w-12 h-12" />,
      color: 'tertiary'
    },
    {
      type: 'organization',
      title: 'Organization',
      description: 'For NGOs, community groups, and corporate training',
      icon: <Users className="w-12 h-12" />,
      color: 'secondary'
    }
  ];

  const handleSelectEntity = (entityType: EntityType) => {
    // Store entity type in localStorage for use in subsequent steps
    localStorage.setItem('onboarding_entity_type', entityType);
    
    if (entityType === 'student') {
      navigate('/onboarding/name');
    } else if (entityType === 'institution') {
      navigate('/onboarding/institution-type');
    } else {
      navigate('/onboarding/organization-type');
    }
  };

  return (
    <Layout hideNav>
      <SEO
        title="Choose Account Type — Jumu AI"
        description="Select your account type to get started with Jumu AI's personalized learning platform."
        canonical="https://jumu.ai/onboarding"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <User className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">
            Welcome to Jumu AI!
          </h1>
          <p className="text-on-surface-variant mb-12">
            Let's set up your account. What type of account are you creating?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {entityOptions.map((option) => (
              <motion.button
                key={option.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectEntity(option.type)}
                className={`p-8 rounded-3xl border-2 border-${option.color}/20 bg-${option.color}/5 hover:bg-${option.color}/10 transition-all text-left flex flex-col h-full`}
              >
                <div className={`w-16 h-16 bg-${option.color}/20 rounded-2xl flex items-center justify-center text-${option.color} mb-4`}>
                  {option.icon}
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                  {option.title}
                </h3>
                <p className="text-on-surface-variant text-sm flex-1">
                  {option.description}
                </p>
                <div className={`flex items-center gap-2 text-${option.color} font-bold mt-4`}>
                  <span>Select</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}