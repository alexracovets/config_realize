// Slot work runs in a fixed 4-iteration loop instead of hand-unrolled per-slot code — the
// unrolled form quadrupled the GLSL source and made driver-side shader translation (ANGLE)
// pathologically slow (multi-second compiles per material).
const garmentTestoMapFragment = /* glsl */ `
  for ( int testoSlot = 0; testoSlot < 4; testoSlot ++ ) {
    float testoChannel = float( testoSlot );
    vec2 testoStampUv = garmentTestoToStampUv( vPrintUv, uTestoAnchorUv[ testoSlot ], uTestoRotation[ testoSlot ], uTestoPlacementRotation[ testoSlot ], uTestoUploadRotation[ testoSlot ], uTestoPartRotation[ testoSlot ], uTestoScale[ testoSlot ], uTestoLineHeight[ testoSlot ] );
    float testoInside = garmentNameInsidePart( vPrintUv, uTestoPartBounds[ testoSlot ] ) * uTestoSlotActive[ testoSlot ];

    vec4 slotTesto = vec4( 0.0 );
    slotTesto = garmentCompositeNameLayer( slotTesto, uTestoStrokeColors[ testoSlot ], garmentNameSampleStrokeChannel( uTestoMask, testoStampUv, testoChannel ) * testoInside );
    slotTesto = garmentCompositeNameLayer( slotTesto, uTestoTextColors[ testoSlot ], garmentNameSampleFillChannel( uTestoMask, testoStampUv, testoChannel ) * testoInside );
    printColor = garmentCompositePrintElement( printColor, slotTesto );
    printColor = garmentCompositeGizmoFrame( printColor, garmentGizmoFrameColor( vPrintUv, uTestoAnchorUv[ testoSlot ], uTestoScale[ testoSlot ], uTestoGizmoHalf[ testoSlot ], uGizmoRotation, uTestoPartRotation[ testoSlot ], uTestoGizmoEnabled * uTestoGizmoFrameActive[ testoSlot ], testoInside ) );

    vec4 testoBtn = garmentGizmoButtons( vPrintUv, uTestoAnchorUv[ testoSlot ], uTestoScale[ testoSlot ], uTestoGizmoHalf[ testoSlot ], uGizmoRotation, uTestoPartRotation[ testoSlot ], uTestoGizmoEnabled * uTestoGizmoButtonsActive[ testoSlot ], uTestoGizmoButtonsReveal[ testoSlot ], testoInside, uNameGizmoIcons, testoChannel );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, testoBtn );
  }
`;

export { garmentTestoMapFragment };
