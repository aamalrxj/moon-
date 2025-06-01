import React, { useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";

const MOON_TEXTURE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1024px-FullMoon2010.jpg";

const Moon3D = () => {
  const texture = useLoader(TextureLoader, MOON_TEXTURE_URL);
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0.4, 0.4, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

export default Moon3D;
