import type { modalInfoTabType } from '@types';

import discountsContentData from './discountsContent.json';
import faqContentData from './faqContent.json';
import measureContentData from './measureContent.json';
import reviewsContentData from './reviewsContent.json';
import shippingContentData from './shippingContent.json';

const faqContent = faqContentData as modalInfoTabType;
const measureContent = measureContentData as modalInfoTabType;
const discountsContent = discountsContentData as modalInfoTabType;
const shippingContent = shippingContentData as modalInfoTabType;
const reviewsContent = reviewsContentData as modalInfoTabType;

export { discountsContent, faqContent, measureContent, reviewsContent, shippingContent };
