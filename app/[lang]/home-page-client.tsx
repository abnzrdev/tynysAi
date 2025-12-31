'use client';

import { motion } from 'framer-motion';
import { Wind, Wifi, Database, BrainCircuit, Activity, ArrowRight, CheckCircle, Gauge, Thermometer, Droplets } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Locale } from '@/lib/i18n/config';
import { AirVisualization } from '@/components/air-visualization';

// Mock data for the live dashboard simulation
const generateMockData = () => {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(now - (19 - i) * 30000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }),
    pm25: 25 + Math.random() * 40,
    co2: 800 + Math.random() * 400,
  }));
};

const mockData = generateMockData();

// Current metrics for stat cards
const currentMetrics = {
  co2: 987,
  pm25: 45.3,
  pm10: 62.8,
  temperature: 28.5, // High - above 26°C to show badge
  humidity: 65, // High - above 60% to show badge
};

// Helper functions to determine status
const getTemperatureStatus = (temp: number, dict: any) => {
  if (temp < 18) return dict.dashboard.low;
  if (temp > 26) return dict.dashboard.high;
  return null; // Comfortable range, no badge
};

const getHumidityStatus = (humidity: number, dict: any) => {
  if (humidity < 30) return dict.dashboard.low;
  if (humidity > 60) return dict.dashboard.high;
  return null; // Comfortable range, no badge
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

// Internal components
const StatCard = ({ title, value, unit, icon: Icon, status }: any) => (
  <Card className="border-border hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">
        {value} <span className="text-lg font-normal text-muted-foreground">{unit}</span>
      </div>
      {status && (
        <Badge 
          variant="outline" 
          className={`mt-2 ${
            status === 'Good' || status === 'Жақсы' || status === 'Хорошо'
              ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
              : status === 'Moderate' || status === 'Орташа' || status === 'Умеренно'
              ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
              : status === 'High' || status === 'Жоғары' || status === 'Высокий'
              ? 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
              : status === 'Low' || status === 'Төмен' || status === 'Низкий'
              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
          }`}
        >
          {status}
        </Badge>
      )}
    </CardContent>
  </Card>
);

const ArchitectureLayer = ({ number, title, description, icon: Icon, delay }: any) => (
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

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <motion.div
    variants={fadeInUp}
    className="p-6 rounded-2xl bg-card border border-border hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-xl transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-950 dark:to-blue-950 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export function HomePage({ dict, lang }: { dict: any; lang: Locale }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Air Visualization Background */}
        <AirVisualization />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-teal-100 text-teal-700 border-teal-200 px-4 py-1 text-sm font-medium">
              <Activity className="w-4 h-4 mr-2 inline" />
              {dict.hero.badge}
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              {dict.hero.title}
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                {dict.hero.subtitle}
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              {dict.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={`/${lang}/sign-in`}>
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  {dict.nav.getStarted}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-border hover:border-teal-600 dark:hover:border-teal-400 px-8 py-6 text-lg transition-all duration-300"
                onClick={() => {
                  document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {dict.nav.learnArchitecture}
              </Button>
            </div>
          </motion.div>

          {/* Hero metrics preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 flex flex-wrap justify-center gap-8 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-foreground">{dict.metrics.realTime}</div>
              <div className="text-muted-foreground">{dict.metrics.mqttStreaming}</div>
            </div>
            <div className="hidden sm:block w-px bg-border" />
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-foreground">{dict.metrics.zeroLoss}</div>
              <div className="text-muted-foreground">{dict.metrics.bufferFallback}</div>
            </div>
            <div className="hidden sm:block w-px bg-border" />
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-foreground">{dict.metrics.mlPowered}</div>
              <div className="text-muted-foreground">{dict.metrics.pollutionAnalysis}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Dashboard Simulation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200 px-4 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block animate-pulse" />
              {dict.dashboard.statusLive}
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {dict.dashboard.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {dict.dashboard.description}
            </p>
          </motion.div>

          {/* Current Metrics Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <motion.div variants={fadeInUp}>
              <StatCard
                title={dict.dashboard.co2Level}
                value={currentMetrics.co2}
                unit="ppm"
                icon={Wind}
                status={dict.dashboard.good}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="PM2.5"
                value={currentMetrics.pm25}
                unit="µg/m³"
                icon={Activity}
                status={dict.dashboard.moderate}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="PM10"
                value={currentMetrics.pm10}
                unit="µg/m³"
                icon={Gauge}
                status={dict.dashboard.moderate}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title={dict.dashboard.temperature}
                value={currentMetrics.temperature}
                unit="°C"
                icon={Thermometer}
                status={getTemperatureStatus(currentMetrics.temperature, dict)}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title={dict.dashboard.humidity}
                value={currentMetrics.humidity}
                unit="%"
                icon={Droplets}
                status={getHumidityStatus(currentMetrics.humidity, dict)}
              />
            </motion.div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{dict.dashboard.chartTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">{dict.dashboard.chartDescription}</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="time" 
                      className="stroke-muted-foreground"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#14b8a6"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', style: { fill: '#14b8a6' } }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#3b82f6"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: 'CO₂ (ppm)', angle: 90, position: 'insideRight', style: { fill: '#3b82f6' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="pm25" 
                      stroke="#14b8a6" 
                      strokeWidth={3}
                      name="PM2.5"
                      dot={{ fill: '#14b8a6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="co2" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="CO₂"
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* System Architecture */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {dict.architecture.title}
            </h2>
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-600 via-blue-600 to-blue-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {dict.cta.title}
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            {dict.cta.description}
          </p>
          <Link href={`/${lang}/sign-in`}>
            <Button size="lg" className="bg-card text-teal-600 dark:text-teal-400 border border-transparent hover:border-teal-500 dark:hover:border-teal-400 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
              {dict.cta.button}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="/tynys-logo.png" 
              alt="Tynys Logo" 
              width={40} 
              height={40}
              className="drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-white">Tynys</span>
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

