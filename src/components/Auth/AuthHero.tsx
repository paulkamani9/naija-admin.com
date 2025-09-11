"use client";
import React from "react";
import Logo from "@/components/shared/Logo";
import { motion } from "framer-motion";
import { 
  BuildingIcon, 
  HeartHandshakeIcon, 
  CreditCardIcon,
  ShieldCheckIcon,
  Users2Icon,
  ActivityIcon
} from "lucide-react";

export const AuthHero = () => {
  const features = [
    { icon: BuildingIcon, label: "Hospital Management" },
    { icon: HeartHandshakeIcon, label: "HMO Integration" },
    { icon: CreditCardIcon, label: "Plan Analytics" },
  ];

  const stats = [
    { icon: Users2Icon, value: "500+", label: "Healthcare Providers" },
    { icon: ShieldCheckIcon, value: "50+", label: "Insurance Plans" },
    { icon: ActivityIcon, value: "24/7", label: "System Monitoring" },
  ];

  return (
    <div className="hidden md:flex h-full bg-gradient-to-br from-sidebar/5 via-green-50/50 to-primary/5 dark:from-sidebar/20 dark:via-sidebar/10 dark:to-primary/10 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 right-16 w-24 h-24 bg-green-500/20 rounded-full blur-lg"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-16 h-16 bg-primary/20 rounded-full blur-md"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center w-full px-8 lg:px-12 relative z-10">
        {/* Logo Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo size="lg" showAdmin={true} />
        </motion.div>

        {/* Hero Text */}
        <motion.div 
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            <span className="text-foreground">Nigeria's Premier</span>
            <span className="block bg-gradient-to-r from-primary via-green-600 to-primary bg-clip-text text-transparent">
              Healthcare Admin
            </span>
            <span className="block text-muted-foreground text-2xl lg:text-3xl font-medium">
              Platform
            </span>
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-10">
            Empowering healthcare administrators with comprehensive tools to manage 
            hospitals, HMOs, and insurance plans across Nigeria's digital health ecosystem.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-card-foreground">
                    {feature.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div 
            className="grid grid-cols-3 gap-6 pt-6 border-t border-border/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Animated Decorative Elements */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modern Decorative Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
};
