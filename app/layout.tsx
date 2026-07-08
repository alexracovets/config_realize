import '@configurator/bootstrap/clientConsoleSuppression';

import { Geist } from 'next/font/google';

import '@styles';

import { anton, bebasNeue, blackOpsOne, inter, oswald, russoOne } from '@fonts';
import { EmbeddedProvider } from '@providers';
import type { childrenType } from '@types';

import { cn } from '@utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const RootLayout = ({ children }: childrenType) => {
  return (
    <html
      lang="en"
      className={cn(
        'min-h-full',
        'antialiased',
        'bg-white',
        inter.variable,
        'font-sans',
        geist.variable,
        oswald.variable,
        bebasNeue.variable,
        anton.variable,
        russoOne.variable,
        blackOpsOne.variable,
      )}
    >
      <body className="min-h-full">
        <EmbeddedProvider>{children}</EmbeddedProvider>
      </body>
    </html>
  );
};

export default RootLayout;
