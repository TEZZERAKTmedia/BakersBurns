import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const Background3D = () => {
  const { scene } = useGLTF('../models/logoanimation.glb'); // Correct path to your GLB file

  

  return (
    <primitive object={scene} scale={[1, 1, 1]} />
  );
};

export default Background3D;
