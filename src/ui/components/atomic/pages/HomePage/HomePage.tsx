'use client';

import Link from 'next/link';

import { Container, Text } from '@atoms';
import { useAppNavigate } from '@hooks';
import type { homePagePropsType } from '@types';
import { buildCollectionPath } from '@utils';

const HomePage = ({ collections }: homePagePropsType) => {
  const { toAppPath } = useAppNavigate();

  return (
    <Container className="flex flex-col gap-8 py-12">
      <Text variant="h2">Collezioni</Text>
      <nav className="flex flex-col gap-4">
        {collections.map(({ id, title, handle }) => (
          <Link
            key={id}
            href={toAppPath(buildCollectionPath(handle))}
            className="text-[24px] font-semibold text-base-black underline-offset-4 transition-colors hover:text-active hover:underline"
          >
            {title}
          </Link>
        ))}
      </nav>
    </Container>
  );
};

export { HomePage };
