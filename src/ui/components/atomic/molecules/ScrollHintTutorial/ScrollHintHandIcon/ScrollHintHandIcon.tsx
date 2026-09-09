'use client';

import { motion } from 'motion/react';

import { cn } from '@utils';

type scrollHintHandIconPropsType = {
  className?: string;
};

const SWIPE_TRAVEL = 18;
const SWIPE_DURATION = 1.9;

const ScrollHintHandIcon = ({ className }: scrollHintHandIconPropsType) => {
  return (
    <motion.span
      aria-hidden
      className={cn('relative flex size-16 items-center justify-center', className)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [-SWIPE_TRAVEL / 2, SWIPE_TRAVEL / 2, -SWIPE_TRAVEL / 2] }}
        transition={{ duration: SWIPE_DURATION, ease: 'easeInOut', repeat: Infinity }}
      >
        <path
          d="M27.4 44.2V22.6a3.6 3.6 0 0 1 7.2 0v11.7l4.6 1a7.9 7.9 0 0 1 6.2 7.7v3.6a8.4 8.4 0 0 1-8.4 8.4h-6.4a8.4 8.4 0 0 1-7.1-3.9l-5.2-8.2a3.3 3.3 0 0 1 4.9-4.3l4.2 3.6Z"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.span>
  );
};

export { ScrollHintHandIcon, SWIPE_DURATION as SCROLL_HINT_SWIPE_DURATION };
