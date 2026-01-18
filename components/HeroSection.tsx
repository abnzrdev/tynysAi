'use client';

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ArrowRight, LayoutDashboard, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Session } from 'next-auth';
import type { Locale } from '@/lib/i18n/config';

type HeroSectionProps = {
  lang: Locale;
  session: Session | null;
  dict: {
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
  };
};

export function HeroSection({ lang, session, dict }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Background opacity: 1 (top) → 0 (bottom of hero)
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  // Background scale: 1 (top) → 1.1 (bottom) for zooming depth effect
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Update body class when background is scrolled past
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // When scroll progress reaches 0.85 or more, background is effectively scrolled past
      const shouldBeSolid = latest >= 0.85;
      const currentlySolid = document.body.hasAttribute('data-video-scrolled');
      
      if (shouldBeSolid && !currentlySolid) {
        // Background is scrolled past, add attribute to body
        document.body.setAttribute('data-video-scrolled', 'true');
        // Dispatch custom event for navbar to listen to
        window.dispatchEvent(new CustomEvent('videoScrolled', { detail: true }));
      } else if (!shouldBeSolid && currentlySolid) {
        // Background is still visible, remove attribute
        document.body.removeAttribute('data-video-scrolled');
        window.dispatchEvent(new CustomEvent('videoScrolled', { detail: false }));
      }
    }
  });

  // Generate random particles for air quality visualization
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  // Generate air molecules (O2, CO2, etc.)
  const molecules = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 25 + 20,
    delay: Math.random() * 5,
  }));

  return (
    <section ref={heroRef} className="relative min-h-[120vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <motion.div
          initial={false}
          style={{ 
            opacity: backgroundOpacity,
            scale: backgroundScale,
          }}
          className="fixed inset-0 z-0 h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        >
          {/* SVG Background with Air Quality Animations */}
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Wind Current Lines */}
            <defs>
              <linearGradient id="windGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" stopOpacity="0" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="particleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
              </linearGradient>
            </defs>

            {/* Animated Wind Currents */}
            {Array.from({ length: 8 }).map((_, i) => {
              const baseY = 50 + Math.sin(i) * 15;
              const baseX = i * 12.5;
              const initialPath = `M ${baseX} ${baseY} Q ${baseX + 10} ${baseY + Math.sin(i) * 10} ${baseX + 20} ${baseY}`;
              return (
                <motion.path
                  key={`wind-${i}`}
                  d={initialPath}
                  stroke="url(#windGradient)"
                  strokeWidth="0.3"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: [0.2, 0.5, 0.2],
                    d: [
                      initialPath,
                      `M ${baseX} ${baseY + Math.sin(i + 0.5) * 5} Q ${baseX + 10} ${baseY + Math.sin(i + 0.5) * 15} ${baseX + 20} ${baseY + Math.sin(i + 0.5) * 5}`,
                      initialPath,
                    ],
                  }}
                  transition={{
                    duration: 8 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.3,
                  }}
                />
              );
            })}

            {/* Floating Air Particles */}
            {particles.map((particle) => {
              const driftX = (Math.random() - 0.5) * 15;
              const driftX2 = (Math.random() - 0.5) * 20;
              return (
                <motion.circle
                  key={`particle-${particle.id}`}
                  r={particle.size * 0.3}
                  fill="url(#particleGradient)"
                  initial={{ opacity: 0, cx: particle.x, cy: particle.y }}
                  animate={{
                    opacity: [0, 0.6, 0],
                    cx: [particle.x, particle.x + driftX, particle.x + driftX2],
                    cy: [particle.y, particle.y - 5, particle.y - 10],
                  }}
                  transition={{
                    duration: particle.duration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: particle.delay,
                  }}
                />
              );
            })}

            {/* Air Molecules (O2, CO2 representation) */}
            {molecules.map((molecule) => {
              const driftX = (Math.random() - 0.5) * 8;
              const driftY = (Math.random() - 0.5) * 8;
              return (
                <motion.g
                  key={`molecule-${molecule.id}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    x: [molecule.x, molecule.x + driftX, molecule.x],
                    y: [molecule.y, molecule.y + driftY, molecule.y],
                  }}
                  transition={{
                    duration: molecule.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: molecule.delay,
                  }}
                >
                  {/* Outer circle (molecule boundary) */}
                  <circle
                    cx="0"
                    cy="0"
                    r={molecule.size * 0.5}
                    fill="none"
                    stroke="rgba(147, 197, 253, 0.3)"
                    strokeWidth="0.2"
                  />
                  {/* Inner circle (molecule core) */}
                  <circle
                    cx="0"
                    cy="0"
                    r={molecule.size * 0.2}
                    fill="rgba(147, 197, 253, 0.4)"
                  />
                  {/* Small dots representing atoms */}
                  <circle
                    cx={molecule.size * 0.3}
                    cy="0"
                    r={molecule.size * 0.1}
                    fill="rgba(96, 165, 250, 0.5)"
                  />
                  <circle
                    cx={-molecule.size * 0.3}
                    cy="0"
                    r={molecule.size * 0.1}
                    fill="rgba(96, 165, 250, 0.5)"
                  />
                </motion.g>
              );
            })}

            {/* Air Quality Indicator Waves */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.circle
                key={`wave-${i}`}
                cx="50"
                cy="50"
                r={20 + i * 10}
                fill="none"
                stroke="rgba(59, 130, 246, 0.1)"
                strokeWidth="0.3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0.8, 1.2, 1.5],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.8,
                }}
              />
            ))}
          </svg>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/65" aria-hidden="true"></div>
        </motion.div>

        {/* Hero Container - Centered Layout */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 lg:px-12 py-20">
          <div className="max-w-5xl mx-auto w-full">
            {/* Hero Content - Center Aligned - Minimal Text */}
            <div className="text-center space-y-6 text-white drop-shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
              {/* Main Headline - Center Aligned */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-[-0.02em] mb-4"
              >
                {dict.hero.title ? (
                  (() => {
                    const words = dict.hero.title.split(' ');
                    const firstWord = words[0];
                    const rest = words.slice(1).join(' ');
                    return (
                      <>
                        <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
                          {firstWord}
                        </span>
                        {rest && <span> {rest}</span>}
                      </>
                    );
                  })()
                ) : (
                  <span className="bg-gradient-to-r from-teal-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
                    TynysAi
                  </span>
                )}
              </motion.h1>
              
              {/* Subheading - Short and Concise */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-white/90 leading-[1.5] max-w-2xl mx-auto mb-8"
              >
                {dict.hero.description}
              </motion.p>

              {/* CTA Group - Center Aligned */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg"
                >
                  <Link href={session ? `/${lang}/dashboard` : `/${lang}/sign-up`} className="flex items-center">
                    {session ? <LayoutDashboard className="mr-2 h-5 w-5" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                    {session ? dict.hero.goToDashboard : dict.hero.getStarted}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-2 border-white/70 bg-white/10 text-white hover:bg-white/20 hover:border-white/90 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
                >
                  <Link href="#architecture" className="flex items-center">{dict.hero.learnMore}</Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-8 w-8 text-white/70" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
