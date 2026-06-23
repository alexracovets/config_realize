'use client';

import { useMemo } from 'react';

import { AtomDialog, AtomDialogContent, AtomDialogTitle } from '@atoms';
import { VideoPlayer, VideoPlayerPreview } from '@molecules';

import { TUTORIAL_VIDEO_URL } from '@constants';
import { useTutorialDialog } from '@store';

const ModalTutorial = () => {
  const isOpen = useTutorialDialog((state) => state.isOpen);
  const setIsOpen = useTutorialDialog((state) => state.setIsOpen);
  const tutorialPoster = useMemo(() => <VideoPlayerPreview />, []);

  return (
    <AtomDialog open={isOpen} onOpenChange={setIsOpen}>
      <AtomDialogContent aria-describedby={undefined} aria-label="Tutorial" className="p-0 h-auto">
        <AtomDialogTitle visuallyHidden>Tutorial Dialog</AtomDialogTitle>
        {isOpen ? <VideoPlayer src={TUTORIAL_VIDEO_URL} variant="tutorial" className="w-full" poster={tutorialPoster} /> : null}
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { ModalTutorial };
