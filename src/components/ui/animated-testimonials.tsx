"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export interface Testimonial {
  quote: string
  name: string
  designation: string
  src: string
}

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[]
  autoplay?: boolean
  className?: string
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: AnimatedTestimonialsProps) => {
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNext = () => {
    setActive(prev => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setActive(prev => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const isActive = (index: number) => {
    return index === active
  }

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000)
      return () => clearInterval(interval)
    }
  }, [autoplay])

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          "mx-auto max-w-sm px-4 py-20 md:max-w-4xl md:px-8 lg:px-12 h-96 bg-muted/20 animate-pulse rounded-xl",
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12",
        className,
      )}
    >
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index) ? 40 : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  className="absolute inset-0 origin-bottom"
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  key={testimonial.src}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    alt={testimonial.name}
                    className="h-full w-full rounded-3xl object-cover object-center"
                    draggable={false}
                    height={500}
                    src={testimonial.src}
                    width={500}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4">
          <motion.div
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            initial={{
              y: 20,
              opacity: 0,
            }}
            key={active}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold text-black dark:text-white">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              {testimonials[active].designation}
            </p>
            <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  className="inline-block"
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  key={index}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              type="button"
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
            </button>
            <button
              type="button"
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 text-black transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo
const demoTestimonials: Testimonial[] = [
  {
    quote:
      "This product has completely transformed how we work. The attention to detail and user experience is unmatched.",
    name: "Sarah Chen",
    designation: "CTO at TechCorp",
    src: "https://i.pravatar.cc/500?img=1",
  },
  {
    quote:
      "I've never seen such a well-designed interface. It's intuitive and beautiful at the same time.",
    name: "Michael Roberts",
    designation: "Design Lead at Creative Co",
    src: "https://i.pravatar.cc/500?img=3",
  },
  {
    quote:
      "The best investment we've made this year. Our team productivity has increased significantly.",
    name: "Emily Watson",
    designation: "CEO at StartupXYZ",
    src: "https://i.pravatar.cc/500?img=5",
  },
]

export function Demo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <AnimatedTestimonials testimonials={demoTestimonials} autoplay />
    </div>
  )
}
