"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Text } from "@react-three/drei"
import * as THREE from "three"

export function TechGlobe() {
  const globeRef = useRef<THREE.Group>(null)
  const wireframeRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const ringsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Main globe rotation
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.005
      globeRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
    }

    // Wireframe counter-rotation
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= 0.003
      wireframeRef.current.rotation.z += 0.001
    }

    // Particle field rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.002
      particlesRef.current.rotation.x = Math.sin(time * 0.2) * 0.05
    }

    // Rings rotation
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, index) => {
        if (ring && ring.rotation) {
          ring.rotation.z += 0.01 + index * 0.002
          ring.rotation.x += 0.005 + index * 0.001
        }
      })
    }
  })

  // Create particle positions around the globe
  const particleCount = 1500
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const radius = 2.5 + Math.random() * 2
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // Color variation
    const colorChoice = Math.random()
    if (colorChoice < 0.33) {
      colors[i * 3] = 0 // R
      colors[i * 3 + 1] = 1 // G (cyan)
      colors[i * 3 + 2] = 1 // B
    } else if (colorChoice < 0.66) {
      colors[i * 3] = 1 // R (magenta)
      colors[i * 3 + 1] = 0 // G
      colors[i * 3 + 2] = 1 // B
    } else {
      colors[i * 3] = 0 // R (blue)
      colors[i * 3 + 1] = 0.5 // G
      colors[i * 3 + 2] = 1 // B
    }
  }

  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.6} color="#00ffff" />
      <pointLight position={[5, -5, 10]} intensity={0.4} color="#ff6b6b" />

      {/* Main Globe Group */}
      <group ref={globeRef}>
        {/* Core Sphere */}
        <Sphere args={[1.5, 64, 64]}>
          <meshPhongMaterial
            color="#0a0a1a"
            transparent
            opacity={0.9}
            emissive="#1a237e"
            emissiveIntensity={0.3}
            shininess={100}
          />
        </Sphere>

        {/* Inner Glow Layer */}
        <Sphere args={[1.55, 32, 32]}>
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.15} side={THREE.BackSide} />
        </Sphere>

        {/* Outer Glow Layer */}
        <Sphere args={[1.7, 32, 32]}>
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.08} side={THREE.BackSide} />
        </Sphere>
      </group>

      {/* Wireframe Globe Layers */}
      <group ref={wireframeRef}>
        {/* Primary Wireframe */}
        <Sphere args={[1.8, 24, 12]}>
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.4} />
        </Sphere>

        {/* Secondary Wireframe */}
        <Sphere args={[1.9, 16, 8]}>
          <meshBasicMaterial color="#ff6b6b" wireframe transparent opacity={0.2} />
        </Sphere>
      </group>

      {/* Enhanced Particle Field */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Rotating Tech Rings */}
      <group ref={ringsRef}>
        {/* Ring 1 - Horizontal */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.02, 8, 100]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} emissive="#00ffff" emissiveIntensity={0.2} />
        </mesh>

        {/* Ring 2 - Vertical */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.4, 0.02, 8, 100]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.5} emissive="#ff6b6b" emissiveIntensity={0.2} />
        </mesh>

        {/* Ring 3 - Diagonal */}
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[2.6, 0.02, 8, 100]} />
          <meshBasicMaterial color="#4ecdc4" transparent opacity={0.4} emissive="#4ecdc4" emissiveIntensity={0.2} />
        </mesh>

        {/* Ring 4 - Counter Diagonal */}
        <mesh rotation={[-Math.PI / 4, -Math.PI / 4, Math.PI / 2]}>
          <torusGeometry args={[2.8, 0.015, 8, 100]} />
          <meshBasicMaterial color="#ffd93d" transparent opacity={0.3} emissive="#ffd93d" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* Data Streams - Curved Lines */}
      <group>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
            <torusGeometry args={[3 + i * 0.1, 0.005, 4, 50]} />
            <meshBasicMaterial color={`hsl(${180 + i * 30}, 70%, 60%)`} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* Floating Holographic Text */}
      <Text
        position={[0, -3.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        // font="/fonts/Geist-Bold.ttf" // Removido para evitar erro de fonte não encontrada
        outlineWidth={0.02}
        outlineColor="#00ffff"
      >
        KeplerPay
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, -4.2, 0]}
        fontSize={0.15}
        color="#4fc3f7"
        anchorX="center"
        anchorY="middle"
        // font="/fonts/Geist-Regular.ttf" // Removido para evitar erro de fonte não encontrada
        transparent
        opacity={0.8}
      >
        Decentralized Future
      </Text>
    </>
  )
}
