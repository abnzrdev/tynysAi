'use client';

import { motion, type Transition, type Variants } from 'framer-motion';
import { CheckCircle, Mail } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/HeroSection';
import { ContactFormModal } from '@/components/ContactFormModal';
import { type Locale } from '@/lib/i18n/config';
import type { Session } from 'next-auth';

// Types for components
type Dictionary = {
  nav: Record<string, string>;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
    goToDashboard: string;
    learnMore: string;
  };
  heroPillars: {
    fewShot: string;
    optimization: string;
    structuredOutput: string;
    security: string;
  };
  metrics: Record<string, string>;
  dashboard: {
    low: string;
    high: string;
    [key: string]: string;
  };
  architecture: Record<string, string>;
  features: Record<string, string>;
  cta: Record<string, string>;
  footer: Record<string, string>;
  dashboardPage: Record<string, string>;
  signIn: Record<string, string>;
  signUp: Record<string, string>;
  navbar: Record<string, string>;
  howItWorks?: string;
  contact?: {
    talkToUs: string;
    header: string;
    tagline: string;
    emailLabel: string;
    messageLabel: string;
    send: string;
    sending: string;
  };
  [key: string]: Record<string, string> | string | undefined;
};

type IconComponent = React.ComponentType<{ className?: string }>;

type ArchitectureLayerProps = {
  number: number;
  title: string;
  description: string;
  delay: number;
};

type FeatureCardProps = {
  icon: IconComponent;
  title: string;
  description: string;
};

// Animation variants
const revealTransition: Transition = { duration: 0.8, ease: 'easeOut' };

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition,
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

const ArchitectureLayer = ({ number, title, description, delay }: ArchitectureLayerProps) => (
  <motion.div
    variants={revealVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ ...revealTransition, delay }}
    className="relative group h-full"
  >
    <div className="relative h-full p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-teal-400 dark:hover:border-teal-500">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/0 via-blue-50/0 to-teal-50/0 group-hover:from-teal-50/40 group-hover:via-blue-50/20 group-hover:to-teal-50/40 dark:group-hover:from-teal-950/15 dark:group-hover:via-blue-950/8 dark:group-hover:to-teal-950/15 transition-all duration-500 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with Number */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-lg font-bold text-white">{number}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="inline-block px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 mb-2">
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider">Layer {number}</span>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div
    variants={revealVariants}
    className="p-6 rounded-2xl bg-muted/70 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-muted/40"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-950 dark:to-blue-950 flex items-center justify-center mb-4 shadow-inner">
      <Icon className="w-6 h-6 text-teal-700 dark:text-teal-300" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const useTranslations = (dict: Dictionary) => {
  return useCallback(
    (path: string) => {
      const segments = path.split('.');
      let current: unknown = dict;

      for (const segment of segments) {
        if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[segment];
        } else {
          current = undefined;
          break;
        }
      }

      return typeof current === 'string' ? current : undefined;
    },
    [dict]
  );
};

