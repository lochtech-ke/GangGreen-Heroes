/**
 * Easing Functions
 * 
 * Collection of easing functions for smooth animations
 * All functions take a value t between 0 and 1 and return an eased value
 */

/**
 * Linear easing (no easing)
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function linear(t: number): number {
  return t;
}

/**
 * Ease in cubic - slow start, fast end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Ease out cubic - fast start, slow end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease in-out cubic - slow start and end, fast middle
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease in quad - gentle slow start
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Ease out quad - gentle slow end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Ease in-out quad - gentle slow start and end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Ease out elastic - bouncy end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;

  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Ease in elastic - bouncy start
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;

  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
}

/**
 * Ease out bounce - bouncing end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Ease in bounce - bouncing start
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInBounce(t: number): number {
  return 1 - easeOutBounce(1 - t);
}

/**
 * Ease in-out back - overshoot at start and end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInOutBack(t: number): number {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;

  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
}

/**
 * Ease out back - overshoot at end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Ease in expo - very slow start, very fast end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

/**
 * Ease out expo - very fast start, very slow end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Ease in-out expo - very slow start and end
 * @param t - Progress value between 0 and 1
 * @returns Eased value
 */
export function easeInOutExpo(t: number): number {
  return t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/**
 * Interpolate between two values using an easing function
 * @param start - Start value
 * @param end - End value
 * @param t - Progress value between 0 and 1
 * @param easingFn - Easing function to use (default: linear)
 * @returns Interpolated value
 */
export function interpolate(
  start: number,
  end: number,
  t: number,
  easingFn: (t: number) => number = linear
): number {
  const easedT = easingFn(Math.max(0, Math.min(1, t)));
  return start + (end - start) * easedT;
}

/**
 * Interpolate between two colors using an easing function
 * @param startColor - Start color in hex format (0xRRGGBB)
 * @param endColor - End color in hex format (0xRRGGBB)
 * @param t - Progress value between 0 and 1
 * @param easingFn - Easing function to use (default: linear)
 * @returns Interpolated color in hex format
 */
export function interpolateColor(
  startColor: number,
  endColor: number,
  t: number,
  easingFn: (t: number) => number = linear
): number {
  const easedT = easingFn(Math.max(0, Math.min(1, t)));
  
  // Extract RGB components
  const startR = (startColor >> 16) & 0xFF;
  const startG = (startColor >> 8) & 0xFF;
  const startB = startColor & 0xFF;
  
  const endR = (endColor >> 16) & 0xFF;
  const endG = (endColor >> 8) & 0xFF;
  const endB = endColor & 0xFF;
  
  // Interpolate each component
  const r = Math.round(startR + (endR - startR) * easedT);
  const g = Math.round(startG + (endG - startG) * easedT);
  const b = Math.round(startB + (endB - startB) * easedT);
  
  // Combine back into hex
  return (r << 16) | (g << 8) | b;
}
