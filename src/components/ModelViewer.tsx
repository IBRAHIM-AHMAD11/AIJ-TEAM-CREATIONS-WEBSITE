// components/ModelViewer.tsx
"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function FitCameraToModel({ children }: { children: React.ReactNode }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Compute bounding box from all meshes in the group
    const box = new THREE.Box3().setFromObject(groupRef.current);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Calculate the maximum dimension to fit nicely
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const cameraDistance = maxDim / (2 * Math.tan(fov / 2));

    // Position the camera to look at the center from a distance
    camera.position.set(center.x, center.y, center.z + cameraDistance * 1.5);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [camera, children]);

  return <group ref={groupRef}>{children}</group>;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2; // gentle auto-rotation
    }
  });

  return (
    <FitCameraToModel>
      <primitive ref={ref} object={scene} />
    </FitCameraToModel>
  );
}

export default function ModelViewer({ src, className }: { src: string; className?: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      }
    }
    loadModel();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  if (error) {
    return (
      <div className={className ?? "w-full aspect-square flex items-center justify-center text-sm text-red-500"}>
        Failed to load 3D model: {error}
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className={className ?? "w-full aspect-square flex items-center justify-center text-gray-500 animate-pulse"}>
        Loading 3D model…
      </div>
    );
  }

  return (
    <div className={className ?? "w-full aspect-square"}>
      <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Model url={blobUrl} />
          <Environment preset="city" />
          <OrbitControls enableZoom enablePan dampingFactor={0.1} />
        </Suspense>
      </Canvas>
    </div>
  );
}