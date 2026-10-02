import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Spring1D,
  Spring3D,
  makeVectorClip,
  makePulseClip,
  makeNodeActivateClip,
  traverseEdge,
  smoothDampVec3,
} from './utils/anim';

type NodeState = 'idle' | 'active' | 'warning' | 'error';

interface SceneNode {
  position: THREE.Vector3;
  origin: THREE.Vector3;
  mesh: THREE.Mesh;
  label: string;
  size: number;
  baseColor: number;
  primary: boolean;
  state: NodeState;
  mixer: THREE.AnimationMixer;
  breatheSpring: Spring3D;
  stateTimer: number;
}

interface Packet {
  mesh: THREE.Mesh;
  edgeIndex: number;
  speed: number;
  progress: number;
  phase: number;
}

const COLORS_DARK = {
  ambient: 0x050d1a,
  cyan: 0x00d4ff,
  violet: 0x7c3aed,
  pink: 0xf0abfc,
  warning: 0xf59e0b,
  error: 0xef4444,
  success: 0x22c55e,
  packet: 0x00d4ff,
  particle: 0x00d4ff,
};

const COLORS_LIGHT = {
  ambient: 0xe8f4ff,
  cyan: 0x00a8d8,
  violet: 0x8b5cf6,
  pink: 0xd946ef,
  warning: 0xf59e0b,
  error: 0xef4444,
  success: 0x22c55e,
  packet: 0x00a8d8,
  particle: 0x00a8d8,
};

interface NetworkSceneProps {
  reduced?: boolean;
}

