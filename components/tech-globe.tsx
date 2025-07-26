"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import Image from "next/image"

export function TechGlobe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeGroupRef = useRef<THREE.Group | null>(null)
  const wireframeGroupRef = useRef<THREE.Group | null>(null) // Re-adicionado
  const particlesRef = useRef<THREE.Points | null>(null)
  const ringsGroupRef = useRef<THREE.Group | null>(null) // Re-adicionado

  useEffect(() => {
    if (!mountRef.current) return

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    // Adjusted camera position for a much more compact globe
    camera.position.set(0, 0, 2.5)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // Main Globe Group
    const globeGroup = new THREE.Group()
    globeGroupRef.current = globeGroup
    scene.add(globeGroup)

    // Core Sphere - Adjusted to be dark gray/black with subtle emissive
    const coreGeometry = new THREE.SphereGeometry(0.7, 64, 64)
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a, // Dark gray/almost black
      transparent: true,
      opacity: 0.9,
      emissive: 0x050505, // Very subtle dark gray emissive
      emissiveIntensity: 0.3,
      shininess: 100,
    })
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial)
    globeGroup.add(coreSphere)

    // Inner Glow Layer - Changed to white and adjusted opacity
    const innerGlowGeometry = new THREE.SphereGeometry(0.75, 32, 32)
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White
      transparent: true,
      opacity: 0.1, // Slightly reduced opacity
      side: THREE.BackSide,
    })
    const innerGlowSphere = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial)
    globeGroup.add(innerGlowSphere)

    // Outer Glow Layer - Changed to white and adjusted opacity
    const outerGlowGeometry = new THREE.SphereGeometry(0.85, 32, 32)
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White
      transparent: true,
      opacity: 0.05, // Slightly reduced opacity
      side: THREE.BackSide,
    })
    const outerGlowSphere = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial)
    globeGroup.add(outerGlowSphere)

    // Wireframe Globe Layers - Re-adicionado e confirmado branco
    const wireframeGroup = new THREE.Group()
    wireframeGroupRef.current = wireframeGroup
    globeGroup.add(wireframeGroup)

    const primaryWireframeGeometry = new THREE.SphereGeometry(0.9, 24, 12)
    const primaryWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const primaryWireframe = new THREE.Mesh(primaryWireframeGeometry, primaryWireframeMaterial)
    wireframeGroup.add(primaryWireframe)

    const secondaryWireframeGeometry = new THREE.SphereGeometry(0.95, 16, 8)
    const secondaryWireframeMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xffffff, // White
      transparent: true,
      opacity: 0.2,
    })
    const secondaryWireframe = new THREE.Mesh(secondaryWireframeGeometry, secondaryWireframeMaterial)
    wireframeGroup.add(secondaryWireframe)

    // Enhanced Particle Field - Confirmado branco
    const particleCount = 1000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Set all particles to white
      colors[i * 3] = 1 // R
      colors[i * 3 + 1] = 1 // G
      colors[i * 3 + 2] = 1 // B
    }

    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.015, // Smaller particles
      vertexColors: true,
      transparent: true,
      opacity: 0.6, // Slightly reduced opacity
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    particlesRef.current = particles
    scene.add(particles)

    // Rotating Tech Rings - Re-adicionado e confirmado branco
    const ringsGroup = new THREE.Group()
    ringsGroupRef.current = ringsGroup
    scene.add(ringsGroup)

    const ringMaterial = (opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff, // White
        transparent: true,
        opacity: opacity,
        emissive: 0xffffff, // White emissive
        emissiveIntensity: 0.1, // Reduced emissive intensity
      })

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.015, 8, 100), ringMaterial(0.4))
    ring1.rotation.x = Math.PI / 2
    ringsGroup.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.015, 8, 100), ringMaterial(0.3))
    ring2.rotation.y = Math.PI / 2
    ringsGroup.add(ring2)

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.015, 8, 100), ringMaterial(0.2))
    ring3.rotation.set(Math.PI / 4, Math.PI / 4, 0)
    ringsGroup.add(ring3)

    const ring4 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.01, 8, 100), ringMaterial(0.1))
    ring4.rotation.set(-Math.PI / 4, -Math.PI / 4, Math.PI / 2)
    ringsGroup.add(ring4)

    // Data Streams - Curved Lines - Re-adicionado e confirmado branco
    for (let i = 0; i < 6; i++) {
      const streamGeometry = new THREE.TorusGeometry(1.4 + i * 0.03, 0.003, 4, 50)
      const streamMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // White
        transparent: true,
        opacity: 0.4, // Reduced opacity
      })
      const stream = new THREE.Mesh(streamGeometry, streamMaterial)
      stream.rotation.y = (i * Math.PI) / 3
      globeGroup.add(stream)
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      const time = performance.now() * 0.001

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.005
        globeGroupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1
      }

      if (wireframeGroupRef.current) {
        wireframeGroupRef.current.rotation.y -= 0.003
        wireframeGroupRef.current.rotation.z += 0.001
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.002
        particlesRef.current.rotation.x = Math.sin(time * 0.2) * 0.05
      }

      if (ringsGroupRef.current) {
        ringsGroupRef.current.children.forEach((ring, index) => {
          ring.rotation.z += 0.01 + index * 0.002
          ring.rotation.x += 0.005 + index * 0.001
        })
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      }
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
            if (object.geometry) {
              object.geometry.dispose()
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat) => mat.dispose())
              } else {
                object.material.dispose()
              }
            }
          }
        })
      }
    }
  }, [])

  return (
    <div ref={mountRef} className="w-full h-full relative flex items-center justify-center">
      {/* Logo and Vibration Effect inside the globe container */}
      <div
        className="absolute w-24 h-24 flex items-center justify-center top-1/2 -translate-y-1/2 right-0 mr-20"
        style={{
          animation: "vibrateLogo 0.08s linear infinite",
        }}
      >
        <div
          className="absolute inset-0 bg-white rounded-full shadow-2xl"
          style={{
            boxShadow: `
              0 0 25px rgba(255,255,255,1),
              0 0 50px rgba(229,231,235,0.8),
              0 0 75px rgba(209,213,219,0.6),
              0 0 100px rgba(156,163,175,0.4)
            `,
            animation: "pulse 0.5s ease-in-out infinite",
          }}
        />
        <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden bg-white p-1">
          <Image
            src="/images/codepulse-logo.png"
            alt="PulseCode Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            style={{
              animation: "vibrateLogoImage 0.1s linear infinite",
            }}
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes vibrateLogo {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-0.5px, 0.5px); }
          50% { transform: translate(0.5px, -0.5px); }
          75% { transform: translate(-0.5px, -0.5px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes vibrateLogoImage {
          0% { transform: translate(0, 0); }
          25% { transform: translate(0.2px, -0.2px); }
          50% { transform: translate(-0.2px, 0.2px); }
          75% { transform: translate(0.2px, 0.2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
