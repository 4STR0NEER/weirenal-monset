/**
 * Adapted from Kokonut UI "cart-button" (AddToCartButton), MIT, https://kokonutui.com
 * Changes: JSX, clinic tokens instead of zinc, POS add-on wording, demo cart removed.
 */
import { Minus, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const EASE_OUT = [0.23, 1, 0.32, 1]
const WIDTH_CLOSED = 80
const WIDTH_OPEN = 108
const HOLD_DELAY = 380
const REPEAT_FIRST = 150
const REPEAT_FASTEST = 55
const LIMIT_FOR = 1600

/**
 * "Add +" that opens into a "− n +" stepper in place. The + never moves, so a second
 * tap lands where the first did. At one, − turns into a bin; holding + or − repeats.
 */
export function QuantityStepper({ quantity, max = 9, name = 'item', label = 'Add', onQuantityChange, className }) {
  const [direction, setDirection] = useState(1)
  const [limitHits, setLimitHits] = useState(0)
  const [showLimit, setShowLimit] = useState(false)
  const reduceMotion = Boolean(useReducedMotion())

  const valueRef = useRef(quantity)
  valueRef.current = quantity
  const holdRef = useRef()
  const limitRef = useRef()
  const addRef = useRef(null)
  const plusRef = useRef(null)
  const focusNext = useRef(null)
  const open = quantity > 0

  const commit = useCallback((next) => {
    const clamped = Math.min(max, Math.max(0, next))
    if (clamped === valueRef.current) return
    setDirection(clamped > valueRef.current ? 1 : -1)
    valueRef.current = clamped
    onQuantityChange?.(clamped)
  }, [max, onQuantityChange])

  const hitLimit = useCallback(() => {
    setLimitHits((h) => h + 1)
    setShowLimit(true)
    clearTimeout(limitRef.current)
    limitRef.current = setTimeout(() => setShowLimit(false), LIMIT_FOR)
  }, [])

  const step = useCallback((delta) => {
    if (delta > 0 && valueRef.current >= max) {
      hitLimit()
      return false
    }
    if (delta < 0 && valueRef.current === 1) focusNext.current = 'add'
    commit(valueRef.current + delta)
    return true
  }, [commit, hitLimit, max])

  const stopHold = useCallback(() => clearTimeout(holdRef.current), [])

  const startHold = (delta) => (event) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    stopHold()
    if (!step(delta)) return
    let interval = REPEAT_FIRST
    const tick = () => {
      if (delta < 0 && valueRef.current <= 1) return // emptying the line takes its own tap
      if (!step(delta)) return
      interval = Math.max(REPEAT_FASTEST, interval * 0.82)
      holdRef.current = setTimeout(tick, interval)
    }
    holdRef.current = setTimeout(tick, HOLD_DELAY)
  }

  // Pointer presses step on pointerdown; Enter and Space arrive as a click with detail 0.
  const keyStep = (delta) => (event) => {
    if (event.detail === 0) step(delta)
  }

  const add = () => {
    focusNext.current = 'plus'
    setDirection(1)
    commit(1)
  }

  useEffect(() => {
    if (focusNext.current === 'plus' && quantity > 0) plusRef.current?.focus()
    if (focusNext.current === 'add' && quantity === 0) requestAnimationFrame(() => addRef.current?.focus())
    focusNext.current = null
    if (quantity === 0) clearTimeout(holdRef.current)
  }, [quantity])

  useEffect(() => () => {
    clearTimeout(holdRef.current)
    clearTimeout(limitRef.current)
  }, [])

  const atMax = quantity >= max
  const fade = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }
  const ring = 'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60'

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <AnimatePresence>
        {showLimit && (
          <motion.span
            role="status"
            className="pointer-events-none absolute right-0 bottom-full mb-2 whitespace-nowrap rounded-md bg-(--ink) px-2 py-1 text-[11px] font-medium text-white"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 2 }} transition={fade}
          >
            Up to {max} per session
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ width: open ? WIDTH_OPEN : WIDTH_CLOSED }}
        transition={{ ...fade, duration: reduceMotion ? 0 : 0.32 }}
        className={cn(
          'relative h-9 overflow-hidden rounded-full ring-1 transition-colors duration-200 motion-reduce:transition-none',
          open ? 'bg-(--brand) text-white ring-(--brand)' : 'bg-white text-(--brand-strong) ring-(--line-strong) hover:bg-(--brand-soft)',
        )}
      >
        <AnimatePresence initial={false}>
          {!open && (
            <motion.span
              key="label" aria-hidden
              className="pointer-events-none absolute inset-y-0 left-3.5 z-10 flex items-center text-sm font-medium"
              initial={{ opacity: 0, x: -6, filter: 'blur(2px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -6, filter: 'blur(2px)' }} transition={fade}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {open ? (
          <fieldset className="contents">
            <legend className="sr-only">{`Quantity of ${name}`}</legend>
            <motion.button
              type="button"
              aria-label={quantity === 1 ? `Remove ${name}` : `One less ${name}`}
              className={cn('absolute inset-y-0 left-0 flex w-9 items-center justify-center rounded-full transition-colors duration-150 hover:bg-white/15 active:bg-white/25', ring)}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={fade}
              onClick={keyStep(-1)} onPointerDown={startHold(-1)} onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold}
            >
              <MinusGlyph bin={quantity === 1} reduceMotion={reduceMotion} />
            </motion.button>

            <motion.output
              aria-live="polite"
              className="absolute inset-y-0 right-9 left-9 flex items-center justify-center overflow-hidden text-sm font-semibold tabular-nums"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={fade}
            >
              <span className="sr-only">{`${quantity} ${name}`}</span>
              <motion.span
                key={limitHits} aria-hidden className="flex"
                animate={limitHits > 0 && !reduceMotion ? { x: [0, -3, 3, -2, 2, 0] } : undefined}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <RollingText direction={direction} reduceMotion={reduceMotion} text={String(quantity)} />
              </motion.span>
            </motion.output>

            <button
              ref={plusRef} type="button" aria-disabled={atMax} aria-label={`One more ${name}`}
              className={cn('absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-full transition-colors duration-150', ring,
                atMax ? 'text-white/45' : 'hover:bg-white/15 active:bg-white/25')}
              onClick={keyStep(1)} onPointerDown={startHold(1)} onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold}
            >
              <Plus aria-hidden className="size-4" />
            </button>
          </fieldset>
        ) : (
          <button
            ref={addRef} type="button" onClick={add} aria-label={`${label} ${name}`}
            className="absolute inset-0 flex items-center justify-end rounded-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--brand)/40"
          >
            <span className="flex w-9 items-center justify-center"><Plus aria-hidden className="size-4" /></span>
          </button>
        )}
      </motion.div>
    </div>
  )
}

function MinusGlyph({ bin, reduceMotion }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={bin ? 'bin' : 'minus'} className="flex"
        initial={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.6, filter: 'blur(2px)' }} transition={reduceMotion ? { duration: 0 } : { duration: 0.16 }}
      >
        {bin ? <Trash2 aria-hidden className="size-3.5" /> : <Minus aria-hidden className="size-4" />}
      </motion.span>
    </AnimatePresence>
  )
}

/** Each character rolls on its own, keyed by its place from the right. */
function RollingText({ text, direction, reduceMotion }) {
  return (
    <span className="inline-flex overflow-hidden tabular-nums">
      {text.split('').map((char, i) => (
        <span key={text.length - i} className="relative inline-block">
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.span
              key={char} className="inline-block" custom={direction}
              variants={{ in: (d) => ({ y: d * 12, opacity: 0 }), out: (d) => ({ y: d * -12, opacity: 0 }) }}
              initial={reduceMotion ? { opacity: 0 } : 'in'} animate={{ y: 0, opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : 'out'}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: EASE_OUT }}
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
