"use client"

import React from "react"
import { motion } from "framer-motion"

interface AnimatedTextProps {
  text: string
  delayPerWord?: number
  initialDelay?: number
  className?: string
  wordClassName?: string
  animateWords?: boolean // New prop to control if we animate words or characters
}

export function AnimatedText({
  text,
  delayPerWord = 0.08, // Adjusted default for words
  initialDelay = 0,
  className,
  wordClassName,
  animateWords = true, // Default to animating words
}: AnimatedTextProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delayPerWord,
        delayChildren: initialDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  const content = animateWords
    ? text.split(" ").map((word, i) => (
        <motion.span key={i} variants={itemVariants} className={`inline-block ${wordClassName || ""}`}>
          {word}
          {i < text.split(" ").length - 1 && " "} {/* Add space back between words */}
        </motion.span>
      ))
    : text.split("").map((char, i) => (
        <motion.span key={i} variants={itemVariants} className={`inline-block ${wordClassName || ""}`}>
          {char}
        </motion.span>
      ))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className={className}>
      {content}
    </motion.div>
  )
}
