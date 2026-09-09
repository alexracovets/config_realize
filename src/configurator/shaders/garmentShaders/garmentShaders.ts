const garmentFragmentUvPars = `
#include <uv_pars_fragment>
varying vec2 vPrintUv;
varying vec3 vGarmentWorldPos;
#ifdef USE_GRADIENT
uniform vec4 uPartUvBounds;
uniform float uGradientEnabled;
uniform vec3 uGradientColor2;
uniform float uGradientRotation;
uniform float uGradientPosition;
uniform float uGradientSoftness;
uniform float uGradientOpacity;
uniform vec3 uGradientOrigin;
uniform vec3 uGradientExtent;
uniform vec3 uGradientDir;
uniform vec2 uGradientUvAxis;

float garmentGradientWorldT( vec3 worldPos ) {
  if ( dot( uGradientUvAxis, uGradientUvAxis ) > 0.25 ) {
    vec2 partSize = max( uPartUvBounds.zw - uPartUvBounds.xy, vec2( 1e-5 ) );
    vec2 partUv = ( vPrintUv - uPartUvBounds.xy ) / partSize;
    vec2 toward = max( uGradientUvAxis, vec2( 0.0 ) );
    vec2 fromHem = max( -uGradientUvAxis, vec2( 0.0 ) );
    return clamp( dot( partUv, toward ) + dot( vec2( 1.0 ) - partUv, fromHem ), 0.0, 1.0 );
  }

  vec3 dir = uGradientDir;
  vec3 local = worldPos - uGradientOrigin;
  float span = abs( dir.x ) * uGradientExtent.x + abs( dir.y ) * uGradientExtent.y + abs( dir.z ) * uGradientExtent.z;
  return clamp( dot( local, dir ) / max( span, 1e-5 ) * 0.5 + 0.5, 0.0, 1.0 );
}

float garmentGradientMask( float t ) {
  float mid = uGradientPosition;
  float spread = uGradientSoftness * 0.5;
  float stop0 = max( 0.0, mid - spread );
  float stop1 = min( 1.0, max( mid + spread, stop0 + 0.001 ) );

  return smoothstep( stop0, stop1, t ) * uGradientOpacity;
}
#endif
#ifdef USE_PRINT
uniform sampler2D uDefaultLogos;
uniform vec2 uPrintAtlasSize;
uniform float uGizmoRotation;
#ifdef USE_GARMENT_NAME
uniform sampler2D uNameMask;
uniform vec2 uNameStampSize;
uniform vec2 uNameAnchorUv[4];
uniform float uNameRotation[4];
uniform float uNamePlacementRotation[4];
uniform float uNameUploadRotation[4];
uniform float uNamePartRotation[4];
uniform float uNameScale[4];
uniform float uNameSlotActive[4];
uniform vec4 uNamePartBounds[4];
uniform vec3 uNameTextColors[4];
uniform vec3 uNameStrokeColors[4];
uniform float uNameGizmoEnabled;
uniform float uNameGizmoFrameActive[4];
uniform float uNameGizmoButtonsActive[4];
uniform float uNameGizmoButtonsReveal[4];
uniform vec2 uNameGizmoHalf[4];
#endif
#ifdef USE_GARMENT_TESTO
uniform sampler2D uTestoMask;
uniform vec2 uTestoStampSize;
uniform vec2 uTestoAnchorUv[4];
uniform float uTestoRotation[4];
uniform float uTestoPlacementRotation[4];
uniform float uTestoUploadRotation[4];
uniform float uTestoPartRotation[4];
uniform float uTestoScale[4];
uniform float uTestoSlotActive[4];
uniform vec4 uTestoPartBounds[4];
uniform vec3 uTestoTextColors[4];
uniform vec3 uTestoStrokeColors[4];
uniform float uTestoGizmoEnabled;
uniform float uTestoGizmoFrameActive[4];
uniform float uTestoGizmoButtonsActive[4];
uniform float uTestoGizmoButtonsReveal[4];
uniform vec2 uTestoGizmoHalf[4];
uniform float uTestoLineHeight[4];
#endif
#ifdef USE_GARMENT_NUMBER
uniform sampler2D uNumberMask;
uniform vec2 uNumberStampSize;
uniform vec2 uNumberAnchorUv[4];
uniform float uNumberRotation[4];
uniform float uNumberPlacementRotation[4];
uniform float uNumberUploadRotation[4];
uniform float uNumberPartRotation[4];
uniform float uNumberScale[4];
uniform float uNumberLineHeight[4];
uniform float uNumberSlotActive[4];
uniform vec4 uNumberPartBounds[4];
uniform vec3 uNumberTextColors[4];
uniform vec3 uNumberStrokeColors[4];
uniform float uNumberGizmoEnabled;
uniform float uNumberGizmoFrameActive[4];
uniform float uNumberGizmoButtonsActive[4];
uniform float uNumberGizmoButtonsReveal[4];
uniform vec2 uNumberGizmoHalf[4];
#endif
#ifdef USE_GARMENT_LOGO
uniform sampler2D uLogoStamp;
uniform vec2 uLogoStampCellSize;
uniform float uLogoStampGrid;
uniform vec4 uLogoA[LOGO_SLOT_COUNT];
uniform vec4 uLogoB[LOGO_SLOT_COUNT];
uniform vec4 uLogoPartBounds[LOGO_SLOT_COUNT];
uniform float uLogoGizmoEnabled;
uniform vec4 uLogoG[LOGO_SLOT_COUNT];
uniform vec2 uLogoGizmoHalf[LOGO_SLOT_COUNT];
#define uLogoAnchorUv( i ) ( uLogoA[ i ].xy )
#define uLogoScale( i ) ( uLogoA[ i ].z )
#define uLogoStampSlot( i ) ( uLogoA[ i ].w )
#define uLogoRotation( i ) ( uLogoB[ i ].x )
#define uLogoUploadRotation( i ) ( uLogoB[ i ].y )
#define uLogoPartRotation( i ) ( uLogoB[ i ].z )
#define uLogoSlotActive( i ) ( uLogoB[ i ].w )
#define uLogoGizmoFrameActive( i ) ( uLogoG[ i ].x )
#define uLogoGizmoButtonsActive( i ) ( uLogoG[ i ].y )
#define uLogoGizmoButtonsReveal( i ) ( uLogoG[ i ].z )
#endif
#ifdef USE_GARMENT_TEXT
uniform sampler2D uNameGizmoIcons;
uniform float uNameGizmoHoverSlot;
uniform float uNameGizmoHoverCorner;
uniform float uNameGizmoHoverScale;
uniform float uNameGizmoBtnScale;
uniform vec3 uNameGizmoBtnFill;
uniform vec3 uNameGizmoBtnFillActive;
uniform vec3 uNameGizmoIconColor;
#endif
uniform sampler2D uPatternMask0;
uniform sampler2D uPatternMask1;
uniform sampler2D uPatternMask2;
uniform vec3 uPatternColor0;
uniform vec3 uPatternColor1;
uniform vec3 uPatternColor2;
uniform float uPatternOpacity;

vec4 garmentGizmoUiColor;
vec4 garmentPrintColor;
float garmentPbrShade;

#ifdef USE_GARMENT_TEXT
vec4 garmentCompositeUiLayer( vec4 base, vec4 layer ) {
  base.rgb = layer.rgb * layer.a + base.rgb * ( 1.0 - layer.a );
  base.a = layer.a + base.a * ( 1.0 - layer.a );
  return base;
}

vec4 garmentCompositePrintElement( vec4 printColor, vec4 layer ) {
  return garmentCompositeUiLayer( printColor, layer );
}

vec4 garmentCompositeGizmoFrame( vec4 printColor, vec4 frame ) {
  float erase = step( 0.001, frame.a );
  printColor.rgb *= ( 1.0 - erase );
  printColor.a *= ( 1.0 - erase );
  return printColor;
}

vec4 garmentCompositeNameLayer( vec4 base, vec3 rgb, float alpha ) {
  vec4 layer = vec4( rgb, alpha );
  base.rgb = layer.rgb * layer.a + base.rgb * ( 1.0 - layer.a );
  base.a = layer.a + base.a * ( 1.0 - layer.a );
  return base;
}

vec2 garmentPrintRotateLocalPx( vec2 localPx, float rotation ) {
  float c = cos( -rotation );
  float s = sin( -rotation );
  return vec2( c * localPx.x - s * localPx.y, s * localPx.x + c * localPx.y );
}

vec2 garmentPrintToLocalPx( vec2 worldUv, vec2 anchor, float partRotation ) {
  vec2 deltaPx = ( worldUv - anchor ) * uPrintAtlasSize;
  return garmentPrintRotateLocalPx( deltaPx, partRotation );
}
#endif

#ifdef USE_GARMENT_NAME
vec2 garmentNameToStampUv( vec2 worldUv, vec2 anchor, float rotation, float placementRotation, float uploadRotation, float partRotation, float scale ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + placementRotation + uploadRotation ) / max( scale, 0.001 );
  return vec2( 0.5 ) + localPx / uNameStampSize;
}
#endif

#ifdef USE_GARMENT_TESTO
vec2 garmentTestoToStampUv( vec2 worldUv, vec2 anchor, float rotation, float placementRotation, float uploadRotation, float partRotation, float scale, float lineHeight ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + placementRotation + uploadRotation );
  localPx.x /= max( scale, 0.001 );
  localPx.y /= max( scale * lineHeight, 0.001 );
  return vec2( 0.5 ) + localPx / uTestoStampSize;
}
#endif

#ifdef USE_GARMENT_NUMBER
vec2 garmentNumberToStampUv( vec2 worldUv, vec2 anchor, float rotation, float placementRotation, float uploadRotation, float partRotation, float scale, float lineHeight ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + placementRotation + uploadRotation );
  localPx.x /= max( scale, 0.001 );
  localPx.y /= max( scale * lineHeight, 0.001 );
  return vec2( 0.5 ) + localPx / uNumberStampSize;
}
#endif

#ifdef USE_GARMENT_LOGO
vec2 garmentLogoToStampUv( vec2 worldUv, vec2 anchor, float rotation, float uploadRotation, float partRotation, float scale ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + uploadRotation ) / max( scale, 0.001 );
  return vec2( 0.5 ) + localPx / uLogoStampCellSize;
}

vec2 garmentLogoStampAtlasUv( vec2 stampUv, float slotIndex ) {
  float grid = max( uLogoStampGrid, 1.0 );
  vec2 cell = vec2( mod( slotIndex, grid ), floor( slotIndex / grid ) );
  return ( cell + stampUv ) / grid;
}
#endif

#ifdef USE_GARMENT_TEXT
vec2 garmentTextMaskFillUv( vec2 stampUv, vec2 stampSize ) {
  float halfX = 0.5 / max( stampSize.x, 1.0 );
  float halfY = 0.5 / max( stampSize.y * 2.0, 1.0 );
  return vec2(
    clamp( stampUv.x, halfX, 1.0 - halfX ),
    clamp( stampUv.y * 0.5, halfY, 0.5 - halfY )
  );
}

vec2 garmentTextMaskStrokeUv( vec2 stampUv, vec2 stampSize ) {
  float halfX = 0.5 / max( stampSize.x, 1.0 );
  float halfY = 0.5 / max( stampSize.y * 2.0, 1.0 );
  return vec2(
    clamp( stampUv.x, halfX, 1.0 - halfX ),
    clamp( stampUv.y * 0.5 + 0.5, 0.5 + halfY, 1.0 - halfY )
  );
}

float garmentNameInsideStamp( vec2 stampUv ) {
  return step( 0.0, stampUv.x ) * step( stampUv.x, 1.0 ) * step( 0.0, stampUv.y ) * step( stampUv.y, 1.0 );
}

float garmentNameFillChannel( sampler2D tex, vec2 uv, float channel ) {
  vec4 masks = texture2D( tex, uv );
  if ( channel < 0.5 ) return masks.r;
  if ( channel < 1.5 ) return masks.g;
  if ( channel < 2.5 ) return masks.b;
  return masks.a;
}

float garmentNameMaskAlphaAA( float alpha ) {
  float fw = max( fwidth( alpha ), 0.0008 );
  return smoothstep( 0.5 - fw, 0.5 + fw, alpha );
}

float garmentNameSampleFillChannel( sampler2D tex, vec2 stampUv, float channel, vec2 stampSize ) {
  return garmentNameMaskAlphaAA( garmentNameFillChannel( tex, garmentTextMaskFillUv( stampUv, stampSize ), channel ) ) * garmentNameInsideStamp( stampUv );
}

float garmentNameSampleStrokeChannel( sampler2D tex, vec2 stampUv, float channel, vec2 stampSize ) {
  return garmentNameMaskAlphaAA( garmentNameFillChannel( tex, garmentTextMaskStrokeUv( stampUv, stampSize ), channel ) ) * garmentNameInsideStamp( stampUv );
}

float garmentNameInsidePart( vec2 worldUv, vec4 bounds ) {
  vec2 partUv = ( worldUv - bounds.xy ) / ( bounds.zw - bounds.xy );
  return step( 0.0, partUv.x ) * step( partUv.x, 1.0 ) * step( 0.0, partUv.y ) * step( partUv.y, 1.0 );
}

float garmentGizmoBorderAa( vec2 atlasPx ) {
  return max( max( fwidth( atlasPx.x ), fwidth( atlasPx.y ) ), 0.0001 );
}

float garmentGizmoStrokeAlpha( float edgeDist, float lineHalfPx, float aa ) {
  return 1.0 - smoothstep( lineHalfPx - aa, lineHalfPx + aa, edgeDist );
}

float garmentGizmoRectBorder( vec2 localPx, vec2 halfPx, float lineHalfPx ) {
  vec2 q = abs( localPx ) - halfPx;
  float dist = min( max( q.x, q.y ), 0.0 ) + length( max( q, 0.0 ) );
  return garmentGizmoStrokeAlpha( abs( dist ), lineHalfPx, garmentGizmoBorderAa( localPx ) );
}

float garmentGizmoDash( vec2 localPx, vec2 halfPx, float period ) {
  vec2 d = abs( localPx ) - halfPx;
  float t = ( d.x > d.y ) ? ( localPx.y + halfPx.y ) : ( localPx.x + halfPx.x );
  return step( period * 0.5, mod( t, period ) );
}

float garmentGizmoCircleDash( vec2 rel, float radius, float period ) {
  float arc = atan( rel.y, rel.x ) * radius;
  float t = mod( arc, period );
  if ( t < 0.0 ) t += period;
  return step( period * 0.5, t );
}

vec3 garmentGizmoDashColor( float dash ) {
  return mix( vec3( 1.0 ), uNameGizmoIconColor, dash );
}

vec2 garmentGizmoFrameLocalPx( vec2 worldUv, vec2 anchor, float gizmoRotation, float partRotation ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  return garmentPrintRotateLocalPx( localPx, gizmoRotation );
}

const float GIZMO_BTN_HALF_BASE = 12.0;
const float GIZMO_BTN_OUTSET_BASE = 8.0;

float garmentGizmoBtnScale() {
  return max( uNameGizmoBtnScale, 1.0 );
}

float garmentGizmoBtnHalf() {
  return GIZMO_BTN_HALF_BASE * garmentGizmoBtnScale();
}

float garmentGizmoBtnOutset() {
  return GIZMO_BTN_OUTSET_BASE * garmentGizmoBtnScale();
}

const float GIZMO_FRAME_LINE_HALF = 2.0;
const float GIZMO_DASH_PERIOD = 40.0;
const float GIZMO_BTN_HOVER_SCALE_RANGE = 0.1;

const float GIZMO_ICON_CELL_FILL = 0.62;
const float GIZMO_ICON_CELL_INSET = ( 1.0 - GIZMO_ICON_CELL_FILL ) * 0.5;

const float GIZMO_ICON_BTN_FILL = 0.54;

vec4 garmentGizmoFrameColor( vec2 worldUv, vec2 anchor, float scale, vec2 halfPx, float gizmoRotation, float partRotation, float enabled, float insidePart ) {
  if ( enabled < 0.5 || insidePart < 0.5 ) return vec4( 0.0 );
  vec2 localPx = garmentGizmoFrameLocalPx( worldUv, anchor, gizmoRotation, partRotation );
  vec2 halfWorld = halfPx * scale;
  float border = garmentGizmoRectBorder( localPx, halfWorld, GIZMO_FRAME_LINE_HALF );
  if ( border < 0.01 ) return vec4( 0.0 );
  float dash = garmentGizmoDash( localPx, halfWorld, GIZMO_DASH_PERIOD );
  return vec4( garmentGizmoDashColor( dash ), border );
}

float garmentGizmoButtonHoverScale( float slotIndex, float cornerIndex ) {
  if ( abs( uNameGizmoHoverSlot - slotIndex ) > 0.5 ) return 1.0;
  if ( abs( uNameGizmoHoverCorner - cornerIndex ) > 0.5 ) return 1.0;
  return max( uNameGizmoHoverScale, 1.0 );
}

vec4 garmentGizmoButtonCell( sampler2D icons, vec2 localPx, vec2 center, float cell, float hoverScale, float reveal ) {
  vec2 rel = ( localPx - center ) / max( hoverScale, 1.0 );
  float r = length( rel );
  float aa = garmentGizmoBorderAa( localPx );
  float btnHalf = garmentGizmoBtnHalf();
  float outerR = btnHalf + GIZMO_FRAME_LINE_HALF + aa;
  if ( r > outerR ) return vec4( 0.0 );

  float fillReveal = reveal * reveal;
  float activeMix = clamp( ( hoverScale - 1.0 ) / GIZMO_BTN_HOVER_SCALE_RANGE, 0.0, 1.0 );
  vec3 fillColor = mix( uNameGizmoBtnFill, uNameGizmoBtnFillActive, activeMix );
  vec3 accRgb = vec3( 0.0 );
  float accA = 0.0;

  if ( r < btnHalf - GIZMO_FRAME_LINE_HALF ) {
    accRgb = fillColor * fillReveal;
    accA = fillReveal;
    float innerR = btnHalf - GIZMO_FRAME_LINE_HALF;
    vec2 dInner = rel / ( 2.0 * innerR ) + 0.5;
    vec2 d = ( dInner - 0.5 ) / GIZMO_ICON_BTN_FILL + 0.5;
    vec2 iconUv = vec2(
      ( cell + GIZMO_ICON_CELL_INSET + d.x * GIZMO_ICON_CELL_FILL ) * 0.25,
      1.0 - ( GIZMO_ICON_CELL_INSET + d.y * GIZMO_ICON_CELL_FILL )
    );
    vec4 icon = texture2D( icons, iconUv );
    vec3 iconRgb = mix( uNameGizmoIconColor, vec3( 1.0 ), activeMix );
    float iconA = icon.a * reveal;
    accRgb = iconRgb * iconA + accRgb * ( 1.0 - iconA );
    accA = iconA + accA * ( 1.0 - iconA );
  }

  float border = garmentGizmoStrokeAlpha( abs( r - btnHalf ), GIZMO_FRAME_LINE_HALF, aa );
  if ( border > 0.01 ) {
    float dash = garmentGizmoCircleDash( rel, btnHalf, GIZMO_DASH_PERIOD );
    vec3 borderCol = garmentGizmoDashColor( dash );

    float borderA = border * mix( fillReveal, reveal, dash );
    accRgb = borderCol * borderA + accRgb * ( 1.0 - borderA );
    accA = borderA + accA * ( 1.0 - borderA );
  }

  return vec4( accA > 0.0001 ? accRgb / accA : vec3( 0.0 ), accA );
}

vec4 garmentGizmoButtons( vec2 worldUv, vec2 anchor, float scale, vec2 halfPx, float gizmoRotation, float partRotation, float enabled, float reveal, float insidePart, sampler2D icons, float slotIndex ) {
  if ( enabled < 0.5 || reveal < 0.05 || insidePart < 0.5 ) return vec4( 0.0 );
  vec2 localPx = garmentGizmoFrameLocalPx( worldUv, anchor, gizmoRotation, partRotation );
  vec2 ext = halfPx * scale + vec2( garmentGizmoBtnOutset() );

  vec3 colRgb = vec3( 0.0 );
  float colA = 0.0;
  for ( int corner = 0; corner < 4; corner ++ ) {
    float cell = float( corner );

    vec2 center = vec2( corner < 2 ? -ext.x : ext.x, mod( cell, 2.0 ) < 0.5 ? ext.y : -ext.y );
    vec4 c = garmentGizmoButtonCell( icons, localPx, center, cell, garmentGizmoButtonHoverScale( slotIndex, cell ), reveal );
    colRgb = c.rgb * c.a + colRgb * ( 1.0 - c.a );
    colA = c.a + colA * ( 1.0 - c.a );
  }
  return vec4( colA > 0.0001 ? colRgb / colA : vec3( 0.0 ), colA );
}
#endif

#endif
`;

const garmentGizmoLightsFragment = `
#ifdef USE_PRINT
  if ( garmentGizmoUiColor.a > 0.001 ) {
    vec3 fabricShaded = diffuseColor.rgb * garmentPbrShade;

    gl_FragColor.rgb = garmentGizmoUiColor.rgb + fabricShaded * ( 1.0 - garmentGizmoUiColor.a );
  }
#endif
`;

export { garmentFragmentUvPars, garmentGizmoLightsFragment };
