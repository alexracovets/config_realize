const garmentVertexUvPars = /* glsl */ `
#include <uv_pars_vertex>
varying vec2 vRawUv1;
varying vec2 vPrintUv;
`;

const garmentVertexUv = /* glsl */ `
#include <uv_vertex>
vPrintUv = uv;
#ifdef USE_UV1
  vRawUv1 = uv1;
#else
  vRawUv1 = uv;
#endif
`;

const garmentFragmentUvPars = /* glsl */ `
#include <uv_pars_fragment>
varying vec2 vRawUv1;
varying vec2 vPrintUv;
#ifdef USE_GRADIENT
uniform vec4 uPartUvBounds;
uniform float uGradientEnabled;
uniform vec3 uGradientColor2;
uniform float uGradientRotation;
uniform float uGradientPosition;
uniform float uGradientSoftness;
uniform float uGradientOpacity;

float garmentGradientMask( vec2 uv ) {
  vec2 dir = vec2( cos( uGradientRotation ), sin( uGradientRotation ) );
  vec2 gradStart = vec2( 0.5 ) - dir * 0.5;
  vec2 gradEnd = vec2( 0.5 ) + dir * 0.5;
  vec2 gradVec = gradEnd - gradStart;
  float t = dot( uv - gradStart, gradVec ) / dot( gradVec, gradVec );
  t = clamp( t, 0.0, 1.0 );

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
uniform sampler2D uLogoStamp;
uniform vec2 uLogoStampCellSize;
uniform vec2 uLogoAnchorUv[4];
uniform float uLogoRotation[4];
uniform float uLogoUploadRotation[4];
uniform float uLogoPartRotation[4];
uniform float uLogoScale[4];
uniform float uLogoSlotActive[4];
uniform vec4 uLogoPartBounds[4];
uniform float uLogoGizmoEnabled;
uniform float uLogoGizmoFrameActive[4];
uniform float uLogoGizmoButtonsActive[4];
uniform float uLogoGizmoButtonsReveal[4];
uniform vec2 uLogoGizmoHalf[4];
uniform float uNameGizmoEnabled;
uniform float uNameGizmoFrameActive[4];
uniform float uNameGizmoButtonsActive[4];
uniform float uNameGizmoButtonsReveal[4];
uniform vec2 uNameGizmoHalf[4];
uniform sampler2D uNameGizmoIcons;
uniform float uNameGizmoHoverSlot;
uniform float uNameGizmoHoverCorner;
uniform float uNameGizmoHoverScale;
uniform vec3 uNameGizmoBtnFill;
uniform vec3 uNameGizmoBtnFillActive;
uniform vec3 uNameGizmoIconColor;
uniform sampler2D uPatternMask0;
uniform sampler2D uPatternMask1;
uniform vec3 uPatternColor0;
uniform vec3 uPatternColor1;
uniform float uPatternOpacity;

vec4 garmentGizmoUiColor;
vec4 garmentPrintColor;

vec4 garmentCompositeUiLayer( vec4 base, vec4 layer ) {
  base.rgb = layer.rgb * layer.a + base.rgb * ( 1.0 - layer.a );
  base.a = layer.a + base.a * ( 1.0 - layer.a );
  return base;
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

vec2 garmentNameToStampUv( vec2 worldUv, vec2 anchor, float rotation, float placementRotation, float uploadRotation, float partRotation, float scale ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + placementRotation + uploadRotation ) / max( scale, 0.001 );
  return vec2( 0.5 ) + localPx / uNameStampSize;
}

vec2 garmentTestoToStampUv( vec2 worldUv, vec2 anchor, float rotation, float placementRotation, float uploadRotation, float partRotation, float scale, float lineHeight ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + placementRotation + uploadRotation );
  localPx.x /= max( scale, 0.001 );
  localPx.y /= max( scale * lineHeight, 0.001 );
  return vec2( 0.5 ) + localPx / uTestoStampSize;
}

vec2 garmentNumberToStampUv( vec2 worldUv, vec2 anchor, float rotation, float placementRotation, float uploadRotation, float partRotation, float scale, float lineHeight ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + placementRotation + uploadRotation );
  localPx.x /= max( scale, 0.001 );
  localPx.y /= max( scale * lineHeight, 0.001 );
  return vec2( 0.5 ) + localPx / uNumberStampSize;
}

vec2 garmentLogoToStampUv( vec2 worldUv, vec2 anchor, float rotation, float uploadRotation, float partRotation, float scale ) {
  vec2 localPx = garmentPrintToLocalPx( worldUv, anchor, partRotation );
  localPx = garmentPrintRotateLocalPx( localPx, rotation + uploadRotation ) / max( scale, 0.001 );
  return vec2( 0.5 ) + localPx / uLogoStampCellSize;
}

vec2 garmentLogoStampAtlasUv( vec2 stampUv, float slotIndex ) {
  vec2 cell = vec2( mod( slotIndex, 2.0 ), floor( slotIndex * 0.5 ) );
  return ( cell + stampUv ) * 0.5;
}

vec2 garmentTextMaskFillUv( vec2 stampUv ) {
  return vec2( stampUv.x, stampUv.y * 0.5 );
}

vec2 garmentTextMaskStrokeUv( vec2 stampUv ) {
  return vec2( stampUv.x, stampUv.y * 0.5 + 0.5 );
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

float garmentNameSampleFillChannel( sampler2D tex, vec2 stampUv, float channel ) {
  return garmentNameMaskAlphaAA( garmentNameFillChannel( tex, garmentTextMaskFillUv( stampUv ), channel ) ) * garmentNameInsideStamp( stampUv );
}

float garmentNameSampleStrokeChannel( sampler2D tex, vec2 stampUv, float channel ) {
  return garmentNameMaskAlphaAA( garmentNameFillChannel( tex, garmentTextMaskStrokeUv( stampUv ), channel ) ) * garmentNameInsideStamp( stampUv );
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

// Distance to a rounded rectangle border, antialiased in stamp-pixel space.
float garmentGizmoRectBorder( vec2 localPx, vec2 halfPx, float lineHalfPx ) {
  vec2 q = abs( localPx ) - halfPx;
  float dist = min( max( q.x, q.y ), 0.0 ) + length( max( q, 0.0 ) );
  return garmentGizmoStrokeAlpha( abs( dist ), lineHalfPx, garmentGizmoBorderAa( localPx ) );
}

// 1D parameter along the rectangle perimeter (0..period), alternates colour segments.
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

// Fixed atlas-px chrome (NAME_GIZMO_* in nameStampConstants.ts). Independent of uNameScale.
const float GIZMO_BTN_HALF = 24.0;
const float GIZMO_BTN_OUTSET = 16.0;
const float GIZMO_FRAME_LINE_HALF = 4.0;
const float GIZMO_DASH_PERIOD = 40.0;
const float GIZMO_BTN_HOVER_SCALE_RANGE = 0.1;
const float GIZMO_BTN_REVEAL_SCALE_MIN = 0.9;
// Icon fill within each 1/4 atlas strip; must match GIZMO_ICON_CELL_FILL in useGizmoIconAtlas.ts.
const float GIZMO_ICON_CELL_FILL = 0.62;
const float GIZMO_ICON_CELL_INSET = ( 1.0 - GIZMO_ICON_CELL_FILL ) * 0.5;
// Icon display size inside the white inner circle (smaller = more padding).
const float GIZMO_ICON_BTN_FILL = 0.54;

// Frame in product gizmo axes (uGizmoRotation). halfPx is content AABB half-size in that space.
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

vec4 garmentGizmoButtonCell( sampler2D icons, vec2 localPx, vec2 center, float cell, float hoverScale ) {
  vec2 rel = ( localPx - center ) / max( hoverScale, 1.0 );
  float r = length( rel );
  float aa = garmentGizmoBorderAa( localPx );
  float outerR = GIZMO_BTN_HALF + GIZMO_FRAME_LINE_HALF + aa;
  if ( r > outerR ) return vec4( 0.0 );

  float activeMix = clamp( ( hoverScale - 1.0 ) / GIZMO_BTN_HOVER_SCALE_RANGE, 0.0, 1.0 );
  vec3 fillColor = mix( uNameGizmoBtnFill, uNameGizmoBtnFillActive, activeMix );
  vec4 col = vec4( 0.0 );

  // Fill stops at the inner stroke edge so the full-width dash ring matches the text frame.
  if ( r < GIZMO_BTN_HALF - GIZMO_FRAME_LINE_HALF ) {
    col = vec4( fillColor, 1.0 );
    float innerR = GIZMO_BTN_HALF - GIZMO_FRAME_LINE_HALF;
    vec2 dInner = rel / ( 2.0 * innerR ) + 0.5;
    vec2 d = ( dInner - 0.5 ) / GIZMO_ICON_BTN_FILL + 0.5;
    vec2 iconUv = vec2(
      ( cell + GIZMO_ICON_CELL_INSET + d.x * GIZMO_ICON_CELL_FILL ) * 0.25,
      1.0 - ( GIZMO_ICON_CELL_INSET + d.y * GIZMO_ICON_CELL_FILL )
    );
    vec4 icon = texture2D( icons, iconUv );
    vec3 iconRgb = mix( uNameGizmoIconColor, vec3( 1.0 ), activeMix );
    col.rgb = iconRgb * icon.a + col.rgb * ( 1.0 - icon.a );
    col.a = icon.a + col.a * ( 1.0 - icon.a );
  }

  float border = garmentGizmoStrokeAlpha( abs( r - GIZMO_BTN_HALF ), GIZMO_FRAME_LINE_HALF, aa );
  if ( border > 0.01 ) {
    float dash = garmentGizmoCircleDash( rel, GIZMO_BTN_HALF, GIZMO_DASH_PERIOD );
    vec3 borderCol = garmentGizmoDashColor( dash );
    col.rgb = borderCol * border + col.rgb * ( 1.0 - border );
    col.a = border + col.a * ( 1.0 - border );
  }

  return col;
}

// Buttons sit at AABB corners in part-local px; icon size is fixed and does not follow scale.
vec4 garmentGizmoButtons( vec2 worldUv, vec2 anchor, float scale, vec2 halfPx, float gizmoRotation, float partRotation, float enabled, float reveal, float insidePart, sampler2D icons, float slotIndex ) {
  if ( enabled < 0.5 || reveal < 0.01 || insidePart < 0.5 ) return vec4( 0.0 );
  vec2 localPx = garmentGizmoFrameLocalPx( worldUv, anchor, gizmoRotation, partRotation );
  vec2 ext = halfPx * scale + vec2( GIZMO_BTN_OUTSET );
  float revealScale = mix( GIZMO_BTN_REVEAL_SCALE_MIN, 1.0, reveal );

  vec4 c0 = garmentGizmoButtonCell( icons, localPx, vec2( -ext.x,  ext.y ), 0.0, garmentGizmoButtonHoverScale( slotIndex, 0.0 ) * revealScale );
  vec4 c1 = garmentGizmoButtonCell( icons, localPx, vec2( -ext.x, -ext.y ), 1.0, garmentGizmoButtonHoverScale( slotIndex, 1.0 ) * revealScale );
  vec4 c2 = garmentGizmoButtonCell( icons, localPx, vec2(  ext.x,  ext.y ), 2.0, garmentGizmoButtonHoverScale( slotIndex, 2.0 ) * revealScale );
  vec4 c3 = garmentGizmoButtonCell( icons, localPx, vec2(  ext.x, -ext.y ), 3.0, garmentGizmoButtonHoverScale( slotIndex, 3.0 ) * revealScale );

  vec4 col = vec4( 0.0 );
  col.rgb = c0.rgb * c0.a + col.rgb * ( 1.0 - c0.a ); col.a = c0.a + col.a * ( 1.0 - c0.a );
  col.rgb = c1.rgb * c1.a + col.rgb * ( 1.0 - c1.a ); col.a = c1.a + col.a * ( 1.0 - c1.a );
  col.rgb = c2.rgb * c2.a + col.rgb * ( 1.0 - c2.a ); col.a = c2.a + col.a * ( 1.0 - c2.a );
  col.rgb = c3.rgb * c3.a + col.rgb * ( 1.0 - c3.a ); col.a = c3.a + col.a * ( 1.0 - c3.a );
  col.a *= reveal;
  return col;
}

#endif
`;

