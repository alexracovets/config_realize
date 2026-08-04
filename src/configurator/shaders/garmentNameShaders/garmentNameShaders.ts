const garmentNameMapFragment =  `
  for ( int nameSlot = 0; nameSlot < 4; nameSlot ++ ) {
    float nameChannel = float( nameSlot );
    vec2 nameStampUv = garmentNameToStampUv( vPrintUv, uNameAnchorUv[ nameSlot ], uNameRotation[ nameSlot ], uNamePlacementRotation[ nameSlot ], uNameUploadRotation[ nameSlot ], uNamePartRotation[ nameSlot ], uNameScale[ nameSlot ] );
    float nameInside = garmentNameInsidePart( vPrintUv, uNamePartBounds[ nameSlot ] ) * uNameSlotActive[ nameSlot ];

    vec4 slotName = vec4( 0.0 );
    slotName = garmentCompositeNameLayer( slotName, uNameStrokeColors[ nameSlot ], garmentNameSampleStrokeChannel( uNameMask, nameStampUv, nameChannel ) * nameInside );
    slotName = garmentCompositeNameLayer( slotName, uNameTextColors[ nameSlot ], garmentNameSampleFillChannel( uNameMask, nameStampUv, nameChannel ) * nameInside );
    printColor = garmentCompositePrintElement( printColor, slotName );
    vec4 nameFrame = garmentGizmoFrameColor( vPrintUv, uNameAnchorUv[ nameSlot ], uNameScale[ nameSlot ], uNameGizmoHalf[ nameSlot ], uGizmoRotation, uNamePartRotation[ nameSlot ], uNameGizmoEnabled * uNameGizmoFrameActive[ nameSlot ], nameInside );
    printColor = garmentCompositeGizmoFrame( printColor, nameFrame );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, nameFrame );

    vec4 nameBtn = garmentGizmoButtons( vPrintUv, uNameAnchorUv[ nameSlot ], uNameScale[ nameSlot ], uNameGizmoHalf[ nameSlot ], uGizmoRotation, uNamePartRotation[ nameSlot ], uNameGizmoEnabled * uNameGizmoButtonsActive[ nameSlot ], uNameGizmoButtonsReveal[ nameSlot ], nameInside, uNameGizmoIcons, nameChannel );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, nameBtn );
  }
`;

export { garmentNameMapFragment };
