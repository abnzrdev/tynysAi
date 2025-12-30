'use client';

import { motion } from 'framer-motion';
import { Wind, Wifi, Database, BrainCircuit, Activity, ArrowRight, CheckCircle, Gauge, Thermometer, Droplets } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  temperature: 22.4,
  humidity: 58,
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
  <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className="h-4 w-4 text-teal-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900">
        {value} <span className="text-lg font-normal text-slate-500">{unit}</span>
      </div>
      {status && (
        <Badge 
          variant="outline" 
          className={`mt-2 ${
            status === 'Good' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : status === 'Moderate'
              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
              : 'bg-orange-50 text-orange-700 border-orange-200'
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
    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-bold text-teal-600">LAYER {number}</span>
        <div className="h-px bg-gradient-to-r from-teal-200 to-transparent flex-1" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <motion.div
    variants={fadeInUp}
    className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-teal-600" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-teal-100 text-teal-700 border-teal-200 px-4 py-1 text-sm font-medium">
              <Activity className="w-4 h-4 mr-2 inline" />
              IoT Air Quality Monitoring
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Real-Time Air Quality
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Monitoring for Dynamic Environments
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Autonomous IoT sensing powered by the Tynys device. Deployable in buses, metros, and trolleybuses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  View Live Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-300 hover:border-teal-600 hover:bg-teal-50 px-8 py-6 text-lg transition-all duration-300"
                onClick={() => {
                  document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn Architecture
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
              <div className="text-4xl font-bold text-slate-900">Real-Time</div>
              <div className="text-slate-600">MQTT Streaming</div>
            </div>
            <div className="hidden sm:block w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-slate-900">Zero Loss</div>
              <div className="text-slate-600">Buffer Fallback</div>
            </div>
            <div className="hidden sm:block w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-slate-900">ML-Powered</div>
              <div className="text-slate-600">Pollution Analysis</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Dashboard Simulation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
              Status: Live via MQTT
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Cloud-Connected Dashboard
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Monitor air quality metrics in real-time across your entire fleet
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
                title="CO₂ Level"
                value={currentMetrics.co2}
                unit="ppm"
                icon={Wind}
                status="Good"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="PM2.5"
                value={currentMetrics.pm25}
                unit="µg/m³"
                icon={Activity}
                status="Moderate"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="PM10"
                value={currentMetrics.pm10}
                unit="µg/m³"
                icon={Gauge}
                status="Moderate"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="Temperature"
                value={currentMetrics.temperature}
                unit="°C"
                icon={Thermometer}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="Humidity"
                value={currentMetrics.humidity}
                unit="%"
                icon={Droplets}
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
            <Card className="border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Live Air Quality Trends</CardTitle>
                <p className="text-sm text-slate-500">PM2.5 and CO₂ levels over the last 10 minutes</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#14b8a6"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', style: { fill: '#14b8a6' } }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#3b82f6"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'CO₂ (ppm)', angle: 90, position: 'insideRight', style: { fill: '#3b82f6' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
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
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Four hierarchical layers working in harmony to deliver reliable, real-time air quality insights
            </p>
          </motion.div>

          <div className="space-y-12">
            <ArchitectureLayer
              number={1}
              title="Sensing & Preprocessing"
              description="Tynys IoT Device. Localized acquisition, signal filtering, and onboard processing for accurate environmental readings."
              icon={Activity}
              delay={0}
            />

            <ArchitectureLayer
              number={2}
              title="Communication"
              description="MQTT over Wi-Fi. Buffer-based fallback ensures zero data loss during connectivity drops, maintaining data integrity."
              icon={Wifi}
              delay={0.1}
            />

            <ArchitectureLayer
              number={3}
              title="Cloud Infrastructure"
              description="Structured SQL Database & Web Dashboard. Scalable storage with secure multi-user access for seamless collaboration."
              icon={Database}
              delay={0.2}
            />

            <ArchitectureLayer
              number={4}
              title="Machine Learning & Analytics"
              description="Pollution classification using XGBoost & Random Forest. Anomaly detection for smarter transit decisions and predictive insights."
              icon={BrainCircuit}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Key Features & Validation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Research-Grade Reliability
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Rigorously benchmarked against commercial reference-grade monitors
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
              title="Logistic Regression"
              description="Binary classification for pollution threshold detection and alert triggering"
            />
            <FeatureCard
              icon={CheckCircle}
              title="Decision Tree"
              description="Interpretable rule-based classification for regulatory compliance"
            />
            <FeatureCard
              icon={CheckCircle}
              title="Random Forest"
              description="Ensemble learning for robust multi-class pollution categorization"
            />
            <FeatureCard
              icon={CheckCircle}
              title="XGBoost"
              description="Gradient boosting for high-accuracy predictive analytics"
            />
          </motion.div>

          {/* Additional validation points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">99.8%</div>
                <div className="text-slate-700 font-medium">Data Reliability</div>
                <div className="text-sm text-slate-600 mt-1">With buffer fallback</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">&lt;30s</div>
                <div className="text-slate-700 font-medium">Update Frequency</div>
                <div className="text-sm text-slate-600 mt-1">Real-time MQTT streaming</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">5+ Sensors</div>
                <div className="text-slate-700 font-medium">Multi-Parameter</div>
                <div className="text-sm text-slate-600 mt-1">Comprehensive monitoring</div>
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
            Ready to Transform Your Transit System?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join the future of smart, data-driven public transportation
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-slate-50 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
              Explore Live Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wind className="w-6 h-6 text-teal-400" />
            <span className="text-2xl font-bold text-white">Tynys</span>
          </div>
          <p className="text-sm">
            Real-time IoT air quality monitoring for dynamic environments
          </p>
          <div className="mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Tynys. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