const garmentNormalFragment = /* glsl */ `
#ifdef USE_NORMALMAP_TANGENTSPACE
  vec3 mapN = texture2D( normalMap, vRawUv1 ).xyz * 2.0 - 1.0;
  mapN.xy *= normalScale;
  normal = normalize( tbn * mapN );

  #ifdef FLIP_SIDED
    normal = -normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
#endif
`;

const garmentGizmoLightsFragment = /* glsl */ `
#ifdef USE_PRINT
  gl_FragColor.rgb = mix( gl_FragColor.rgb, garmentGizmoUiColor.rgb, garmentGizmoUiColor.a );
#endif
`;

const garmentRoughnessFragment = /* glsl */ `
float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  float fabricR = texture2D( roughnessMap, vRoughnessMapUv ).r;
  fabricR = pow( fabricR, 0.55 );
  roughnessFactor *= mix( 0.14, 0.82, fabricR );
#endif
#ifdef USE_AOMAP
  float bakeRough = texture2D( aoMap, vRawUv1 ).g;
  roughnessFactor *= mix( 0.62, 1.0, bakeRough );
#endif
`;

export { garmentFragmentUvPars, garmentGizmoLightsFragment, garmentNormalFragment, garmentRoughnessFragment, garmentVertexUv, garmentVertexUvPars };
