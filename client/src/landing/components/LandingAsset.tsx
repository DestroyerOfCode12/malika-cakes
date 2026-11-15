import type { CSSProperties } from 'react';
import type { AssetConfig, Placement } from '../config/assets';

type Vars = Record<string, string | number>;

function placementVars(prefix: 'd' | 't' | 'm', p: Placement | 'hidden', out: Vars) {
  if (p === 'hidden') {
    out[`--${prefix}-display`] = 'none';
    return;
  }
  out[`--${prefix}-display`] = 'block';
  out[`--${prefix}-top`] = p.top ?? 'auto';
  out[`--${prefix}-right`] = p.right ?? 'auto';
  out[`--${prefix}-bottom`] = p.bottom ?? 'auto';
  out[`--${prefix}-left`] = p.left ?? 'auto';
  out[`--${prefix}-width`] = p.width;
}

/**
 * Renders one independently controllable visual from config.
 * - the outer element owns position + scroll parallax (data-parallax)
 * - the inner <img> owns the entrance animation (data-enter)
 * - static tilt/scale use the CSS `rotate`/`scale` properties, so GSAP transforms
 *   compose with them instead of overwriting them
 */
export function LandingAsset({ asset, className = '' }: { asset: AssetConfig; className?: string }) {
  const vars: Vars = {};
  placementVars('d', asset.desktop, vars);
  placementVars('t', asset.tablet ?? asset.desktop, vars);
  placementVars('m', asset.mobile, vars);
  vars['--z'] = asset.zIndex;

  const imgStyle: CSSProperties = {
    rotate: asset.rotate ? `${asset.rotate}deg` : undefined,
    scale: asset.scale ? String(asset.scale) : undefined,
    opacity: asset.opacity,
    filter: asset.blur ? `blur(${asset.blur}px)` : undefined,
  };

  return (
    <div
      className={`l-asset ${className}`}
      style={vars as CSSProperties}
      data-asset={asset.id}
      data-parallax={asset.parallax ?? 0}
      aria-hidden={asset.alt ? undefined : true}
    >
      <img
        src={asset.src}
        alt={asset.alt}
        width={asset.intrinsic.w}
        height={asset.intrinsic.h}
        loading={asset.loading ?? 'lazy'}
        decoding="async"
        draggable={false}
        className="l-asset__img"
        style={imgStyle}
        data-enter
        data-enter-delay={asset.enterDelay ?? 0}
      />
    </div>
  );
}
