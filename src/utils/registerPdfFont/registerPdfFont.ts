import { Font } from '@react-pdf/renderer';

const PDF_FONT_FAMILY = 'Inter';

let isRegistered = false;

const registerPdfFont = () => {
  if (isRegistered) return;
  isRegistered = true;

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZg.ttf', fontWeight: 700 },
    ],
  });
};

export { PDF_FONT_FAMILY, registerPdfFont };
