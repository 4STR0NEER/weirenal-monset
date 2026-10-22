/**
 * Adapted from VengeanceUI "faq-accordion", MIT, https://github.com/Ashutoshx7/VengeanceUI
 * Changes: JSX, clinic tokens, one drawn icon instead of +/- glyphs and a chevron, no thick
 * left borders, aria-controls wiring, ease-out timing, reduced motion.
 */
import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FaqAccordion({ items, className }) {
  const [active, setActive] = useState(null)
  const id = useId()

  return (
    <ul className={cn('m-0 flex list-none flex-col p-0', className)}>
      {items.map((item, i) => {
        const open = active === i
        return (
          <li key={item.question} className="border-b border-(--line) last:border-b-0">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${id}-${i}`}
                onClick={() => setActive(open ? null : i)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-lg font-medium text-(--ink)',
                  'rounded-md outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-(--brand)/40 hover:text-(--brand-strong)',
                )}
              >
                {item.question}
                <span className={cn('grid size-8 shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-200 ease-(--ease-out) motion-reduce:transition-none',
                  open ? 'rotate-45 bg-(--brand) text-white' : 'bg-(--brand-soft) text-(--brand-strong)')}>
                  <Plus aria-hidden className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-${i}`}
              role="region"
              className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-(--ease-out) motion-reduce:transition-none',
                open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
            >
              <div className="overflow-hidden">
                <p className="m-0 max-w-[65ch] pb-6 text-base leading-relaxed text-(--ink-2)">{item.answer}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
