const garmentLogoMapFragment = /* glsl */ `
  float logoInside0 = garmentNameInsidePart( vPrintUv, uLogoPartBounds[0] ) * uLogoSlotActive[0];
  float logoInside1 = garmentNameInsidePart( vPrintUv, uLogoPartBounds[1] ) * uLogoSlotActive[1];
  float logoInside2 = garmentNameInsidePart( vPrintUv, uLogoPartBounds[2] ) * uLogoSlotActive[2];
  float logoInside3 = garmentNameInsidePart( vPrintUv, uLogoPartBounds[3] ) * uLogoSlotActive[3];

  vec2 logoStampUv0 = garmentLogoToStampUv( vPrintUv, uLogoAnchorUv[0], uLogoRotation[0], uLogoUploadRotation[0], uLogoPartRotation[0], uLogoScale[0] );
  vec2 logoStampUv1 = garmentLogoToStampUv( vPrintUv, uLogoAnchorUv[1], uLogoRotation[1], uLogoUploadRotation[1], uLogoPartRotation[1], uLogoScale[1] );
  vec2 logoStampUv2 = garmentLogoToStampUv( vPrintUv, uLogoAnchorUv[2], uLogoRotation[2], uLogoUploadRotation[2], uLogoPartRotation[2], uLogoScale[2] );
  vec2 logoStampUv3 = garmentLogoToStampUv( vPrintUv, uLogoAnchorUv[3], uLogoRotation[3], uLogoUploadRotation[3], uLogoPartRotation[3], uLogoScale[3] );

  float logoInsideStamp0 = garmentNameInsideStamp( logoStampUv0 );
  float logoInsideStamp1 = garmentNameInsideStamp( logoStampUv1 );
  float logoInsideStamp2 = garmentNameInsideStamp( logoStampUv2 );
  float logoInsideStamp3 = garmentNameInsideStamp( logoStampUv3 );

  vec4 logo0 = texture2D( uLogoStamp, garmentLogoStampAtlasUv( logoStampUv0, 0.0 ) );
  vec4 logo1 = texture2D( uLogoStamp, garmentLogoStampAtlasUv( logoStampUv1, 1.0 ) );
  vec4 logo2 = texture2D( uLogoStamp, garmentLogoStampAtlasUv( logoStampUv2, 2.0 ) );
  vec4 logo3 = texture2D( uLogoStamp, garmentLogoStampAtlasUv( logoStampUv3, 3.0 ) );

  logo0.a *= logoInside0 * logoInsideStamp0;
  logo1.a *= logoInside1 * logoInsideStamp1;
  logo2.a *= logoInside2 * logoInsideStamp2;
  logo3.a *= logoInside3 * logoInsideStamp3;

  printColor = garmentCompositeUiLayer( printColor, logo0 );
  printColor = garmentCompositeUiLayer( printColor, logo1 );
  printColor = garmentCompositeUiLayer( printColor, logo2 );
  printColor = garmentCompositeUiLayer( printColor, logo3 );

  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uLogoAnchorUv[0], uLogoScale[0], uLogoGizmoHalf[0], uGizmoRotation, uLogoPartRotation[0], uLogoGizmoEnabled * uLogoGizmoFrameActive[0], logoInside0 ) );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uLogoAnchorUv[1], uLogoScale[1], uLogoGizmoHalf[1], uGizmoRotation, uLogoPartRotation[1], uLogoGizmoEnabled * uLogoGizmoFrameActive[1], logoInside1 ) );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uLogoAnchorUv[2], uLogoScale[2], uLogoGizmoHalf[2], uGizmoRotation, uLogoPartRotation[2], uLogoGizmoEnabled * uLogoGizmoFrameActive[2], logoInside2 ) );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uLogoAnchorUv[3], uLogoScale[3], uLogoGizmoHalf[3], uGizmoRotation, uLogoPartRotation[3], uLogoGizmoEnabled * uLogoGizmoFrameActive[3], logoInside3 ) );

  vec4 logoGizmoUi = vec4( 0.0 );
  vec4 logoBtn0 = garmentGizmoButtons( vPrintUv, uLogoAnchorUv[0], uLogoScale[0], uLogoGizmoHalf[0], uGizmoRotation, uLogoPartRotation[0], uLogoGizmoEnabled * uLogoGizmoButtonsActive[0], uLogoGizmoButtonsReveal[0], logoInside0, uNameGizmoIcons, 0.0 );
  vec4 logoBtn1 = garmentGizmoButtons( vPrintUv, uLogoAnchorUv[1], uLogoScale[1], uLogoGizmoHalf[1], uGizmoRotation, uLogoPartRotation[1], uLogoGizmoEnabled * uLogoGizmoButtonsActive[1], uLogoGizmoButtonsReveal[1], logoInside1, uNameGizmoIcons, 1.0 );
  vec4 logoBtn2 = garmentGizmoButtons( vPrintUv, uLogoAnchorUv[2], uLogoScale[2], uLogoGizmoHalf[2], uGizmoRotation, uLogoPartRotation[2], uLogoGizmoEnabled * uLogoGizmoButtonsActive[2], uLogoGizmoButtonsReveal[2], logoInside2, uNameGizmoIcons, 2.0 );
  vec4 logoBtn3 = garmentGizmoButtons( vPrintUv, uLogoAnchorUv[3], uLogoScale[3], uLogoGizmoHalf[3], uGizmoRotation, uLogoPartRotation[3], uLogoGizmoEnabled * uLogoGizmoButtonsActive[3], uLogoGizmoButtonsReveal[3], logoInside3, uNameGizmoIcons, 3.0 );

  logoGizmoUi = garmentCompositeUiLayer( logoGizmoUi, logoBtn0 );
  logoGizmoUi = garmentCompositeUiLayer( logoGizmoUi, logoBtn1 );
  logoGizmoUi = garmentCompositeUiLayer( logoGizmoUi, logoBtn2 );
  logoGizmoUi = garmentCompositeUiLayer( logoGizmoUi, logoBtn3 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, logoGizmoUi );
`;

export { garmentLogoMapFragment };
