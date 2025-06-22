"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Truck, Award, Sparkles, Play } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white overflow-hidden min-h-screen flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 dark:bg-blue-400/50 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            animate={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-sky-400/10 dark:bg-sky-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 lg:pr-8"
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <Badge className="bg-sky-500/20 dark:bg-sky-400/20 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-400/30 hover:bg-sky-500/30 dark:hover:bg-sky-400/30 px-4 py-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Award className="h-4 w-4 mr-2" />
                </motion.div>
                Premium Quality Guaranteed
              </Badge>

              {/* Small Product Thumbnails */}
              <div className="hidden md:flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-12 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded border-2 border-primary dark:border-primary shadow-sm cursor-pointer"
                  >
                    <Image
                      src="/window1.jpg"
                      alt={`Product ${i}`}
                      width={48}
                      height={32}
                      className="w-full h-full object-cover rounded"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-lg text-gray-600 dark:text-gray-300 font-medium"
              >
                DISCOVER THE
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-gray-900 dark:text-white">EXCELLENCE OF</span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600 bg-clip-text text-transparent inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  ALUMINUM CRAFT
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl"
              >
                Explore Premium Aluminum Solutions with us. Stylish Windows, Seamless Doors, Unbeatable Quality. Your
                Project, Your Vision. Start Here.
              </motion.p>
            </div>

            {/* Features Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-6 text-sm"
            >
              {[
                { icon: Shield, text: "25-Year Warranty", color: "text-green-600 dark:text-green-400" },
                { icon: Truck, text: "Fast Delivery", color: "text-blue-600 dark:text-blue-400" },
                { icon: Award, text: "ISO Certified", color: "text-sky-600 dark:text-sky-400" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </motion.div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-500 text-white dark:text-black font-semibold px-8 py-6 text-lg group shadow-lg"
                >
                  <Link href="/products">
                    Explore Our Products
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>

              {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-6 text-lg font-semibold group"
                >
                  <Link href="/contact" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div> */}
            </motion.div>

            {/* Navigation Arrows */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="flex items-center gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-sky-500 dark:bg-sky-400 text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-sky-500 dark:bg-sky-400 text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Hero Product Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main Product Image */}
            <div className="relative z-10">
              <motion.div whileHover={{ scale: 1.02, rotateY: 5 }} transition={{ duration: 0.6 }} className="relative">
                <Image
                  src="/hero.jpg"
                  alt="Premium aluminum window"
                  width={700}
                  height={600}
                  className="w-full h-auto max-w-2xl mx-auto drop-shadow-2xl"
                  priority
                />

                {/* Curved Path Animation */}
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ delay: 1.5, duration: 2 }}
                >
                  <svg width="300" height="60" viewBox="0 0 300 60" className="text-sky-500 dark:text-sky-400">
                    <motion.path
                      d="M 50 30 Q 150 10 250 30"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1.5, duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
                    />
                  </svg>
                </motion.div>
              </motion.div>

              {/* Floating Info Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="absolute -top-4 -left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  500+
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: 5 }}
                className="absolute -bottom-4 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  25
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Award className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </motion.div>
              </motion.div>
            </div>

            {/* Background Decorations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 0.1, scale: 1.05, rotate: 3 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-blue-400/20 dark:from-sky-500/30 dark:to-blue-500/30 rounded-2xl -z-10"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
              animate={{ opacity: 0.05, scale: 1.1, rotate: -2 }}
              transition={{ delay: 0.7, duration: 1.2 }}
              className="absolute inset-0 bg-gradient-to-l from-blue-400/10 to-sky-400/10 dark:from-blue-500/20 dark:to-sky-500/20 rounded-2xl -z-20"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
