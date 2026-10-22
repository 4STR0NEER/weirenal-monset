/**
 * Adapted from VengeanceUI "animated-number", MIT, https://github.com/Ashutoshx7/VengeanceUI
 * Changes: JSX, motion/react, takes a formatted string (₱1,234 / 3 / 12) so separators stay
 * static wherever they sit, stronger ease-out, reduced motion, screen readers get the plain value.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const EASE_OUT = [0.23, 1, 0.32, 1]

export function AnimatedNumber({ value, className }) {
  const text = String(value)
  return (
    <span className={cn('inline-flex items-baseline tabular-nums', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="relative inline-flex">
        {/* key from the right so the ones digit stays the ones digit as the number grows */}
        {text.split('').map((ch, i) => <Place key={text.length - i} ch={ch} />)}
      </span>
    </span>
  )
}

function Place({ ch }) {
  const ref = useRef(null)
  const [height, setHeight] = useState(null)
  useLayoutEffect(() => setHeight(ref.current?.getBoundingClientRect().height || null), [])
  const isDigit = /\d/.test(ch)
  return (
    <span ref={ref} className="relative inline-block overflow-y-hidden" style={{ height: height ?? 'auto' }}>
      {isDigit ? <Strip digit={Number(ch)} height={height} /> : ch}
    </span>
  )
}

function Strip({ digit, height }) {
  const reduce = useReducedMotion()
  const prev = useRef(digit)
  const h = height ?? 40
  const from = (digit - prev.current) * h // roll in from where the old digit sat
  useEffect(() => { prev.current = digit }, [digit])
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={digit}
        className="relative flex flex-col items-center"
        initial={reduce ? { opacity: 0 } : { y: from }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        transition={{ duration: reduce ? 0.15 : 0.6, ease: EASE_OUT }}
      >
        <span className="absolute bottom-full flex flex-col items-center">
          {DIGITS.filter((d) => d < digit).map((d) => <span key={d}>{d}</span>)}
        </span>
        <span>{digit}</span>
        <span className="absolute top-full flex flex-col items-center">
          {DIGITS.filter((d) => d > digit).map((d) => <span key={d}>{d}</span>)}
        </span>
      </motion.span>
    </AnimatePresence>
  )
}
