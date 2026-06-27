'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

function wrapIndex(index, total) {
  if (!total) return 0;
  return ((index % total) + total) % total;
}

function disposeObject(root) {
  root?.traverse?.((child) => {
    if (!child.isMesh) return;
    child.geometry?.dispose?.();

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      Object.values(material).forEach((value) => {
        if (value?.isTexture) value.dispose();
      });
      material.dispose?.();
    });
  });
}

function fitModelToStage(root) {
  root.updateMatrixWorld(true);

  const originalBox = new THREE.Box3().setFromObject(root);
  const originalSize = new THREE.Vector3();
  originalBox.getSize(originalSize);

  const maxAxis = Math.max(originalSize.x, originalSize.y, originalSize.z) || 1;
  const targetSize = 2.82;
  const scale = targetSize / maxAxis;
  root.scale.setScalar(scale);

  root.updateMatrixWorld(true);
  const fittedBox = new THREE.Box3().setFromObject(root);
  const fittedCenter = new THREE.Vector3();
  fittedBox.getCenter(fittedCenter);

  root.position.x -= fittedCenter.x;
  root.position.z -= fittedCenter.z;
  root.position.y += -1.32 - fittedBox.min.y;
}

function BackgroundMedia() {
  const [mode, setMode] = useState('video');

  return (
    <div className="backgroundMediaLayer" aria-hidden="true">
      {mode === 'video' ? (
        <video
          className="backgroundMedia"
          src="/backgrounds/background.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setMode('image')}
        />
      ) : null}

      {mode === 'image' ? (
        <img
          className="backgroundMedia"
          src="/backgrounds/background.jpg"
          alt=""
          onError={() => setMode('none')}
        />
      ) : null}
    </div>
  );
}

function SparkleParticles() {
  const brightRef = useRef(null);
  const dustRef = useRef(null);

  const brightPositions = useMemo(() => {
    const count = 320;
    const array = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const stride = index * 3;
      array[stride] = (Math.random() - 0.5) * 13.5;
      array[stride + 1] = (Math.random() - 0.5) * 15.5;
      array[stride + 2] = (Math.random() - 0.5) * 8.5;
    }

    return array;
  }, []);

  const dustPositions = useMemo(() => {
    const count = 520;
    const array = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const stride = index * 3;
      array[stride] = (Math.random() - 0.5) * 16;
      array[stride + 1] = (Math.random() - 0.5) * 18;
      array[stride + 2] = (Math.random() - 0.5) * 11;
    }

    return array;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (brightRef.current) {
      brightRef.current.rotation.y = time * 0.035;
      brightRef.current.rotation.x = Math.sin(time * 0.14) * 0.035;
      brightRef.current.position.y = Math.sin(time * 0.32) * 0.1;
      brightRef.current.material.opacity = 0.72 + Math.sin(time * 1.8) * 0.22;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = -time * 0.022;
      dustRef.current.rotation.z = Math.sin(time * 0.08) * 0.025;
      dustRef.current.position.y = Math.cos(time * 0.22) * 0.08;
      dustRef.current.material.opacity = 0.28 + Math.sin(time * 1.15) * 0.08;
    }
  });

  return (
    <>
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustPositions.length / 3}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#2dff4d"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={brightRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={brightPositions.length / 3}
            array={brightPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a8ff7d"
          size={0.115}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function NeonFloorGrid() {
  const gridRef = useRef(null);

  useFrame((state) => {
    if (!gridRef.current) return;

    const opacity = 0.18 + Math.sin(state.clock.elapsedTime * 0.9) * 0.045;
    const materials = Array.isArray(gridRef.current.material)
      ? gridRef.current.material
      : [gridRef.current.material];

    materials.forEach((material) => {
      if (!material) return;
      material.transparent = true;
      material.opacity = opacity;
    });

    gridRef.current.position.z = (state.clock.elapsedTime * 0.42) % 1;
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[18, 36, '#54ff39', '#143d12']}
      position={[0, -3.05, -1.2]}
    />
  );
}
function BackgroundFX() {
  return (
    <div className="backgroundFxLayer" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 6, 13]} />
        <SparkleParticles />
        <NeonFloorGrid />
      </Canvas>
    </div>
  );
}