export default function NetworkScene({ reduced = false }: NetworkSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveReduced = reduced || reducedMotion;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const PAL = isDark ? COLORS_DARK : COLORS_LIGHT;

    const renderer = new THREE.WebGLRenderer({ antialias: !effectiveReduced, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, effectiveReduced ? 1 : 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 0, 28);

    const clock = new THREE.Clock();

    // ---------- Mouse (camera follow, smooth-damped) ----------
    const mouseTarget = new THREE.Vector3(0, 0, 28);
    const cameraVelocity = new THREE.Vector3();
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 4.5;
      mouseTarget.y = -(e.clientY / window.innerHeight - 0.5) * 3;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ---------- Lights ----------
    scene.add(new THREE.AmbientLight(PAL.ambient, 2));

    const cyanLight = new THREE.PointLight(PAL.cyan, 80, 60);
    cyanLight.position.set(10, 8, 8);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(PAL.violet, 50, 50);
    violetLight.position.set(-10, -5, 5);
    scene.add(violetLight);

    // Spring-driven intensity pulsing
    const cyanIntensitySpring = new Spring1D(80, 40);
    cyanIntensitySpring.target = 80;
    const violetIntensitySpring = new Spring1D(50, 25);
    violetIntensitySpring.target = 50;

    // ---------- Node definitions ----------
    const nodeData = [
      { label: 'Client', x: -8, y: 5, z: 2, size: 0.55, color: PAL.cyan, primary: true },
      { label: 'API Gateway', x: 0, y: 5, z: 0, size: 0.7, color: PAL.cyan, primary: true },
      { label: 'Auth Service', x: -5, y: 1, z: 1, size: 0.5, color: PAL.violet, primary: false },
      { label: 'Core Service', x: 0, y: 1, z: 0, size: 0.8, color: PAL.cyan, primary: true },
      { label: 'Worker', x: 5, y: 1, z: 2, size: 0.5, color: PAL.violet, primary: false },
      { label: 'Cache', x: -4, y: -3, z: 1, size: 0.45, color: PAL.pink, primary: false },
      { label: 'Queue', x: 4, y: -2, z: -1, size: 0.5, color: PAL.violet, primary: false },
      { label: 'Database', x: 0, y: -5, z: 0, size: 0.75, color: PAL.cyan, primary: true },
      { label: 'Storage', x: 5, y: -5, z: 1, size: 0.45, color: PAL.pink, primary: false },
      { label: 'Analytics', x: -5, y: -5, z: -1, size: 0.45, color: PAL.violet, primary: false },
      { label: 'CDN', x: 8, y: 4, z: -2, size: 0.4, color: PAL.pink, primary: false },
      { label: 'Monitor', x: 7, y: -1, z: 3, size: 0.4, color: PAL.pink, primary: false },
      { label: 'Infra', x: -7, y: -1, z: -2, size: 0.4, color: PAL.violet, primary: false },
    ];

    const nodeCount = effectiveReduced ? Math.floor(nodeData.length * 0.6) : nodeData.length;
    const nodes: SceneNode[] = [];

    nodeData.slice(0, nodeCount).forEach((d, i) => {
      const geo = new THREE.SphereGeometry(d.size, effectiveReduced ? 8 : 16, effectiveReduced ? 8 : 16);
      const mat = new THREE.MeshStandardMaterial({
        color: d.color,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: d.primary ? 0.9 : 0.6,
        emissive: new THREE.Color(d.color),
        emissiveIntensity: d.primary ? 0.4 : 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.x, d.y, d.z);
      scene.add(mesh);

      // Mixer per node for keyframe clips
      const mixer = new THREE.AnimationMixer(mesh);

      // Build and schedule the breathing pulse clip on emissiveIntensity
      const pulseClip = makePulseClip(
        `pulse-${i}`,
        '.material.emissiveIntensity',
        d.primary ? 0.35 : 0.12,
        d.primary ? 0.85 : 0.45,
        1.4 + (i % 5) * 0.2,
      );
      const pulseAction = mixer.clipAction(pulseClip);
      pulseAction.setLoop(THREE.LoopPingPong, Infinity);
      pulseAction.play();

      // Activation clip (playable on-demand). Schedule at 0 weight for blending.
      const activateClip = makeNodeActivateClip(1, 1.18, 0.7);
      const activateAction = mixer.clipAction(activateClip);
      activateAction.setLoop(THREE.LoopOnce, 1);
      activateAction.setEffectiveWeight(0);
      activateAction.clampWhenFinished = true;

      // Breathing spring — tugs node back to origin
      const breatheSpring = new Spring3D(18, 6);
      breatheSpring.reset(mesh.position.clone());

      nodes.push({
        position: mesh.position,
        origin: mesh.position.clone(),
        mesh,
        label: d.label,
        size: d.size,
        baseColor: d.color,
        primary: d.primary,
        state: 'idle',
        mixer,
        breatheSpring,
        stateTimer: Math.random() * 6 + 3, // random initial "activation" cadence
      });
    });

    // ---------- Edges ----------
    const edgePairs: Array<[number, number]> = [
      [0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [3, 6], [3, 7],
      [2, 5], [4, 6], [6, 4], [7, 8], [7, 9], [0, 10], [4, 11], [2, 12],
    ];

    const lineGroup = new THREE.Group();
    const lineMats = {
      primary: new THREE.LineBasicMaterial({ color: PAL.cyan, transparent: true, opacity: 0.2 }),
      secondary: new THREE.LineBasicMaterial({ color: PAL.violet, transparent: true, opacity: 0.12 }),
    };

    edgePairs.forEach(([a, b]) => {
      if (a >= nodeCount || b >= nodeCount) return;
      const points = [nodes[a].position.clone(), nodes[b].position.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, a < 4 ? lineMats.primary : lineMats.secondary);
      lineGroup.add(line);
    });
    scene.add(lineGroup);

    // ---------- Packets (data traversing edges) ----------
    const packets: Packet[] = [];
    if (!effectiveReduced && !reducedMotion) {
      const packetGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const activeEdges = edgePairs.filter(([a, b]) => a < nodeCount && b < nodeCount);
      const packetCount = Math.min(activeEdges.length * 2, 18);
      for (let p = 0; p < packetCount; p++) {
        const packetMat = new THREE.MeshBasicMaterial({
          color: PAL.packet,
          transparent: true,
          opacity: 0.85,
        });
        const mesh = new THREE.Mesh(packetGeo, packetMat);
        scene.add(mesh);
        packets.push({
          mesh,
          edgeIndex: p % activeEdges.length,
          speed: 0.08 + Math.random() * 0.14,
          progress: Math.random(),
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // ---------- Starfield / ambient particles ----------
    if (!effectiveReduced) {
      const pCount = 800;
      const pPos = new Float32Array(pCount * 3);
      const pPhase = new Float32Array(pCount);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 50;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 50;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
        pPhase[i] = Math.random() * Math.PI * 2;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: PAL.particle,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
      });
      const particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);
    }

    // ---------- Theme observer ----------
    const onThemeChange = () => {
      const dark = document.documentElement.getAttribute('data-theme') !== 'light';
      const palette = dark ? COLORS_DARK : COLORS_LIGHT;
      nodes.forEach((n) => {
        const mat = n.mesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(n.baseColor === PAL.cyan || n.baseColor === COLORS_DARK.cyan
          ? palette.cyan
          : n.baseColor === PAL.violet || n.baseColor === COLORS_DARK.violet
          ? palette.violet
          : palette.pink);
        mat.emissive.copy(mat.color);
      });
      (lineMats.primary as THREE.LineBasicMaterial).color.setHex(palette.cyan);
      (lineMats.secondary as THREE.LineBasicMaterial).color.setHex(palette.violet);
      packets.forEach((p) => {
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(palette.packet);
      });
      (scene.children.find((c) => c.type === 'AmbientLight') as THREE.AmbientLight)?.color.setHex(palette.ambient);
      cyanLight.color.setHex(palette.cyan);
      violetLight.color.setHex(palette.violet);
    };
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ---------- Resize ----------
    const onResize = () => {
      const w2 = mount.clientWidth;
      const h2 = mount.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    // ---------- Animation loop ----------
    let animId: number;
    const tmpVec3 = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();

      // Smooth-damped camera toward mouse target
      smoothDampVec3(camera.position, mouseTarget, cameraVelocity, 0.7, dt, Infinity, camera.position);
      camera.lookAt(0, 0, 0);

      // Drive springs for light intensity (ambient pulse)
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.7);
      cyanIntensitySpring.target = 80 + pulse * 25;
      violetIntensitySpring.target = 50 + Math.cos(t * 0.6) * 18;
      cyanLight.intensity = cyanIntensitySpring.update(dt);
      violetLight.intensity = violetIntensitySpring.update(dt);

      // Nodes
      nodes.forEach((n, i) => {
        // Animation mixer (emissive pulse clips, state clips)
        n.mixer.update(dt);

        if (!reducedMotion) {
          // Spring-breathing toward origin with a gentle oscillation overlay
          n.breatheSpring.target.copy(n.origin);
          const breathOut = n.breatheSpring.update(dt, tmpVec3);
          const wobble = effectiveReduced ? 0.001 : 0.006;
          n.position.set(
            breathOut.x + Math.sin(t * 0.8 + i) * wobble,
            breathOut.y + Math.cos(t * 0.6 + i * 0.7) * wobble,
            breathOut.z + Math.sin(t * 0.4 + i * 1.3) * wobble * 0.6,
          );

          // State cadence: every few seconds a node "activates" and plays its clip
          n.stateTimer -= dt;
          if (n.stateTimer <= 0 && n.state === 'idle') {
            const actions = (n.mixer as any)._actions as Map<number, THREE.AnimationAction>;
            for (const action of actions.values()) {
              if ((action as any)._clip && (action as any)._clip.name && (action as any)._clip.name.startsWith('activate')) {
                action.reset();
                action.setEffectiveWeight(1);
                action.setLoop(THREE.LoopOnce, 1);
                action.fadeIn(0.08);
                action.play();
                // Fade out clip back to breathing pulse shortly before end
                const dur = (action as any)._clip.duration || 0.7;
                setTimeout(() => action.fadeOut(0.25), (dur - 0.3) * 1000);
                n.state = 'active';
                setTimeout(() => {
                  n.state = 'idle';
                  n.stateTimer = 4 + Math.random() * 7;
                }, dur * 1000);
              }
            }
          }
        }
      });

      // Update edge geometry
      let edgeIdx = 0;
      lineGroup.children.forEach((child) => {
        const line = child as THREE.Line;
        const pair = edgePairs[edgeIdx];
        if (!pair) return;
        const [a, b] = pair;
        if (a >= nodeCount || b >= nodeCount) {
          edgeIdx++;
          return;
        }
        const pos = line.geometry.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, nodes[a].position.x, nodes[a].position.y, nodes[a].position.z);
        pos.setXYZ(1, nodes[b].position.x, nodes[b].position.y, nodes[b].position.z);
        pos.needsUpdate = true;
        edgeIdx++;
      });

      // Packets
      if (!reducedMotion) {
        const activeEdges = edgePairs.filter(([a, b]) => a < nodeCount && b < nodeCount);
        packets.forEach((p) => {
          p.progress += p.speed * dt;
          if (p.progress >= 1) {
            p.progress = 0;
            p.edgeIndex = Math.floor(Math.random() * activeEdges.length);
            p.phase = Math.random() * Math.PI * 2;
          }
          const [a, b] = activeEdges[p.edgeIndex];
          traverseEdge(nodes[a].position, nodes[b].position, p.progress, p.mesh.position);
          // Radial oscillation perpendicular to the edge (tiny hop effect)
          const offset = Math.sin(t * 4 + p.phase) * 0.08;
          const edgeLen = nodes[a].position.distanceTo(nodes[b].position);
          p.mesh.position.y += (offset / (edgeLen || 1)) * 0.2;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // ---------- Teardown ----------
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      themeObserver.disconnect();

      // Dispose geometries, materials, and render target
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else (obj.material as THREE.Material)?.dispose();
        } else if (obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          (obj.material as THREE.Material)?.dispose();
        } else if (obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          (obj.material as THREE.Material)?.dispose();
        }
      });
      nodes.forEach((n) => n.mixer.stopAllAction());
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [reduced]);

  return <div ref={mountRef} className="absolute inset-0" />;
}
