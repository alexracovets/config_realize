// Slot work runs in a fixed 4-iteration loop instead of hand-unrolled per-slot code — the
// unrolled form quadrupled the GLSL source and made driver-side shader translation (ANGLE)
// pathologically slow (multi-second compiles per material).
const garmentLogoMapFragment = /* glsl */ `
  for ( int logoSlot = 0; logoSlot < 4; logoSlot ++ ) {
    float logoCell = float( logoSlot );
    float logoInside = garmentNameInsidePart( vPrintUv, uLogoPartBounds[ logoSlot ] ) * uLogoSlotActive[ logoSlot ];
    vec2 logoStampUv = garmentLogoToStampUv( vPrintUv, uLogoAnchorUv[ logoSlot ], uLogoRotation[ logoSlot ], uLogoUploadRotation[ logoSlot ], uLogoPartRotation[ logoSlot ], uLogoScale[ logoSlot ] );

    vec4 logoColor = texture2D( uLogoStamp, garmentLogoStampAtlasUv( logoStampUv, logoCell ) );
    logoColor.a *= logoInside * garmentNameInsideStamp( logoStampUv );

    printColor = garmentCompositePrintElement( printColor, logoColor );
    printColor = garmentCompositeGizmoFrame( printColor, garmentGizmoFrameColor( vPrintUv, uLogoAnchorUv[ logoSlot ], uLogoScale[ logoSlot ], uLogoGizmoHalf[ logoSlot ], uGizmoRotation, uLogoPartRotation[ logoSlot ], uLogoGizmoEnabled * uLogoGizmoFrameActive[ logoSlot ], logoInside ) );

    vec4 logoBtn = garmentGizmoButtons( vPrintUv, uLogoAnchorUv[ logoSlot ], uLogoScale[ logoSlot ], uLogoGizmoHalf[ logoSlot ], uGizmoRotation, uLogoPartRotation[ logoSlot ], uLogoGizmoEnabled * uLogoGizmoButtonsActive[ logoSlot ], uLogoGizmoButtonsReveal[ logoSlot ], logoInside, uNameGizmoIcons, logoCell );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, logoBtn );
  }
`;

export { garmentLogoMapFragment };
