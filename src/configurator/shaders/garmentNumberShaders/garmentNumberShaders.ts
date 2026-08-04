const garmentNumberMapFragment =  `
  for ( int numberSlot = 0; numberSlot < 4; numberSlot ++ ) {
    float numberChannel = float( numberSlot );
    vec2 numberStampUv = garmentNumberToStampUv( vPrintUv, uNumberAnchorUv[ numberSlot ], uNumberRotation[ numberSlot ], uNumberPlacementRotation[ numberSlot ], uNumberUploadRotation[ numberSlot ], uNumberPartRotation[ numberSlot ], uNumberScale[ numberSlot ], uNumberLineHeight[ numberSlot ] );
    float numberInside = garmentNameInsidePart( vPrintUv, uNumberPartBounds[ numberSlot ] ) * uNumberSlotActive[ numberSlot ];

    vec4 slotNumber = vec4( 0.0 );
    slotNumber = garmentCompositeNameLayer( slotNumber, uNumberStrokeColors[ numberSlot ], garmentNameSampleStrokeChannel( uNumberMask, numberStampUv, numberChannel ) * numberInside );
    slotNumber = garmentCompositeNameLayer( slotNumber, uNumberTextColors[ numberSlot ], garmentNameSampleFillChannel( uNumberMask, numberStampUv, numberChannel ) * numberInside );
    printColor = garmentCompositePrintElement( printColor, slotNumber );
    vec4 numberFrame = garmentGizmoFrameColor( vPrintUv, uNumberAnchorUv[ numberSlot ], uNumberScale[ numberSlot ], uNumberGizmoHalf[ numberSlot ], uGizmoRotation, uNumberPartRotation[ numberSlot ], uNumberGizmoEnabled * uNumberGizmoFrameActive[ numberSlot ], numberInside );
    printColor = garmentCompositeGizmoFrame( printColor, numberFrame );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, numberFrame );

    vec4 numberBtn = garmentGizmoButtons( vPrintUv, uNumberAnchorUv[ numberSlot ], uNumberScale[ numberSlot ], uNumberGizmoHalf[ numberSlot ], uGizmoRotation, uNumberPartRotation[ numberSlot ], uNumberGizmoEnabled * uNumberGizmoButtonsActive[ numberSlot ], uNumberGizmoButtonsReveal[ numberSlot ], numberInside, uNameGizmoIcons, numberChannel );
    garmentGizmoUiColor = garmentCompositeUiLayer( garmentGizmoUiColor, numberBtn );
  }
`;

export { garmentNumberMapFragment };
