"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import type * as THREE from "three"

interface TPFCoin3DProps {
  size?: number
  autoRotate?: boolean
  interactive?: boolean
  className?: string
}

function TPFCoinModel({ size = 1, interactive = true }: { size: number; interactive: boolean }) {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.01
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      if (interactive) {
        group.current.scale.setScalar(hovered ? size * 1.1 : size)
      }
    }
  })

  return (
    <group
      ref={group}
      scale={[size, size, size]}
      onPointerOver={() => interactive && setHovered(true)}
      onPointerOut={() => interactive && setHovered(false)}
    >
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.15, 64]} />
        <meshPhysicalMaterial
          color="#404040"
          metalness={0.95}
          roughness={0.15}
          reflectivity={0.9}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1, 0.08, 16, 64]} />
        <meshPhysicalMaterial
          color="#505050"
          metalness={0.95}
          roughness={0.15}
          reflectivity={0.9}
          clearcoat={0.4}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {[0.9, 0.75, 0.6, 0.45].map((radius, index) => (
        <mesh key={index} position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[radius, 0.08, 16, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={3.0}
            metalness={0}
            roughness={0.1}
          />
        </mesh>
      ))}

      <group position={[0, 0.075, 0]} rotation={[0, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.95, 64]} />
          <meshPhysicalMaterial
            color="#303030"
            metalness={0.95}
            roughness={0.15}
            reflectivity={0.9}
            clearcoat={0.2}
            clearcoatRoughness={0.2}
          />
        </mesh>

        <mesh position={[0, 0, 0.001]}>
          <circleGeometry args={[0.32, 64]} />
          <meshPhysicalMaterial
            color="#383838"
            metalness={0.95}
            roughness={0.15}
            reflectivity={0.9}
            clearcoat={0.1}
            clearcoatRoughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.08, 0.12]}>
          <boxGeometry args={[0.5, 0.03, 0.12]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.1}
            reflectivity={0.9}
            clearcoat={0.3}
            emissive="#ffffff"
            emissiveIntensity={2.0}
          />
        </mesh>

        <mesh position={[-0.23, -0.04, 0.12]}>
          <coneGeometry args={[0.13, 0.13, 3, 1]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            metalness={0}
            roughness={0.1}
          />
        </mesh>

        <mesh position={[0.23, -0.04, 0.12]}>
          <coneGeometry args={[0.13, 0.13, 3, 1]} rotation={[0, 0, -Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            metalness={0}
            roughness={0.1}
          />
        </mesh>
      </group>

      <group position={[0, -0.075, 0]} rotation={[Math.PI, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.95, 64]} />
          <meshPhysicalMaterial
            color="#303030"
            metalness={0.95}
            roughness={0.15}
            reflectivity={0.9}
            clearcoat={0.2}
            clearcoatRoughness={0.2}
          />
        </mesh>

        <mesh position={[0, 0, 0.001]}>
          <circleGeometry args={[0.32, 64]} />
          <meshPhysicalMaterial
            color="#383838"
            metalness={0.95}
            roughness={0.15}
            reflectivity={0.9}
            clearcoat={0.1}
            clearcoatRoughness={0.3}
          />
        </mesh>

        <mesh position={[0, -0.1, 0.12]}>
          <boxGeometry args={[0.5, 0.03, 0.12]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.8}
            roughness={0.1}
            reflectivity={0.9}
            clearcoat={0.3}
            emissive="#ffffff"
            emissiveIntensity={2.0}
          />
        </mesh>

        <mesh position={[-0.23, -0.06, 0.12]}>
          <coneGeometry args={[0.13, 0.13, 3, 1]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            metalness={0}
            roughness={0.1}
          />
        </mesh>

        <mesh position={[0.23, -0.06, 0.12]}>
          <coneGeometry args={[0.13, 0.13, 3, 1]} rotation={[0, 0, -Math.PI / 2]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            metalness={0}
            roughness={0.1}
          />
        </mesh>
      </group>

      {Array.from({ length: 24 }).map((_, i) => (
        <mesh
          key={i}
          position={[Math.cos((i / 24) * Math.PI * 2) * 1, Math.sin((i / 24) * Math.PI * 2) * 1, 0]}
          rotation={[0, 0, (i / 24) * Math.PI * 2]}
          scale={[0.03, 0.1, 0.03]}
        >
          <boxGeometry args={[1, 1, 0.2]} />
          <meshPhysicalMaterial color="#505050" metalness={0.95} roughness={0.15} reflectivity={0.9} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function TPFCoin3D({
  size = 1,
  autoRotate = true,
  interactive = true,
  className = "w-full h-64",
}: TPFCoin3DProps) {
  return (
    <div className={`${className} rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <Environment preset="studio" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#ffffff" />

        <TPFCoinModel size={size} interactive={interactive} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}
