'use client';

const iconClass = 'size-6 shrink-0 text-primary-10';

const SearchGlyph = () => (
  <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" d="m21 21-3.636-3.636m0 0A9 9 0 1 0 4.636 4.636a9 9 0 0 0 12.728 12.728Z" />
  </svg>
);

const AccountGlyph = () => (
  <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="10.5" height="10.5" x="6.75" y="1.75" rx="5.25" />
    <path strokeLinecap="round" d="M12 15.5c1.5 0 4 .333 4.5.5.5.167 3.7.8 4.5 2 1 1.5 1 2 1 4m-10-6.5c-1.5 0-4 .333-4.5.5-.5.167-3.7.8-4.5 2-1 1.5-1 2-1 4" />
  </svg>
);

const CartGlyph = () => (
  <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeMiterlimit={10}
      d="M7.70023 9.14V6.36C7.70023 3.81 9.76023 1.75 12.3002 1.75C14.8402 1.75 16.9102 3.81 16.9102 6.36V9.14M21.8502 19.59L21.1902 9.15C21.1102 7.89 20.0502 6.91 18.7702 6.91H5.83023C4.55023 6.91 3.49023 7.89 3.41023 9.15L2.75023 19.59C2.66023 20.96 3.77023 22.13 5.17023 22.13H19.4402C20.8402 22.13 21.9402 20.97 21.8602 19.59H21.8502Z"
    />
  </svg>
);

const HamburgerGlyph = () => (
  <svg className={iconClass} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" d="M3 6H21M3 12H11M3 18H16" />
  </svg>
);

const LanguageGlyph = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 18 18" stroke="currentColor" strokeWidth={1} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.46661 13.6167L3.44161 13.025C3.53831 12.9654 3.61815 12.882 3.67358 12.7829C3.729 12.6837 3.75816 12.572 3.75828 12.4584L3.77495 9.45005C3.77628 9.32533 3.81392 9.20371 3.88328 9.10005L5.53328 6.50838C5.58279 6.43181 5.64731 6.36607 5.72293 6.31512C5.79855 6.26416 5.88371 6.22906 5.97327 6.21193C6.06283 6.1948 6.15493 6.19599 6.24402 6.21543C6.33311 6.23487 6.41733 6.27216 6.49161 6.32505L8.12495 7.50838C8.26587 7.60663 8.4374 7.65099 8.60828 7.63338L11.2333 7.27505C11.3925 7.25312 11.538 7.17296 11.6416 7.05005L13.4916 4.91672C13.6013 4.78667 13.6579 4.62 13.6499 4.45005L13.5583 2.42505"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.925 15.3083L13.025 14.4083C12.9418 14.3251 12.8384 14.2648 12.725 14.2333L10.9334 13.7666C10.776 13.7235 10.6399 13.6243 10.5508 13.4876C10.4617 13.3509 10.4259 13.1863 10.45 13.025L10.6417 11.675C10.6607 11.5614 10.7081 11.4545 10.7795 11.3642C10.8509 11.2739 10.944 11.203 11.05 11.1583L13.5834 10.1C13.701 10.0509 13.8303 10.0366 13.9558 10.0587C14.0814 10.0809 14.1979 10.1386 14.2917 10.225L16.3667 12.125"
    />
  </svg>
);

const ChevronDownGlyph = ({ className = 'size-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9L12 15L18 9" />
  </svg>
);

export { AccountGlyph, CartGlyph, ChevronDownGlyph, HamburgerGlyph, LanguageGlyph, SearchGlyph };
