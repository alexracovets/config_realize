// Slot work runs in a fixed 4-iteration loop instead of hand-unrolled per-slot code — the
// unrolled form quadrupled the GLSL source and made driver-side shader translation (ANGLE)
// pathologically slow (multi-second compiles per material).
const garmentNameMapFragment = /* glsl */ `
  for ( int nameSlot = 0; nameSlot < 4; nameSlot ++ ) {
    float nameChannel = float( nameSlot );
    vec2 nameStampUv = garmentNameToStampUv( vPrintUv, uNameAnchorUv[ nameSlot ], uNameRotation[ nameSlot ], uNamePlacementRotation[ nameSlot ], uNameUploadRotation[ nameSlot ], uNamePartRotation[ nameSlot ], uNameScale[ nameSlot ] );
    float nameInside = garmentNameInsidePart( vPrintUv, uNamePartBounds[ nameSlot ] ) * uNameSlotActive[ nameSlot ];

    vec4 slotName = vec4( 0.0 );
    slotName = garmentCompositeNameLayer( slotName, uNameStrokeColors[ nameSlot ], garmentNameSampleStrokeChannel( uNameMask, nameStampUv, nameChannel ) * nameInside );
    slotName = garmentCompositeNameLayer( slotName, uNameTextColors[ nameSlot ], garmentNameSampleFillChannel( uNameMask, nameStampUv, nameChannel ) * nameInside );
    printColor = garmentCompositePrintElement( printColor, slotName );
    printColor = garmentCompositeGizmoFrame( printColor, garmentGizmoFrameColor( vPrintUv, uNameAnchorUv[ nameSlot ], uNameScale[ nameSlot ], uNameGizmoHalf[ nameSlot ], uGizmoRotation, uNamePartRotation[ nameSlot ], uNameGizmoEnabled * uNameGizmoFrameActive[ nameSlot ], nameInside ) );

    vec4 nameBtn = garmentGizmoButtons( vPrintUv, uNameAnchorUv[ nameSlot ], uNameScale[ nameSlot ], uNameGizmoHalf[ nameSlot ], uGizmoRotation, uNamePartRotation[ nameSlot ], uNameGizmoEnabled * uNameGizmoButtonsActive[ nameSlot ], uNameGizmoButtonsReveal[ nameSlot ], nameInside, uNameGizmoIcons, nameChannel );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, nameBtn );
  }
`;

export { garmentNameMapFragment };
