'use client';

import { AtomImage, Flex, LogoYOU, Text } from '@atoms';

const MainLoader = () => {
  return (
    <Flex className="flex-col items-center gap-5">
      <Flex className="items-center justify-center gap-7">
        <AtomImage src="/svg/logo.svg" alt="Logo" variant="logo" priority />
        <LogoYOU />
      </Flex>
      <Text className="text-center text-[20px] font-medium italic text-[#2B2B2B]">
        Made by <b className="animate-pulse motion-reduce:animate-none">YOU</b>. Worn your way.
      </Text>
    </Flex>
  );
};

export { MainLoader };
