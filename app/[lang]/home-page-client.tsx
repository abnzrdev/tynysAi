'use client';

import { motion, useScroll, useTransform, type Transition, type Variants } from 'framer-motion';
import { Wifi, Database, BrainCircuit, Activity, CheckCircle, ShieldCheck, CloudCog, Sparkles, Waves, ArrowRight, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Navbar } from '@/components/navbar';
import { type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  icon: IconComponent;
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

const ArchitectureLayer = ({ number, title, description, icon: Icon, delay }: ArchitectureLayerProps) => (
  <motion.div
    variants={revealVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    transition={{ ...revealTransition, delay }}
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const videoRadius = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const t = useTranslations(dict);
  const howItWorksHeading = t('howItWorks') ?? t('architecture.title') ?? 'How it Works';
  const contactCopy = dict.contact ?? {
    talkToUs: 'Talk to us',
    header: 'Talk to our team',
    tagline: 'Share how we can help. We respond within one business day.',
    emailLabel: 'Your Email',
    messageLabel: 'Message',
    send: 'Send Message',
    sending: 'Sending...'
  };
  const trustedPartners = [
    'Kazakhstan Metro',
    'Astana Transit',
    'Eurasia Rail',
    'Steppe Cloud',
    'Urban Mobility Lab',
    'Caspian Tech',
  ];

  const valueProps = [
    {
      title: 'Real-Time Accuracy',
      description: 'Calibrated sensor stacks with sub-minute polling and anomaly smoothing deliver stable AQI streams.',
      icon: Activity,
    },
    {
      title: 'Data Privacy',
      description: 'End-to-end encryption and per-device signing ensure IoT payloads stay tenant-bound and compliant.',
      icon: ShieldCheck,
    },
    {
      title: 'Scalability',
      description: 'Cloud-native ingestion with autoscaling MQTT bridges keeps fleets online during peak demand.',
      icon: CloudCog,
    },
  ];

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

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSendingContact(true);

    console.log('Contact request', {
      email: formData.get('email'),
      message: formData.get('message'),
    });

    setTimeout(() => {
      setIsSendingContact(false);
      setIsContactDialogOpen(false);
      form.reset();
    }, 450);
  };

  return (
    <div className="bg-background overflow-x-hidden">
      <div className="relative z-50">
        <Navbar />
      </div>

      <section ref={heroRef} className="relative min-h-[200vh] pt-24">
        <div className="sticky top-0 flex h-[calc(100vh-96px)] items-center justify-center">
          <motion.div
            initial={false}
            style={{ scale: videoScale, borderRadius: videoRadius }}
            className="relative z-0 mx-auto h-full max-w-6xl overflow-hidden shadow-2xl ring-1 ring-white/15"
          >
            <motion.video
              initial={false}
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src="/media/background.mp4"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              aria-hidden
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/65" aria-hidden />

            <div className="relative z-10 flex h-full items-center justify-center px-6">
              <div className="max-w-5xl space-y-6 text-center text-white drop-shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Air Quality Intelligence</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-[0.22em]">
                  TynysAi
                </h1>
                <p className="text-lg md:text-xl text-white/85 max-w-3xl mx-auto">
                  Precision IoT Air Quality Monitoring for Urban Environments.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 px-6 text-lg bg-white text-slate-900 hover:bg-slate-100 shadow-xl"
                  >
                    <Link href={session ? `/${lang}/dashboard` : `/${lang}/sign-up`} className="flex items-center">
                      {session ? <LayoutDashboard className="mr-2 h-5 w-5" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                      {session ? "Go to Dashboard" : "Get Started"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-lg border-white/70 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Link href="#architecture" className="flex items-center">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-20 -mt-16 py-16 px-4 sm:px-6 lg:px-8 bg-background sm:-mt-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center space-y-2"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Trusted by transit innovators</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">Partners who rely on our live air data</h3>
          </motion.div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/60 dark:bg-muted/30">
            <motion.div
              className="flex gap-12 py-6 px-8 min-w-max"
              initial={false}
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            >
              {[...trustedPartners, ...trustedPartners].map((partner, idx) => (
                <div
                  key={`${partner}-${idx}`}
                  className="flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 px-6 py-3 shadow-sm ring-1 ring-border grayscale hover:grayscale-0 transition duration-300"
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Waves className="h-5 w-5 text-muted-foreground" />
                    <span>{partner}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-14"
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/70 px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-border">
              <Sparkles className="h-4 w-4 text-teal-500" />
              Purpose-built for public transit environments
            </p>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-foreground">Why teams choose Tynys</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
              Robust hardware, secure data flows, and elastic cloud delivery—ready for fleets of any size.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {valueProps.map((prop) => (
              <motion.div
                key={prop.title}
                variants={revealVariants}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-white/90 dark:bg-slate-900/70 p-6 shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-950 dark:to-blue-950 flex items-center justify-center shadow-inner">
                  <prop.icon className="w-6 h-6 text-teal-700 dark:text-teal-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">{prop.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{prop.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="architecture" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{howItWorksHeading}</h2>
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
      <section
        id="reliability"
        className="relative z-20 isolate py-20 px-4 sm:px-6 lg:px-8 bg-background"
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
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">5+ Sensors</div>
                <div className="text-foreground font-medium">{dict.features.multiParameter}</div>
                <div className="text-sm text-muted-foreground mt-1">{dict.features.comprehensiveMonitoring}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-700 via-blue-700 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4 max-w-3xl"
          >
            <p className="uppercase tracking-[0.25em] text-white/70 text-sm">Ready to launch</p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">Deploy city-grade air quality intelligence across your fleet.</h2>
            <p className="text-lg text-white/80">
              Start with a pilot route, then scale to every corridor with the same telemetry, privacy, and uptime guarantees.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="h-12 px-6 text-lg bg-white text-slate-900 hover:bg-slate-100"
                onClick={() => window.location.assign(`/${lang}/sign-in`)}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-lg border-white/70 text-white hover:bg-white/10"
                  >
                    {contactCopy.talkToUs}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl border border-white/25 bg-white/90 text-foreground shadow-2xl backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/90">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-semibold text-foreground">{contactCopy.header}</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                      {contactCopy.tagline}
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleContactSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                        {contactCopy.emailLabel}
                      </Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="bg-white/70 text-foreground shadow-sm ring-1 ring-white/40 placeholder:text-muted-foreground/70 dark:bg-slate-800/80 dark:ring-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                        {contactCopy.messageLabel}
                      </Label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        className="min-h-[140px] w-full rounded-lg border border-border bg-white/70 px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-1 ring-white/40 transition focus:border-primary focus:ring-2 focus:ring-primary/40 dark:bg-slate-800/80 dark:ring-slate-700"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSendingContact} className="w-full sm:w-auto">
                        {isSendingContact ? contactCopy.sending : contactCopy.send}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 gap-4 w-full lg:w-auto"
          >
            {[{
              label: 'Data freshness',
              value: '<30s refresh'
            }, {
              label: 'Sensor uptime',
              value: '99.8%'
            }, {
              label: 'Cities monitored',
              value: '12'
            }, {
              label: 'Deploy time',
              value: '48 hrs'
            }].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/20 bg-white/10 px-4 py-5 backdrop-blur">
                <p className="text-sm uppercase tracking-wide text-white/70">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
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

