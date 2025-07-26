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
  const wireframeGroupRef = useRef<THREE.Group | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const ringsGroupRef = useRef<THREE.Group | null>(null)

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
    camera.position.set(0, 0, 2.5) // Further reduced from 3.5

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.2))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.6)
    pointLight1.position.set(-10, -10, -5)
    scene.add(pointLight1)
    const pointLight2 = new THREE.PointLight(0xff6b6b, 0.4)
    pointLight2.position.set(5, -5, 10)
    scene.add(pointLight2)

    // Main Globe Group
    const globeGroup = new THREE.Group()
    globeGroupRef.current = globeGroup
    scene.add(globeGroup)

    // Core Sphere - Made even more compact
    const coreGeometry = new THREE.SphereGeometry(0.7, 64, 64) // Reduced from 1.0
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a0a1a,
      transparent: true,
      opacity: 0.9,
      emissive: 0x1a237e,
      emissiveIntensity: 0.3,
      shininess: 100,
    })
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial)
    globeGroup.add(coreSphere)

    // Inner Glow Layer - Adjusted for compactness
    const innerGlowGeometry = new THREE.SphereGeometry(0.75, 32, 32) // Reduced from 1.05
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    const innerGlowSphere = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial)
    globeGroup.add(innerGlowSphere)

    // Outer Glow Layer - Adjusted for compactness
    const outerGlowGeometry = new THREE.SphereGeometry(0.85, 32, 32) // Reduced from 1.2
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    })
    const outerGlowSphere = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial)
    globeGroup.add(outerGlowSphere)

    // Wireframe Globe Layers - Adjusted for compactness
    const wireframeGroup = new THREE.Group()
    wireframeGroupRef.current = wireframeGroup
    scene.add(wireframeGroup)

    const primaryWireframeGeometry = new THREE.SphereGeometry(0.9, 24, 12) // Reduced from 1.3
    const primaryWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const primaryWireframe = new THREE.Mesh(primaryWireframeGeometry, primaryWireframeMaterial)
    wireframeGroup.add(primaryWireframe)

    const secondaryWireframeGeometry = new THREE.SphereGeometry(0.95, 16, 8) // Reduced from 1.4
    const secondaryWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    })
    const secondaryWireframe = new THREE.Mesh(secondaryWireframeGeometry, secondaryWireframeMaterial)
    wireframeGroup.add(secondaryWireframe)

    // Enhanced Particle Field - Adjusted for compactness
    const particleCount = 1000 // Reduced particle count
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 0.5 // Reduced from 1.5 + Math.random() * 1.0
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

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

    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02, // Smaller particles
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    particlesRef.current = particles
    scene.add(particles)

    // Rotating Tech Rings - Adjusted for compactness
    const ringsGroup = new THREE.Group()
    ringsGroupRef.current = ringsGroup
    scene.add(ringsGroup)

    const ringMaterial = (color: number, opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        emissive: color,
        emissiveIntensity: 0.2,
      })

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.015, 8, 100), ringMaterial(0x00ffff, 0.6)) // Reduced from 1.5
    ring1.rotation.x = Math.PI / 2
    ringsGroup.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.015, 8, 100), ringMaterial(0xff6b6b, 0.5)) // Reduced from 1.7
    ring2.rotation.y = Math.PI / 2
    ringsGroup.add(ring2)

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.015, 8, 100), ringMaterial(0x4ecdc4, 0.4)) // Reduced from 1.9
    ring3.rotation.set(Math.PI / 4, Math.PI / 4, 0)
    ringsGroup.add(ring3)

    const ring4 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.01, 8, 100), ringMaterial(0xffd93d, 0.3)) // Reduced from 2.1
    ring4.rotation.set(-Math.PI / 4, -Math.PI / 4, Math.PI / 2)
    ringsGroup.add(ring4)

    // Data Streams - Curved Lines - Adjusted for compactness
    for (let i = 0; i < 6; i++) {
      // Reduced number of streams
      const streamGeometry = new THREE.TorusGeometry(1.4 + i * 0.03, 0.003, 4, 50) // Reduced from 2.2 + i * 0.05
      const streamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${180 + i * 30}, 70%, 60%)`).getHex(),
        transparent: true,
        opacity: 0.6,
      })
      const stream = new THREE.Mesh(streamGeometry, streamMaterial)
      stream.rotation.y = (i * Math.PI) / 3 // Adjusted rotation for fewer streams
      scene.add(stream)
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      const time = performance.now() * 0.001 // Convert to seconds

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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      // Dispose geometries and materials to prevent memory leaks
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          if (object.geometry) {
            object.geometry.dispose()
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        }
      })
    }
  }, [])

  return (
    <div ref={mountRef} className="w-full h-full relative flex items-center justify-center">
      {/* Logo and Vibration Effect inside the globe container */}
      <div
        className="relative w-24 h-24 flex items-center justify-center"
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
