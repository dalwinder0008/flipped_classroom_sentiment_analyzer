"use client"

import { useState } from "react"
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"
import { useWebGLSupport } from "@/src/lib/webgl"

export default function ShaderDemo() {
  const [intensity, setIntensity] = useState(1.5)
  const [speed, setSpeed] = useState(1.0)
  const [activeEffect, setActiveEffect] = useState("mesh")
  const [copied, setCopied] = useState(false)
  const hasWebGL = useWebGLSupport()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("pnpm i 21st")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  if (hasWebGL === false) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-white">WebGL Not Supported</h1>
          <p className="text-slate-400">
            This demo requires WebGL to render advanced shaders. Your browser or environment does not seem to support it.
          </p>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-slate-500 font-mono">
            Error: Paper Shaders require WebGL context
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {activeEffect === "mesh" && (
        <MeshGradient
          className="w-full h-full absolute inset-0"
          colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
          speed={speed}
        />
      )}

      {activeEffect === "dots" && (
        <div className="w-full h-full absolute inset-0 bg-black">
          <DotOrbit
            className="w-full h-full"
            colors={["#333333"]}
            colorBack="#1a1a1a"
            speed={speed}
          />
        </div>
      )}

      {activeEffect === "combined" && (
        <>
          <MeshGradient
            className="w-full h-full absolute inset-0"
            colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
            speed={speed * 0.5}
          />
          <div className="w-full h-full absolute inset-0 opacity-60">
            <DotOrbit
              className="w-full h-full"
              colors={["#333333"]}
              colorBack="#1a1a1a"
              speed={speed * 1.5}
            />
          </div>
        </>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
        {/* Header */}
        <div className="pointer-events-auto">
          <h1 className="text-white/80 font-mono text-lg tracking-tighter">SHADER_LAB // V1.0</h1>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-end pointer-events-auto">
          <div className="space-y-4">
            <div className="flex gap-2">
              {["mesh", "dots", "combined"].map((effect) => (
                <button
                  key={effect}
                  onClick={() => setActiveEffect(effect)}
                  className={`px-4 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${
                    activeEffect === effect 
                      ? "bg-white text-black" 
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 text-right">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/30 uppercase">Intensity</label>
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="0.1" 
                value={intensity} 
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="block w-32 accent-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/30 uppercase">Speed</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={speed} 
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="block w-32 accent-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lighting overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-gray-800/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: `${3 / speed}s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/2 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-gray-900/3 rounded-full blur-xl animate-pulse"
          style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center font-mono text-xs text-white/40">
          <div>...21st-cli...</div>
          <div className="mt-1 flex items-center gap-2">
            <span>pnpm i 21st.dev</span>
            <button
              onClick={copyToClipboard}
              className="pointer-events-auto opacity-30 hover:opacity-60 transition-opacity text-white/60 hover:text-white/80"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
