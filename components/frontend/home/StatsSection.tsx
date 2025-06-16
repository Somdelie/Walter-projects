"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const stats = [
  { number: 500, suffix: "+", label: "Projects Completed" },
  { number: 25, suffix: "+", label: "Years Experience" },
  { number: 1000, suffix: "+", label: "Happy Customers" },
  { number: 99, suffix: "%", label: "Customer Satisfaction" },
]

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("stats-section")
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats-section" className="py-10 bg-orange-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold mb-2"
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                >
                  {isVisible ? stat.number : 0}
                </motion.span>
                {stat.suffix}
              </motion.div>
              <div className="text-blue-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
