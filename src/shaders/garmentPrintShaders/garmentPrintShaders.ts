import { garmentLogoMapFragment } from '../garmentLogoShaders';
import { garmentNameMapFragment } from '../garmentNameShaders';
import { garmentNumberMapFragment } from '../garmentNumberShaders';
import { garmentTestoMapFragment } from '../garmentTestoShaders';

const garmentPrintMapFragment = /* glsl */ `
#ifdef USE_PRINT
  vec4 printColor = vec4( 0.0 );
  garmentGizmoUiColor = vec4( 0.0 );

  vec4 layer0 = vec4(
    uPatternColor0,
    texture2D( uPatternMask0, vPrintUv ).a * uPatternOpacity
  );
  printColor = layer0;

  vec4 layer1 = vec4(
    uPatternColor1,
    texture2D( uPatternMask1, vPrintUv ).a * uPatternOpacity
  );
  printColor.rgb = layer1.rgb * layer1.a + printColor.rgb * ( 1.0 - layer1.a );
  printColor.a = layer1.a + printColor.a * ( 1.0 - layer1.a );

${garmentLogoMapFragment}

${garmentNameMapFragment}

${garmentTestoMapFragment}

${garmentNumberMapFragment}

  vec4 defaultDesign = texture2D( uDefaultLogos, vPrintUv );
  defaultDesign.rgb *= uPatternColor0;
  defaultDesign.a = smoothstep( 0.4, 0.6, defaultDesign.a );
  garmentPrintColor = printColor;
  garmentPrintColor.rgb = defaultDesign.rgb * defaultDesign.a + garmentPrintColor.rgb * ( 1.0 - defaultDesign.a );
  garmentPrintColor.a = defaultDesign.a + garmentPrintColor.a * ( 1.0 - defaultDesign.a );
#endif
`;

const garmentPrintLightsFragment = /* glsl */ `
#ifdef USE_PRINT
  gl_FragColor.rgb = garmentPrintColor.rgb * garmentPrintColor.a + gl_FragColor.rgb * ( 1.0 - garmentPrintColor.a );
  gl_FragColor.a = garmentPrintColor.a + gl_FragColor.a * ( 1.0 - garmentPrintColor.a );
#endif
`;

export { garmentPrintLightsFragment, garmentPrintMapFragment };
