"use client"

import { Canvas } from "@react-three/fiber"
import { ShaderPlane, EnergyRing } from "@/src/components/ui/background-paper-shaders"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"

export default function ThreeShaderDemo() {
  return (
    <div className="w-full h-screen bg-slate-950 relative overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Suspense fallback={null}>
          <ShaderPlane position={[0, 0, 0]} color1="#4f46e5" color2="#06b6d4" />
          <EnergyRing radius={1.5} position={[0, 0, 0.1]} />
          <EnergyRing radius={2} position={[0, 0, -0.1]} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="glass-card max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter text-white">THREE_FIBER_SHADERS</h1>
          <p className="text-slate-400 text-sm">
            Interactive WebGL shaders built with React Three Fiber and custom GLSL.
          </p>
          <div className="pt-4 flex justify-center gap-4 pointer-events-auto">
            <button className="btn-primary">Get Started</button>
            <button className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
              Documentation
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 pointer-events-none">
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
          System Status: Operational // Buffer: 100%
        </div>
      </div>
    </div>
  )
}
