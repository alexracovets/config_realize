const garmentTestoMapFragment = /* glsl */ `
  vec2 testoStampUv0 = garmentTestoToStampUv( vPrintUv, uTestoAnchorUv[0], uTestoRotation[0], uTestoPlacementRotation[0], uTestoUploadRotation[0], uTestoPartRotation[0], uTestoScale[0], uTestoLineHeight[0] );
  vec2 testoStampUv1 = garmentTestoToStampUv( vPrintUv, uTestoAnchorUv[1], uTestoRotation[1], uTestoPlacementRotation[1], uTestoUploadRotation[1], uTestoPartRotation[1], uTestoScale[1], uTestoLineHeight[1] );
  vec2 testoStampUv2 = garmentTestoToStampUv( vPrintUv, uTestoAnchorUv[2], uTestoRotation[2], uTestoPlacementRotation[2], uTestoUploadRotation[2], uTestoPartRotation[2], uTestoScale[2], uTestoLineHeight[2] );
  vec2 testoStampUv3 = garmentTestoToStampUv( vPrintUv, uTestoAnchorUv[3], uTestoRotation[3], uTestoPlacementRotation[3], uTestoUploadRotation[3], uTestoPartRotation[3], uTestoScale[3], uTestoLineHeight[3] );

  vec4 testoFillMasks = vec4(
    garmentNameSampleFillChannel( uTestoMask, testoStampUv0, 0.0 ),
    garmentNameSampleFillChannel( uTestoMask, testoStampUv1, 1.0 ),
    garmentNameSampleFillChannel( uTestoMask, testoStampUv2, 2.0 ),
    garmentNameSampleFillChannel( uTestoMask, testoStampUv3, 3.0 )
  );
  vec4 testoStrokeMasks = vec4(
    garmentNameSampleStrokeChannel( uTestoMask, testoStampUv0, 0.0 ),
    garmentNameSampleStrokeChannel( uTestoMask, testoStampUv1, 1.0 ),
    garmentNameSampleStrokeChannel( uTestoMask, testoStampUv2, 2.0 ),
    garmentNameSampleStrokeChannel( uTestoMask, testoStampUv3, 3.0 )
  );
  float testoInside0 = garmentNameInsidePart( vPrintUv, uTestoPartBounds[0] ) * uTestoSlotActive[0];
  float testoInside1 = garmentNameInsidePart( vPrintUv, uTestoPartBounds[1] ) * uTestoSlotActive[1];
  float testoInside2 = garmentNameInsidePart( vPrintUv, uTestoPartBounds[2] ) * uTestoSlotActive[2];
  float testoInside3 = garmentNameInsidePart( vPrintUv, uTestoPartBounds[3] ) * uTestoSlotActive[3];

  vec4 slotTesto0 = vec4( 0.0 );
  slotTesto0 = garmentCompositeNameLayer( slotTesto0, uTestoStrokeColors[0], testoStrokeMasks.r * testoInside0 );
  slotTesto0 = garmentCompositeNameLayer( slotTesto0, uTestoTextColors[0], testoFillMasks.r * testoInside0 );
  printColor = garmentCompositeUiLayer( printColor, slotTesto0 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uTestoAnchorUv[0], uTestoScale[0], uTestoGizmoHalf[0], uGizmoRotation, uTestoPartRotation[0], uTestoGizmoEnabled * uTestoGizmoFrameActive[0], testoInside0 ) );

  vec4 slotTesto1 = vec4( 0.0 );
  slotTesto1 = garmentCompositeNameLayer( slotTesto1, uTestoStrokeColors[1], testoStrokeMasks.g * testoInside1 );
  slotTesto1 = garmentCompositeNameLayer( slotTesto1, uTestoTextColors[1], testoFillMasks.g * testoInside1 );
  printColor = garmentCompositeUiLayer( printColor, slotTesto1 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uTestoAnchorUv[1], uTestoScale[1], uTestoGizmoHalf[1], uGizmoRotation, uTestoPartRotation[1], uTestoGizmoEnabled * uTestoGizmoFrameActive[1], testoInside1 ) );

  vec4 slotTesto2 = vec4( 0.0 );
  slotTesto2 = garmentCompositeNameLayer( slotTesto2, uTestoStrokeColors[2], testoStrokeMasks.b * testoInside2 );
  slotTesto2 = garmentCompositeNameLayer( slotTesto2, uTestoTextColors[2], testoFillMasks.b * testoInside2 );
  printColor = garmentCompositeUiLayer( printColor, slotTesto2 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uTestoAnchorUv[2], uTestoScale[2], uTestoGizmoHalf[2], uGizmoRotation, uTestoPartRotation[2], uTestoGizmoEnabled * uTestoGizmoFrameActive[2], testoInside2 ) );

  vec4 slotTesto3 = vec4( 0.0 );
  slotTesto3 = garmentCompositeNameLayer( slotTesto3, uTestoStrokeColors[3], testoStrokeMasks.a * testoInside3 );
  slotTesto3 = garmentCompositeNameLayer( slotTesto3, uTestoTextColors[3], testoFillMasks.a * testoInside3 );
  printColor = garmentCompositeUiLayer( printColor, slotTesto3 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uTestoAnchorUv[3], uTestoScale[3], uTestoGizmoHalf[3], uGizmoRotation, uTestoPartRotation[3], uTestoGizmoEnabled * uTestoGizmoFrameActive[3], testoInside3 ) );

  vec4 testoBtn0 = garmentGizmoButtons( vPrintUv, uTestoAnchorUv[0], uTestoScale[0], uTestoGizmoHalf[0], uGizmoRotation, uTestoPartRotation[0], uTestoGizmoEnabled * uTestoGizmoButtonsActive[0], uTestoGizmoButtonsReveal[0], testoInside0, uNameGizmoIcons, 0.0 );
  vec4 testoBtn1 = garmentGizmoButtons( vPrintUv, uTestoAnchorUv[1], uTestoScale[1], uTestoGizmoHalf[1], uGizmoRotation, uTestoPartRotation[1], uTestoGizmoEnabled * uTestoGizmoButtonsActive[1], uTestoGizmoButtonsReveal[1], testoInside1, uNameGizmoIcons, 1.0 );
  vec4 testoBtn2 = garmentGizmoButtons( vPrintUv, uTestoAnchorUv[2], uTestoScale[2], uTestoGizmoHalf[2], uGizmoRotation, uTestoPartRotation[2], uTestoGizmoEnabled * uTestoGizmoButtonsActive[2], uTestoGizmoButtonsReveal[2], testoInside2, uNameGizmoIcons, 2.0 );
  vec4 testoBtn3 = garmentGizmoButtons( vPrintUv, uTestoAnchorUv[3], uTestoScale[3], uTestoGizmoHalf[3], uGizmoRotation, uTestoPartRotation[3], uTestoGizmoEnabled * uTestoGizmoButtonsActive[3], uTestoGizmoButtonsReveal[3], testoInside3, uNameGizmoIcons, 3.0 );

  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, testoBtn0 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, testoBtn1 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, testoBtn2 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, testoBtn3 );
`;

export { garmentTestoMapFragment };
