'use client';

import { BsPercent } from 'react-icons/bs';
import { PiChatCenteredDotsLight, PiStarLight, PiTruckLight } from 'react-icons/pi';

import { discountsContent, faqContent, measureContent, reviewsContent, shippingContent } from '@data';
import { SvgIcon } from '@atoms';
import type { modalInfoTabConfigType } from '@types';

const SIZE_CHART_TAB_VALUE = 'info';

const MODAL_INFO_TABS: modalInfoTabConfigType[] = [
  {
    value: 'faq',
    label: 'FAQ',
    icon: <PiChatCenteredDotsLight />,
    tab: faqContent,
  },
  {
    value: SIZE_CHART_TAB_VALUE,
    label: 'Tabella taglie',
    icon: <SvgIcon name="ruler" />,
    tab: measureContent,
  },
  {
    value: 'discounts',
    label: 'Scontistiche',
    icon: <BsPercent />,
    tab: discountsContent,
  },
  {
    value: 'shipping',
    label: 'Spedizione',
    icon: <PiTruckLight />,
    tab: shippingContent,
  },
  {
    value: 'reviews',
    label: 'Recensioni',
    icon: <PiStarLight />,
    tab: reviewsContent,
  },
];

export { MODAL_INFO_TABS, SIZE_CHART_TAB_VALUE };