function GLBModel({ url, rotationY, onStatusChange }) {
  const groupRef = useRef(null);
  const mixerRef = useRef(null);
  const [object, setObject] = useState(null);

  useEffect(() => {
    let alive = true;
    let loadedRoot = null;
    const loader = new GLTFLoader();

    setObject(null);
    mixerRef.current = null;
    onStatusChange?.({ type: 'loading', url });

    loader.load(
      url,
      (gltf) => {
        if (!alive) return;

        const root = cloneSkeleton(gltf.scene);
        loadedRoot = root;

        root.traverse((child) => {
          if (!child.isMesh) return;

          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;

          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (!material) return;
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
          });
        });

        fitModelToStage(root);

        if (gltf.animations?.length) {
          const mixer = new THREE.AnimationMixer(root);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          mixerRef.current = mixer;
        }

        setObject(root);
        onStatusChange?.({ type: 'ready', url });
      },
      undefined,
      (error) => {
        if (!alive) return;
        onStatusChange?.({
          type: 'error',
          url,
          message: error?.message || `Could not load ${url}`
        });
      }
    );

    return () => {
      alive = false;
      mixerRef.current?.stopAllAction?.();
      mixerRef.current = null;
      disposeObject(loadedRoot);
    };
  }, [url, onStatusChange]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);

    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationY, 0.18);
  });

  if (!object) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={object} />
    </group>
  );
}

function OutfitScene({ outfit, rotationY, onStatusChange }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.46, 5.35], fov: 37 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3.5, 5.5, 4.5]} intensity={1.95} color="#d9ffd0" castShadow />
      <directionalLight position={[-4.5, 2.4, -3.8]} intensity={0.95} color="#96ff7f" />
      <directionalLight position={[0, 1.5, 4]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 0.8, 2.6]} intensity={1.25} color="#9dff88" distance={10} />
      <pointLight position={[0, -0.7, 1.2]} intensity={0.85} color="#45ff2e" distance={6} />

      <GLBModel
        key={outfit.file}
        url={outfit.file}
        rotationY={rotationY}
        onStatusChange={onStatusChange}
      />

      <ContactShadows position={[0, -1.32, 0]} opacity={0.34} scale={4.8} blur={2.9} far={2.7} color="#4cff38" />
      <Environment preset="night" />
    </Canvas>
  );
}

