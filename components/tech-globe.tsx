"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
// Não precisamos mais importar Image do next/image aqui, pois o logo será um objeto 3D
// import import Image from "next/image"

export function TechGlobe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeGroupRef = useRef<THREE.Group | null>(null)
  const wireframeGroupRef = useRef<THREE.Group | null>(null)
  const particlesRef = useRef<THREE.Points | null>(null)
  const ringsGroupRef = useRef<THREE.Group | null>(null)
  const logoMeshRef = useRef<THREE.Mesh | null>(null) // Ref para o objeto 3D do logo

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

    // Wireframe Globe Layers
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

    // Enhanced Particle Field
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

    // Rotating Tech Rings
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

    // O ring1 (horizontal) já foi removido
    // const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.015, 8, 100), ringMaterial(0.4))
    // ring1.rotation.x = Math.PI / 2
    // ringsGroup.add(ring1)

    // REMOVIDO: ring2 que causava a linha reta vertical
    // const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.015, 8, 100), ringMaterial(0.3))
    // ring2.rotation.y = Math.PI / 2
    // ringsGroup.add(ring2)

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.015, 8, 100), ringMaterial(0.2))
    ring3.rotation.set(Math.PI / 4, Math.PI / 4, 0)
    ringsGroup.add(ring3)

    const ring4 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.01, 8, 100), ringMaterial(0.1))
    ring4.rotation.set(-Math.PI / 4, -Math.PI / 4, Math.PI / 2)
    ringsGroup.add(ring4)

    // Data Streams - Curved Lines
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

    // Carregar e adicionar o logo como um objeto 3D
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load("/images/codepulse-logo.png", (texture) => {
      const logoGeometry = new THREE.PlaneGeometry(0.7, 0.7) // Mantido o tamanho
      const logoMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff, // Explicitamente setado para branco para tintar a textura
        transparent: true,
        emissive: 0xffffff, // Cor do brilho do logo (branco)
        emissiveIntensity: 8.0, // Mantida a intensidade do brilho
        side: THREE.DoubleSide, // Renderizar em ambos os lados
      })
      const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial)

      // Posição do logo no centro (0,0) e ligeiramente à frente da esfera principal (raio 0.7)
      const initialLogoZ = 0.75
      logoMesh.position.set(0, 0, initialLogoZ) // Logo parado no centro

      // Adicionar o logo diretamente à cena, não ao globeGroup
      scene.add(logoMesh)
      logoMeshRef.current = logoMesh
    })

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
      {/* O logo agora é renderizado dentro da cena Three.js, então não precisamos mais do div HTML aqui. */}
    </div>
  )
}