export function HomePage({ dict, lang, session }: { dict: Dictionary; lang: Locale; session: Session | null }) {
  const t = useTranslations(dict);
  const howItWorksHeading = t('howItWorks') ?? t('architecture.title') ?? 'How it Works';
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="bg-background overflow-x-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>

      <HeroSection 
        lang={lang} 
        session={session} 
        dict={{
          hero: dict.hero,
          heroPillars: dict.heroPillars,
        }}
      />

      {/* How it Works */}
      <section id="architecture" className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden -mt-20">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        
        {/* SVG Decorative Elements - Connecting Flow */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10" aria-hidden="true" style={{ zIndex: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.4" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgb(20, 184, 166)" opacity="0.5" />
            </marker>
          </defs>
          
          {/* Flow path: 1 -> 2 -> 4 -> 3 */}
          <motion.path
            d="M 20 25 L 50 25 L 50 50 L 80 50 L 80 75"
            stroke="url(#connectionGradient)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,1"
            markerEnd="url(#arrowhead)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
          />
          
          {/* Connection from 1 to 3 */}
          <motion.path
            d="M 20 25 Q 20 50, 20 75"
            stroke="url(#connectionGradient)"
            strokeWidth="0.4"
            fill="none"
            strokeDasharray="1.5,0.75"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 1, ease: "easeInOut" }}
          />
          
          {/* Connection from 2 to 4 */}
          <motion.path
            d="M 80 25 Q 80 50, 80 75"
            stroke="url(#connectionGradient)"
            strokeWidth="0.4"
            fill="none"
            strokeDasharray="1.5,0.75"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
          />
          
          {/* Decorative nodes at card positions */}
          {[1, 2, 3, 4].map((num, idx) => {
            const positions = [
              { x: 20, y: 25 }, // Layer 1
              { x: 80, y: 25 }, // Layer 2
              { x: 20, y: 75 }, // Layer 3
              { x: 80, y: 75 }, // Layer 4
            ];
            return (
              <motion.circle
                key={num}
                cx={positions[idx].x}
                cy={positions[idx].y}
                r="1"
                fill="rgb(20, 184, 166)"
                opacity="0.6"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              />
            );
          })}
        </svg>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            <div className="inline-block mb-3">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 border border-teal-200 dark:border-teal-800 text-sm font-semibold text-teal-700 dark:text-teal-300">
                Architecture
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 dark:from-teal-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                {howItWorksHeading}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {dict.architecture.description}
            </p>
          </motion.div>

          {/* Grid Layout - 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ArchitectureLayer
              number={1}
              title={dict.architecture.layer1Title}
              description={dict.architecture.layer1Description}
              delay={0}
            />

            <ArchitectureLayer
              number={2}
              title={dict.architecture.layer2Title}
              description={dict.architecture.layer2Description}
              delay={0.1}
            />

            <ArchitectureLayer
              number={3}
              title={dict.architecture.layer3Title}
              description={dict.architecture.layer3Description}
              delay={0.2}
            />

            <ArchitectureLayer
              number={4}
              title={dict.architecture.layer4Title}
              description={dict.architecture.layer4Description}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Key Features & Validation */}
      <section
        id="reliability"
        className="relative z-20 isolate py-12 px-4 sm:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {dict.features.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {dict.features.description}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <FeatureCard
              icon={CheckCircle}
              title={dict.features.logisticRegression}
              description={dict.features.logisticDescription}
            />
            <FeatureCard
              icon={CheckCircle}
              title={dict.features.decisionTree}
              description={dict.features.decisionTreeDescription}
            />
            <FeatureCard
              icon={CheckCircle}
              title={dict.features.randomForest}
              description={dict.features.randomForestDescription}
            />
            <FeatureCard
              icon={CheckCircle}
              title={dict.features.xgboost}
              description={dict.features.xgboostDescription}
            />
          </motion.div>

          {/* Additional validation points */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...revealTransition, delay: 0.15 }}
            className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 border border-teal-200 dark:border-teal-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">99.8%</div>
                <div className="text-foreground font-medium">{dict.features.dataReliability}</div>
                <div className="text-sm text-muted-foreground mt-1">{dict.features.withBufferFallback}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">&lt;30s</div>
                <div className="text-foreground font-medium">{dict.features.updateFrequency}</div>
                <div className="text-sm text-muted-foreground mt-1">{dict.features.realTimeMqtt}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">20+ Sensors</div>
                <div className="text-foreground font-medium">{dict.features.multiParameter}</div>
                <div className="text-sm text-muted-foreground mt-1">{dict.features.comprehensiveMonitoring}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background text-muted-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="/tynys-logo.png" 
              alt="Tynys Logo" 
              width={40} 
              height={40}
              className="drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-foreground">Tynys</span>
          </div>
          <p className="text-sm">
            {dict.footer.description}
          </p>
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-600">
            © {new Date().getFullYear()} Tynys. {dict.footer.copyright}
          </div>
        </div>
      </footer>

      {/* Sticky Contact Button */}
      <button
        onClick={() => setIsContactModalOpen(true)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-8 md:right-8 z-50 inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-all duration-300 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full shadow-lg hover:from-teal-700 hover:to-blue-700 hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 hover:text-white"
        aria-label="Open contact form"
      >
        <Mail className="h-5 w-5" />
        <span className="hidden sm:inline">Contact Us</span>
        <span className="sm:hidden">Contact</span>
      </button>

      {/* Contact Form Modal */}
      <ContactFormModal 
        open={isContactModalOpen} 
        onOpenChange={setIsContactModalOpen} 
      />
    </div>
  );
}

