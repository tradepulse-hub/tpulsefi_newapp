"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

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

    camera.position.set(0, 0, 5)

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

    // Core Sphere
    const coreGeometry = new THREE.SphereGeometry(1.5, 64, 64)
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

    // Inner Glow Layer
    const innerGlowGeometry = new THREE.SphereGeometry(1.55, 32, 32)
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    })
    const innerGlowSphere = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial)
    globeGroup.add(innerGlowSphere)

    // Outer Glow Layer
    const outerGlowGeometry = new THREE.SphereGeometry(1.7, 32, 32)
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    })
    const outerGlowSphere = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial)
    globeGroup.add(outerGlowSphere)

    // Wireframe Globe Layers
    const wireframeGroup = new THREE.Group()
    wireframeGroupRef.current = wireframeGroup
    scene.add(wireframeGroup)

    const primaryWireframeGeometry = new THREE.SphereGeometry(1.8, 24, 12)
    const primaryWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const primaryWireframe = new THREE.Mesh(primaryWireframeGeometry, primaryWireframeMaterial)
    wireframeGroup.add(primaryWireframe)

    const secondaryWireframeGeometry = new THREE.SphereGeometry(1.9, 16, 8)
    const secondaryWireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    })
    const secondaryWireframe = new THREE.Mesh(secondaryWireframeGeometry, secondaryWireframeMaterial)
    wireframeGroup.add(secondaryWireframe)

    // Enhanced Particle Field
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
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    particlesRef.current = particles
    scene.add(particles)

    // Rotating Tech Rings
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

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.02, 8, 100), ringMaterial(0x00ffff, 0.6))
    ring1.rotation.x = Math.PI / 2
    ringsGroup.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.02, 8, 100), ringMaterial(0xff6b6b, 0.5))
    ring2.rotation.y = Math.PI / 2
    ringsGroup.add(ring2)

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.02, 8, 100), ringMaterial(0x4ecdc4, 0.4))
    ring3.rotation.set(Math.PI / 4, Math.PI / 4, 0)
    ringsGroup.add(ring3)

    const ring4 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.015, 8, 100), ringMaterial(0xffd93d, 0.3))
    ring4.rotation.set(-Math.PI / 4, -Math.PI / 4, Math.PI / 2)
    ringsGroup.add(ring4)

    // Data Streams - Curved Lines
    for (let i = 0; i < 8; i++) {
      const streamGeometry = new THREE.TorusGeometry(3 + i * 0.1, 0.005, 4, 50)
      const streamMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${180 + i * 30}, 70%, 60%)`).getHex(),
        transparent: true,
        opacity: 0.6,
      })
      const stream = new THREE.Mesh(streamGeometry, streamMaterial)
      stream.rotation.y = (i * Math.PI) / 4
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

  return <div ref={mountRef} className="w-full h-full" />
}
