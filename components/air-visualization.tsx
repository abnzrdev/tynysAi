"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function AirVisualization() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate random particles representing air molecules
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 5,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }

      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient waves representing air layers */}
      <motion.div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        animate={{
          background: [
            "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating particles representing air molecules */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-teal-400 to-blue-400 dark:from-teal-600 dark:to-blue-600"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Concentric circles representing air quality monitoring zones */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96">
        {[1, 2, 3].map((ring, index) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-teal-400/20 dark:border-teal-600/20"
            style={{
              width: `${100 + index * 33}%`,
              height: `${100 + index * 33}%`,
              left: `${-index * 16.5}%`,
              top: `${-index * 16.5}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-1/4 right-1/4 w-96 h-96">
        {[1, 2, 3].map((ring, index) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-blue-400/20 dark:border-blue-600/20"
            style={{
              width: `${100 + index * 33}%`,
              height: `${100 + index * 33}%`,
              left: `${-index * 16.5}%`,
              top: `${-index * 16.5}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5 + 1,
            }}
          />
        ))}
      </div>

      {/* Flowing lines representing air currents */}
      <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10">
        <defs>
          <linearGradient id="airflow1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="airflow2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Curved paths representing air flow */}
        <motion.path
          d="M 0,50 Q 250,30 500,50 T 1000,50"
          stroke="url(#airflow1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{
            pathLength: { duration: 5, repeat: Infinity, ease: "linear" },
            opacity: { duration: 5, repeat: Infinity, ease: "linear" },
          }}
        />

        <motion.path
          d="M 1000,30 Q 750,50 500,30 T 0,30"
          stroke="url(#airflow2)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{
            pathLength: { duration: 6, repeat: Infinity, ease: "linear", delay: 1 },
            opacity: { duration: 6, repeat: Infinity, ease: "linear", delay: 1 },
          }}
        />

        <motion.path
          d="M 0,80 Q 250,60 500,80 T 1000,80"
          stroke="url(#airflow1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
          transition={{
            pathLength: { duration: 7, repeat: Infinity, ease: "linear", delay: 2 },
            opacity: { duration: 7, repeat: Infinity, ease: "linear", delay: 2 },
          }}
        />
      </svg>
    </div>
  );
}

