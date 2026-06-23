const garmentNameMapFragment = /* glsl */ `
  vec2 nameStampUv0 = garmentNameToStampUv( vPrintUv, uNameAnchorUv[0], uNameRotation[0], uNamePlacementRotation[0], uNameUploadRotation[0], uNamePartRotation[0], uNameScale[0] );
  vec2 nameStampUv1 = garmentNameToStampUv( vPrintUv, uNameAnchorUv[1], uNameRotation[1], uNamePlacementRotation[1], uNameUploadRotation[1], uNamePartRotation[1], uNameScale[1] );
  vec2 nameStampUv2 = garmentNameToStampUv( vPrintUv, uNameAnchorUv[2], uNameRotation[2], uNamePlacementRotation[2], uNameUploadRotation[2], uNamePartRotation[2], uNameScale[2] );
  vec2 nameStampUv3 = garmentNameToStampUv( vPrintUv, uNameAnchorUv[3], uNameRotation[3], uNamePlacementRotation[3], uNameUploadRotation[3], uNamePartRotation[3], uNameScale[3] );

  vec4 nameFillMasks = vec4(
    garmentNameSampleFillChannel( uNameMask, nameStampUv0, 0.0 ),
    garmentNameSampleFillChannel( uNameMask, nameStampUv1, 1.0 ),
    garmentNameSampleFillChannel( uNameMask, nameStampUv2, 2.0 ),
    garmentNameSampleFillChannel( uNameMask, nameStampUv3, 3.0 )
  );
  vec4 nameStrokeMasks = vec4(
    garmentNameSampleStrokeChannel( uNameMask, nameStampUv0, 0.0 ),
    garmentNameSampleStrokeChannel( uNameMask, nameStampUv1, 1.0 ),
    garmentNameSampleStrokeChannel( uNameMask, nameStampUv2, 2.0 ),
    garmentNameSampleStrokeChannel( uNameMask, nameStampUv3, 3.0 )
  );
  float nameInside0 = garmentNameInsidePart( vPrintUv, uNamePartBounds[0] ) * uNameSlotActive[0];
  float nameInside1 = garmentNameInsidePart( vPrintUv, uNamePartBounds[1] ) * uNameSlotActive[1];
  float nameInside2 = garmentNameInsidePart( vPrintUv, uNamePartBounds[2] ) * uNameSlotActive[2];
  float nameInside3 = garmentNameInsidePart( vPrintUv, uNamePartBounds[3] ) * uNameSlotActive[3];

  vec4 slotName0 = vec4( 0.0 );
  slotName0 = garmentCompositeNameLayer( slotName0, uNameStrokeColors[0], nameStrokeMasks.r * nameInside0 );
  slotName0 = garmentCompositeNameLayer( slotName0, uNameTextColors[0], nameFillMasks.r * nameInside0 );
  printColor = garmentCompositeUiLayer( printColor, slotName0 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uNameAnchorUv[0], uNameScale[0], uNameGizmoHalf[0], uGizmoRotation, uNamePartRotation[0], uNameGizmoEnabled * uNameGizmoFrameActive[0], nameInside0 ) );

  vec4 slotName1 = vec4( 0.0 );
  slotName1 = garmentCompositeNameLayer( slotName1, uNameStrokeColors[1], nameStrokeMasks.g * nameInside1 );
  slotName1 = garmentCompositeNameLayer( slotName1, uNameTextColors[1], nameFillMasks.g * nameInside1 );
  printColor = garmentCompositeUiLayer( printColor, slotName1 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uNameAnchorUv[1], uNameScale[1], uNameGizmoHalf[1], uGizmoRotation, uNamePartRotation[1], uNameGizmoEnabled * uNameGizmoFrameActive[1], nameInside1 ) );

  vec4 slotName2 = vec4( 0.0 );
  slotName2 = garmentCompositeNameLayer( slotName2, uNameStrokeColors[2], nameStrokeMasks.b * nameInside2 );
  slotName2 = garmentCompositeNameLayer( slotName2, uNameTextColors[2], nameFillMasks.b * nameInside2 );
  printColor = garmentCompositeUiLayer( printColor, slotName2 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uNameAnchorUv[2], uNameScale[2], uNameGizmoHalf[2], uGizmoRotation, uNamePartRotation[2], uNameGizmoEnabled * uNameGizmoFrameActive[2], nameInside2 ) );

  vec4 slotName3 = vec4( 0.0 );
  slotName3 = garmentCompositeNameLayer( slotName3, uNameStrokeColors[3], nameStrokeMasks.a * nameInside3 );
  slotName3 = garmentCompositeNameLayer( slotName3, uNameTextColors[3], nameFillMasks.a * nameInside3 );
  printColor = garmentCompositeUiLayer( printColor, slotName3 );
  printColor = garmentCompositeUiLayer( printColor, garmentGizmoFrameColor( vPrintUv, uNameAnchorUv[3], uNameScale[3], uNameGizmoHalf[3], uGizmoRotation, uNamePartRotation[3], uNameGizmoEnabled * uNameGizmoFrameActive[3], nameInside3 ) );

  vec4 gbtn0 = garmentGizmoButtons( vPrintUv, uNameAnchorUv[0], uNameScale[0], uNameGizmoHalf[0], uGizmoRotation, uNamePartRotation[0], uNameGizmoEnabled * uNameGizmoButtonsActive[0], uNameGizmoButtonsReveal[0], nameInside0, uNameGizmoIcons, 0.0 );
  vec4 gbtn1 = garmentGizmoButtons( vPrintUv, uNameAnchorUv[1], uNameScale[1], uNameGizmoHalf[1], uGizmoRotation, uNamePartRotation[1], uNameGizmoEnabled * uNameGizmoButtonsActive[1], uNameGizmoButtonsReveal[1], nameInside1, uNameGizmoIcons, 1.0 );
  vec4 gbtn2 = garmentGizmoButtons( vPrintUv, uNameAnchorUv[2], uNameScale[2], uNameGizmoHalf[2], uGizmoRotation, uNamePartRotation[2], uNameGizmoEnabled * uNameGizmoButtonsActive[2], uNameGizmoButtonsReveal[2], nameInside2, uNameGizmoIcons, 2.0 );
  vec4 gbtn3 = garmentGizmoButtons( vPrintUv, uNameAnchorUv[3], uNameScale[3], uNameGizmoHalf[3], uGizmoRotation, uNamePartRotation[3], uNameGizmoEnabled * uNameGizmoButtonsActive[3], uNameGizmoButtonsReveal[3], nameInside3, uNameGizmoIcons, 3.0 );

  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, gbtn0 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, gbtn1 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, gbtn2 );
  garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, gbtn3 );
`;

export { garmentNameMapFragment };
