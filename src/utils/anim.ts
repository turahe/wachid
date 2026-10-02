import * as THREE from 'three';

/**
 * Easing functions for animation timing.
 * Each maps t ∈ [0,1] → value ∈ [0,1].
 */
export const Ease = {
  linear: (t: number) => t,
  inSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  outSine: (t: number) => Math.sin((t * Math.PI) / 2),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/**
 * Spring physics — frame-rate independent oscillation toward target.
 * Good for camera follow, node breathing, light pulsing.
 *
 * Example:
 *   const spring = new Spring3D();
 *   spring.target.set(1, 2, 3);
 *   position.copy(spring.update(delta));
 */
export class Spring1D {
  position = 0;
  velocity = 0;
  target = 0;
  stiffness: number;
  damping: number;

  constructor(stiffness = 120, damping = 12) {
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(dt: number) {
    const force = -this.stiffness * (this.position - this.target);
    const dampingForce = -this.damping * this.velocity;
    this.velocity += (force + dampingForce) * dt;
    this.position += this.velocity * dt;
    return this.position;
  }

  reset(value = 0) {
    this.position = value;
    this.velocity = 0;
    this.target = value;
  }
}

export class Spring3D {
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  target = new THREE.Vector3();
  stiffness: number;
  damping: number;

  constructor(stiffness = 120, damping = 12) {
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(dt: number, out?: THREE.Vector3): THREE.Vector3 {
    const force = new THREE.Vector3()
      .subVectors(this.target, this.position)
      .multiplyScalar(this.stiffness);
    const dampingForce = this.velocity.clone().multiplyScalar(-this.damping);
    this.velocity.addScaledVector(force.add(dampingForce), dt);
    this.position.addScaledVector(this.velocity, dt);
    if (out) return out.copy(this.position);
    return this.position;
  }

  reset(v: THREE.Vector3) {
    this.position.copy(v);
    this.velocity.set(0, 0, 0);
    this.target.copy(v);
  }
}

/**
 * Smooth damping (critically-damped-ish) toward a target.
 * Cheaper than springs, deterministic for a given smoothTime.
 * From Game Programming Gems 4.
 */
export function smoothDamp1D(
  current: number,
  target: number,
  velocityRef: { current: number },
  smoothTime: number,
  deltaTime: number,
  maxSpeed = Infinity,
): number {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;
  const maxChange = maxSpeed * smoothTime;
  change = THREE.MathUtils.clamp(change, -maxChange, maxChange);
  target = current - change;
  const temp = (velocityRef.current + omega * change) * deltaTime;
  velocityRef.current = (velocityRef.current - omega * temp) * exp;
  let result = target + (change + temp) * exp;
  if (originalTo - current > 0 === result > originalTo) {
    result = originalTo;
    velocityRef.current = 0;
  }
  return result;
}

export function smoothDampVec3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  velocityRef: THREE.Vector3,
  smoothTime: number,
  deltaTime: number,
  maxSpeed = Infinity,
  out?: THREE.Vector3,
): THREE.Vector3 {
  const v = {
    x: smoothDamp1D(current.x, target.x, { get current() { return velocityRef.x; }, set current(v) { velocityRef.x = v; } }, smoothTime, deltaTime, maxSpeed),
    y: smoothDamp1D(current.y, target.y, { get current() { return velocityRef.y; }, set current(v) { velocityRef.y = v; } }, smoothTime, deltaTime, maxSpeed),
    z: smoothDamp1D(current.z, target.z, { get current() { return velocityRef.z; }, set current(v) { velocityRef.z = v; } }, smoothTime, deltaTime, maxSpeed),
  };
  if (out) return out.set(v.x, v.y, v.z);
  return new THREE.Vector3(v.x, v.y, v.z);
}

/**
 * Build a simple keyframe AnimationClip for a single Vector3 property.
 * Useful for node-state transitions (expand, pulse, drift).
 */
export function makeVectorClip(
  name: string,
  propertyPath: string, // e.g. ".position" or ".scale"
  durationSec: number,
  keyframes: Array<{ t: number; v: THREE.Vector3 }>,
): THREE.AnimationClip {
  const times: number[] = [];
  const values: number[] = [];
  keyframes.forEach((k) => {
    times.push(k.t * durationSec);
    values.push(k.v.x, k.v.y, k.v.z);
  });
  const track = new THREE.VectorKeyframeTrack(propertyPath, times, values);
  return new THREE.AnimationClip(name, durationSec, [track]);
}

/**
 * Build a clip that pulses a float property (e.g. emissiveIntensity).
 */
export function makePulseClip(
  name: string,
  propertyPath: string,
  baseValue: number,
  peakValue: number,
  periodSec = 1.6,
): THREE.AnimationClip {
  const track = new THREE.NumberKeyframeTrack(
    propertyPath,
    [0, periodSec * 0.25, periodSec * 0.5, periodSec * 0.75, periodSec],
    [
      baseValue,
      peakValue,
      baseValue,
      peakValue * 0.75,
      baseValue,
    ],
  );
  return new THREE.AnimationClip(name, periodSec, [track]);
}

/**
 * Procedural network-packet traversal — a single value that loops along an
 * edge. Returns a position in world space based on normalized progress.
 */
export function traverseEdge(
  a: THREE.Vector3,
  b: THREE.Vector3,
  progress: number,
  out?: THREE.Vector3,
): THREE.Vector3 {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  if (out) {
    return out.set(
      a.x + (b.x - a.x) * p,
      a.y + (b.y - a.y) * p,
      a.z + (b.z - a.z) * p,
    );
  }
  return new THREE.Vector3(
    a.x + (b.x - a.x) * p,
    a.y + (b.y - a.y) * p,
    a.z + (b.z - a.z) * p,
  );
}

/**
 * Build a helper clip that animates a mesh's scale for node "activation".
 */
export function makeNodeActivateClip(
  baseScale: number,
  peakScale: number,
  durationSec = 0.6,
): THREE.AnimationClip {
  const scaleIn = new THREE.Vector3(baseScale, baseScale, baseScale);
  const scaleOut = new THREE.Vector3(peakScale, peakScale, peakScale);
  return makeVectorClip('activate', '.scale', durationSec, [
    { t: 0, v: scaleIn },
    { t: 0.35, v: scaleOut },
    { t: 1, v: scaleIn },
  ]);
}
