import { garmentLogoMapFragment, garmentNameMapFragment, garmentNumberMapFragment, garmentTestoMapFragment } from '@configurator/shaders';
const garmentPrintMapFragment =  `
#ifdef USE_PRINT
  vec4 printColor = vec4( 0.0 );
  garmentGizmoUiColor = vec4( 0.0 );

  float mask0 = texture2D( uPatternMask0, vPrintUv ).a;
  float mask1 = texture2D( uPatternMask1, vPrintUv ).a;

  // The colour_1 artwork is drawn slightly larger than colour_2 and tucks in under
  // it, so compositing layer1 over layer0 by its raw alpha lets that hidden margin
  // leak out along layer1's edge as a rim. Layer0 gives up exactly the coverage
  // layer1 already provides, which cancels the margin without thresholding either
  // mask, so antialiased edges stay soft and neither shape loses its shape.
  float rim = max( mask0 - mask1, 0.0 );

  // Colour_1 keeps the coverage it owns outright, but along layer1's edge the
  // margin is folded into layer1 instead of tinting it, so the transition runs
  // straight from colour_2 to the fabric with no lighter seam in between.
  float coverage = max( mask0, mask1 );
  float blend1 = mask1 / max( rim + mask1, 0.001 );

  printColor = vec4( mix( uPatternColor0, uPatternColor1, blend1 ), min( coverage, 1.0 ) * uPatternOpacity );

#ifdef USE_GARMENT_LOGO
${garmentLogoMapFragment}
#endif

#ifdef USE_GARMENT_NAME
${garmentNameMapFragment}
#endif

#ifdef USE_GARMENT_TESTO
${garmentTestoMapFragment}
#endif

#ifdef USE_GARMENT_NUMBER
${garmentNumberMapFragment}
#endif

  vec4 defaultDesign = texture2D( uDefaultLogos, vPrintUv );
  defaultDesign.a = step( 0.5, defaultDesign.a );
  garmentPrintColor = printColor;
  garmentPrintColor.rgb = defaultDesign.rgb * defaultDesign.a + garmentPrintColor.rgb * ( 1.0 - defaultDesign.a );
  garmentPrintColor.a = defaultDesign.a + garmentPrintColor.a * ( 1.0 - defaultDesign.a );
#endif
`;

const garmentPbrShadeCaptureFragment =  `
#ifdef USE_PRINT

  float diffuseLuma = max( max( totalDiffuse.r, totalDiffuse.g ), totalDiffuse.b );
  #ifdef USE_GRADIENT
  vec3 shadeAlbedo = garmentBaseAlbedo;
  #else
  vec3 shadeAlbedo = diffuseColor.rgb;
  #endif
  float albedoLuma = max( max( shadeAlbedo.r, shadeAlbedo.g ), shadeAlbedo.b );
  garmentPbrShade = clamp( diffuseLuma / max( albedoLuma, 0.001 ), 0.42, 1.0 );
#endif
`;

const garmentPrintLightsFragment =  `
#ifdef USE_PRINT
  vec3 flatBase = diffuseColor.rgb;
  vec3 flatComposite = garmentPrintColor.rgb * garmentPrintColor.a + flatBase * ( 1.0 - garmentPrintColor.a );
  gl_FragColor.rgb = flatComposite * garmentPbrShade;
  gl_FragColor.a = garmentPrintColor.a + gl_FragColor.a * ( 1.0 - garmentPrintColor.a );
#endif
`;

export { garmentPbrShadeCaptureFragment, garmentPrintLightsFragment, garmentPrintMapFragment };
