import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function GradientSphere3D({ color1 = "#06b6d4", color2 = "#8b5cf6", speed = 0.4 }) {
  return (
    <div className="w-full h-full absolute inset-0 opacity-30">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 2, 1]} intensity={1} />
        <Sphere args={[1, 100, 200]} scale={2.2}>
          <MeshDistortMaterial
            color={color1}
            attach="material"
            distort={0.4}
            speed={speed}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}