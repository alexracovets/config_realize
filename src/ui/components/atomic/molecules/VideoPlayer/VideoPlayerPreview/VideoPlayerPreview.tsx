'use client';

import { AtomImage, Box, Flex, LogoYOU, Text } from '@atoms';
import { MainLoaderBackground } from '@molecules/Loaders/MainLoader/MainLoaderBackground';
import { FaPlay } from 'react-icons/fa';
const VideoPlayerPlayIcon = () => (
  <span className="absolute top-1/2 left-1/2 z-20 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/60 bg-white/60 text-base-black transition-[background-color,border-color,opacity] duration-200 ease-in hover:border-white/90 hover:bg-white/90">
    <FaPlay className="size-5 fill-current pl-0.5" aria-hidden />
  </span>
);

const VideoPlayerPreview = () => (
  <Box variant="video_preview_root">
    <MainLoaderBackground />
    <Flex variant="overlay_center_column">
      <Flex variant="logo_pair_row">
        <AtomImage src="/svg/logo.svg" alt="Logo" variant="logo" priority />
        <LogoYOU />
      </Flex>
      <Text variant="loader_tagline">Tutorial</Text>
    </Flex>
    <VideoPlayerPlayIcon />
  </Box>
);

export { VideoPlayerPreview };
