'use client';

import { FaPlay } from 'react-icons/fa';

import { MainLoaderBackground } from '../Loaders/MainLoader/MainLoaderBackground';
import { AtomImage, Flex, LogoYOU, Text } from '@atoms';

const VideoPlayerPlayIcon = () => (
  <span className="absolute top-1/2 left-1/2 z-20 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/60 bg-white/60 text-base-black transition-[background-color,border-color,opacity] duration-200 ease-in hover:border-white/90 hover:bg-white/90">
    <FaPlay className="size-5 fill-current pl-0.5" aria-hidden />
  </span>
);

const VideoPlayerPreview = () => (
  <div className="relative h-full w-full overflow-hidden">
    <MainLoaderBackground />
    <Flex className="absolute flex-col inset-0 z-10 items-center justify-center w-full gap-2">
      <Flex className="items-center justify-center gap-7">
        <AtomImage src="/svg/logo.svg" alt="Logo" variant="logo" priority />
        <LogoYOU />
      </Flex>
      <Text className="text-center text-[20px] font-medium italic text-[#2B2B2B]">Tutorial</Text>
    </Flex>
    <VideoPlayerPlayIcon />
  </div>
);

export { VideoPlayerPreview };
