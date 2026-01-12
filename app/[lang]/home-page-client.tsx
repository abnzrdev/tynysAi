'use client';

import { motion } from 'framer-motion';
import { Wifi, Database, BrainCircuit, Activity, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { type Locale } from '@/lib/i18n/config';
import type { Session } from 'next-auth';

// Types for components
type Dictionary = {
  nav: Record<string, string>;
  hero: Record<string, string>;
  metrics: Record<string, string>;
  dashboard: {
    low: string;
    high: string;
    [key: string]: string;
  };
  architecture: Record<string, string>;
  features: Record<string, string>;
  cta: Record<string, string>;
  [key: string]: Record<string, string>;
};

type IconComponent = React.ComponentType<{ className?: string }>;

type ArchitectureLayerProps = {
  number: number;
  title: string;
  description: string;
  icon: IconComponent;
  delay: number;
};

type FeatureCardProps = {
  icon: IconComponent;
  title: string;
  description: string;
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const ArchitectureLayer = ({ number, title, description, icon: Icon, delay }: ArchitectureLayerProps) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className="relative flex gap-6 items-start group"
  >
    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-teal-500 dark:border-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-bold text-teal-600 dark:text-teal-400">LAYER {number}</span>
        <div className="h-px bg-gradient-to-r from-teal-200 dark:from-teal-800 to-transparent flex-1" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div
    variants={fadeInUp}
    className="p-6 rounded-2xl bg-muted/70 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-muted/40"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-950 dark:to-blue-950 flex items-center justify-center mb-4 shadow-inner">
      <Icon className="w-6 h-6 text-teal-700 dark:text-teal-300" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export function HomePage({ dict, lang: _lang, session: _session }: { dict: Dictionary; lang: Locale; session: Session | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlaybackRate = () => {
      video.playbackRate = 1.0;
    };

    syncPlaybackRate();
    video.addEventListener('loadedmetadata', syncPlaybackRate);
    return () => video.removeEventListener('loadedmetadata', syncPlaybackRate);
  }, []);

  return (
    <div className="bg-background">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-screen h-screen object-cover"
          src="/media/19079374-uhd_3840_2160_25fps.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/70 backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-black/60 to-slate-950/90 dark:to-black" />
      </div>

      <Navbar variant="transparent" />

      {/* Cinematic reveal */}
      <section className="relative min-h-[200vh]">
        <div className="h-screen" />
        <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <p className="max-w-5xl text-3xl sm:text-4xl md:text-5xl leading-relaxed font-serif text-foreground drop-shadow-xl">
            At Tynys, we monitor air quality exclusively through our autonomous IoT devices, providing real-time data from buses, metros, and trolleybuses, resulting in a live environmental snapshot reflective of each city’s transit conditions.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">How it Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {dict.architecture.description}
            </p>
          </motion.div>

          <div className="space-y-12">
            <ArchitectureLayer
              number={1}
              title={dict.architecture.layer1Title}
              description={dict.architecture.layer1Description}
              icon={Activity}
              delay={0}
            />

            <ArchitectureLayer
              number={2}
              title={dict.architecture.layer2Title}
              description={dict.architecture.layer2Description}
              icon={Wifi}
              delay={0.1}
            />

            <ArchitectureLayer
              number={3}
              title={dict.architecture.layer3Title}
              description={dict.architecture.layer3Description}
              icon={Database}
              delay={0.2}
            />

            <ArchitectureLayer
              number={4}
              title={dict.architecture.layer4Title}
              description={dict.architecture.layer4Description}
              icon={BrainCircuit}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Key Features & Validation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
            viewport={{ once: true }}
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">5+ Sensors</div>
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
    </div>
  );
}