export default function OutfitSelect() {
  const [outfits, setOutfits] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listStatus, setListStatus] = useState('loading');
  const [modelStatus, setModelStatus] = useState({ type: 'idle' });
  const [rotationY, setRotationY] = useState(0);

  const pointerRef = useRef(null);
  const trackRef = useRef(null);
  const activeOutfit = outfits[activeIndex];

  const selectOutfit = useCallback(
    (index) => {
      if (!outfits.length) return;
      setActiveIndex(wrapIndex(index, outfits.length));
      setRotationY(0);
    },
    [outfits.length]
  );

  const next = useCallback(() => selectOutfit(activeIndex + 1), [activeIndex, selectOutfit]);
  const previous = useCallback(() => selectOutfit(activeIndex - 1), [activeIndex, selectOutfit]);

  const countText = useMemo(() => {
    if (!outfits.length) return '00 / 00';
    return `${String(activeIndex + 1).padStart(2, '0')} / ${String(outfits.length).padStart(2, '0')}`;
  }, [activeIndex, outfits.length]);

  useEffect(() => {
    let alive = true;

    async function loadOutfitList() {
      try {
        setListStatus('loading');
        const response = await fetch('/api/outfits', { cache: 'no-store' });
        const data = await response.json();

        if (!alive) return;

        const glbOutfits = Array.isArray(data.outfits) ? data.outfits : [];
        setOutfits(glbOutfits);
        setActiveIndex(0);
        setRotationY(0);
        setListStatus(glbOutfits.length ? 'ready' : 'empty');
      } catch (error) {
        if (!alive) return;
        setOutfits([]);
        setListStatus('error');
      }
    }

    loadOutfitList();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!outfits.length) return;
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
      if (event.key.toLowerCase() === 'a') setRotationY((value) => value - 0.35);
      if (event.key.toLowerCase() === 'd') setRotationY((value) => value + 0.35);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, outfits.length, previous]);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.querySelector(`[data-card-index="${activeIndex}"]`);
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIndex]);

  const handlePointerDown = (event) => {
    if (!outfits.length) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointerRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      startedAt: performance.now(),
      moved: false
    };
  };

  const handlePointerMove = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const dx = event.clientX - pointer.lastX;
    const totalX = event.clientX - pointer.startX;
    const totalY = event.clientY - pointer.startY;

    pointer.lastX = event.clientX;
    pointer.moved = Math.abs(totalX) > 4 || Math.abs(totalY) > 4;

    if (Math.abs(totalX) > Math.abs(totalY) || pointer.moved) {
      event.preventDefault();
      setRotationY((value) => value + dx * 0.012);
    }
  };

  const handlePointerUp = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;

    const totalX = event.clientX - pointer.startX;
    const totalY = event.clientY - pointer.startY;
    const elapsed = performance.now() - pointer.startedAt;
    const swipeDistance = Math.max(118, window.innerWidth * 0.32);
    const isFastEnough = elapsed < 900;
    const isHorizontal = Math.abs(totalX) > Math.abs(totalY) * 1.35;
    const isChangeSwipe = Math.abs(totalX) > swipeDistance && isFastEnough && isHorizontal;

    pointerRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (!isChangeSwipe) return;
    if (totalX < 0) next();
    else previous();
  };

  const statusText = useMemo(() => {
    if (listStatus === 'loading') return 'Scanning public/outfits for .glb files...';
    if (listStatus === 'empty') return 'No .glb outfits found. Add files to public/outfits and refresh.';
    if (listStatus === 'error') return 'Could not read the outfit list.';
    if (modelStatus.type === 'loading') return 'Loading GLB outfit...';
    if (modelStatus.type === 'error') return 'This GLB could not load. Check the filename or export settings.';
    return 'Drag to rotate. Swipe far left/right to change outfit.';
  }, [listStatus, modelStatus.type]);

  return (
    <main className="outfitPage">
      <section className="selectorShell">
        <BackgroundMedia />
        <BackgroundFX />
        <div className="screenShade" />

        <header className="topHud">
          <p className="eyebrow">GLB Outfit Select</p>
          <h1>{activeOutfit?.name || 'Add GLB Outfits'}</h1>
          <span>{countText}</span>
        </header>

        <div className="helpPill">{statusText}</div>

        <div
          className="viewerFrame"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            pointerRef.current = null;
          }}
        >
          <button
            className="arrowButton left"
            aria-label="Previous outfit"
            onClick={previous}
            disabled={!outfits.length}
          >
            ‹
          </button>

          {activeOutfit ? (
            <OutfitScene
              outfit={activeOutfit}
              rotationY={rotationY}
              onStatusChange={setModelStatus}
            />
          ) : (
            <div className="emptyStage">
              <strong>.glb only</strong>
              <span>Drop your files into public/outfits</span>
            </div>
          )}

          <button
            className="arrowButton right"
            aria-label="Next outfit"
            onClick={next}
            disabled={!outfits.length}
          >
            ›
          </button>
        </div>

        <nav className="outfitTrack" ref={trackRef} aria-label="GLB outfit list">
          {outfits.length ? (
            outfits.map((outfit, index) => (
              <button
                key={outfit.file}
                data-card-index={index}
                className={`outfitCard ${index === activeIndex ? 'active' : ''}`}
                onClick={() => selectOutfit(index)}
              >
                <span className="cardNumber">{String(index + 1).padStart(2, '0')}</span>
                <span className="cardName">{outfit.name}</span>
                <span className="cardType">GLB</span>
              </button>
            ))
          ) : (
            <div className="emptyCards">
              Add files named like <strong>outfit-01.glb</strong>, <strong>outfit-02.glb</strong>, then refresh.
            </div>
          )}
        </nav>
      </section>
    </main>
  );
}
