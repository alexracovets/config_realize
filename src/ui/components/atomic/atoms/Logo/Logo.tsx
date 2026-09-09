'use client';

import Link from 'next/link';

import { AtomImage, Flex } from '@atoms';
import { useMagnet } from '@hooks';
import type { logoPropsType } from '@types';

const Logo = ({ href = '/', onNavigate }: logoPropsType) => {
  const ref = useMagnet<HTMLAnchorElement>(6);

  return (
    <Flex variant="full_width">
      <Link ref={ref} href={href} onClick={onNavigate ? (event) => { event.preventDefault(); onNavigate(); } : undefined}>
        <AtomImage src="/svg/logo_full.svg" alt="Logo" variant="logo_full" priority />
      </Link>
    </Flex>
  );
};

export { Logo };
