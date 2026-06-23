'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AtomImage, Flex } from '@atoms';
import { useConfigurationCart } from '@store';

const Logo = () => {
  const pathname = usePathname();
  const activeSlug = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId)?.slug ?? state.items[0]?.slug);

  const isOnConfigurator = pathname !== '/' && pathname !== '/checkout';
  const href = isOnConfigurator || !activeSlug ? '/' : `/${activeSlug}`;

  return (
    <Flex className="w-full">
      <Link href={href}>
        <AtomImage src="/svg/logo_full.svg" alt="Logo" variant="logo_full" priority />
      </Link>
    </Flex>
  );
};

export { Logo };
