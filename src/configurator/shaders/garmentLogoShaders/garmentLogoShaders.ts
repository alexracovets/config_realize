const garmentLogoMapFragment = `
  for ( int logoSlot = 0; logoSlot < LOGO_SLOT_COUNT; logoSlot ++ ) {
    if ( uLogoSlotActive( logoSlot ) < 0.5 ) continue;

    float logoCell = uLogoStampSlot( logoSlot );
    float logoInside = garmentNameInsidePart( vPrintUv, uLogoPartBounds[ logoSlot ] ) * uLogoSlotActive( logoSlot );
    vec2 logoStampUv = garmentLogoToStampUv( vPrintUv, uLogoAnchorUv( logoSlot ), uLogoRotation( logoSlot ), uLogoUploadRotation( logoSlot ), uLogoPartRotation( logoSlot ), uLogoScale( logoSlot ) );

    vec4 logoColor = texture2D( uLogoStamp, garmentLogoStampAtlasUv( logoStampUv, logoCell ) );
    logoColor.a *= logoInside * garmentNameInsideStamp( logoStampUv );

    printColor = garmentCompositePrintElement( printColor, logoColor );
    vec4 logoFrame = garmentGizmoFrameColor( vPrintUv, uLogoAnchorUv( logoSlot ), uLogoScale( logoSlot ), uLogoGizmoHalf[ logoSlot ], uGizmoRotation, uLogoPartRotation( logoSlot ), uLogoGizmoEnabled * uLogoGizmoFrameActive( logoSlot ), logoInside );
    printColor = garmentCompositeGizmoFrame( printColor, logoFrame );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, logoFrame );

    vec4 logoBtn = garmentGizmoButtons( vPrintUv, uLogoAnchorUv( logoSlot ), uLogoScale( logoSlot ), uLogoGizmoHalf[ logoSlot ], uGizmoRotation, uLogoPartRotation( logoSlot ), uLogoGizmoEnabled * uLogoGizmoButtonsActive( logoSlot ), uLogoGizmoButtonsReveal( logoSlot ), logoInside, uNameGizmoIcons, float( logoSlot ) );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, logoBtn );
  }
`;

export { garmentLogoMapFragment };
