'use client';

import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'motion/react';

type LanguageOption = { label: string; value: string };

type LocalizationDropdownProps = {
  languages: LanguageOption[];
  current: string;
  onSelect: (value: string) => void;
};

const EASE_DROPDOWN: [number, number, number, number] = [0.7, 0, 0.2, 1];
const EASE_ITEM_X: [number, number, number, number] = [0.075, 0.82, 0.165, 1];
const EASE_ITEM_O: [number, number, number, number] = [0.19, 1, 0.22, 1];

const LocalizationDropdown = ({ languages, current, onSelect }: LocalizationDropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isFinePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
  const onEnter = () => {
    if (isFinePointer()) setOpen(true);
  };
  const onLeave = () => {
    if (isFinePointer()) setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        data-open={open || undefined}
        className="group relative z-20 flex h-12 cursor-pointer items-center overflow-hidden rounded-full border border-[rgb(23_23_23/0.1)] px-5 font-medium text-[#171717]"
        style={{
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(0.875rem, 0.748rem + 0.3174vw, 1.125rem)',
        }}
      >
        <span className="relative z-10 flex items-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] group-hover:translate-y-[-10%] group-hover:scale-[0.6] group-hover:opacity-0 group-data-open:translate-y-[-10%] group-data-open:scale-[0.6] group-data-open:opacity-0">
          {current}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 z-0 flex origin-center translate-y-full scale-[0.6] items-center justify-center rounded-full bg-[#171717] px-5 text-white transition-transform duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] group-hover:translate-y-0 group-hover:scale-100 group-data-open:translate-y-0 group-data-open:scale-100"
        >
          {current}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="loc-dropdown"
            initial={{ opacity: 0, visibility: 'hidden' }}
            animate={{ opacity: 1, visibility: 'visible', transition: { duration: 0.6, ease: EASE_DROPDOWN, delay: 0.2 } }}
            exit={{ opacity: 0, visibility: 'hidden', transition: { duration: 0.3, ease: EASE_DROPDOWN } }}
            className="absolute left-0 top-full z-10 -ml-8 mt-3.5 w-max min-w-62.5 overflow-clip"
          >
            <motion.div
              initial={{ y: '-105%' }}
              animate={{ y: 0, transition: { duration: 0.6, ease: EASE_DROPDOWN } }}
              exit={{ y: '-105%', transition: { duration: 0.6, ease: EASE_DROPDOWN } }}
              className="overflow-hidden rounded-b-[clamp(1rem,1.052vw,1.25rem)] bg-white pb-10 pt-6"
              style={{ boxShadow: '0 16px 34px -10px rgba(0,0,0,.16)' }}
            >
              <ul className="flex max-h-62.5 max-w-70 flex-col gap-1.5 overflow-x-clip overflow-y-auto xl:gap-2" role="listbox">
                {languages.map((lang, i) => {
                  const isActive = lang.label === current;
                  return (
                    <motion.li
                      key={lang.value}
                      className="px-8"
                      initial={{ x: '20%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        x: { duration: 1, ease: EASE_ITEM_X, delay: 0.3 + i * 0.1 },
                        opacity: { duration: 1, ease: EASE_ITEM_O, delay: 0.3 + i * 0.1 },
                      }}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        aria-current={isActive ? 'true' : undefined}
                        onClick={() => {
                          setOpen(false);
                          onSelect(lang.value);
                        }}
                        className={`reversed-link block cursor-pointer whitespace-nowrap text-base leading-normal text-[#171717] ${
                          isActive ? 'pointer-events-none opacity-40' : ''
                        }`}
                        style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
                      >
                        {lang.label}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { LocalizationDropdown };
