import { useEffect, useRef } from "react"

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animationId: number | null = null

    try {
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      if (!gl) return

      const ctx = gl as WebGLRenderingContext

      // Vertex shader
      const vsSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `

      // Fragment shader - elegant, very subtle architectural gold wave running along the bottom
      const fsSource = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        void main() {
          vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
          
          // Shift the golden wave line down to the bottom (-0.75 y-offset) and speed it up slightly (0.45) to ensure visible animation
          float waveY = p.y + 0.75 + sin((p.x + time * 0.45) * 0.8) * 0.15;
          float d = length(p) * 0.05;

          float rx = waveY * (1.0 + d);
          float gx = waveY;
          float bx = waveY * (1.0 - d);

          // Make the gold line thinner (0.015 instead of 0.05) and softer so it doesn't glare
          float r = 0.018 / abs(rx);
          float g = 0.015 / abs(gx);
          float b = 0.011 / abs(bx);

          // Render gold line with elegant overlay blend
          gl_FragColor = vec4(r * 1.0, g * 0.85, b * 0.65, 0.8);
        }
      `

      function createShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type)!
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error("Shader compile error:", gl.getShaderInfoLog(shader))
          gl.deleteShader(shader)
          return null
        }
        return shader
      }

      const vs = createShader(ctx, ctx.VERTEX_SHADER, vsSource)
      const fs = createShader(ctx, ctx.FRAGMENT_SHADER, fsSource)
      if (!vs || !fs) return

      const program = ctx.createProgram()!
      ctx.attachShader(program, vs)
      ctx.attachShader(program, fs)
      ctx.linkProgram(program)

      if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
        console.error("Program link error:", ctx.getProgramInfoLog(program))
        return
      }

      ctx.useProgram(program)

      // Full-screen quad
      const buffer = ctx.createBuffer()
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1,  -1, 1,
         1, -1,  1,  1,  -1, 1,
      ]), ctx.STATIC_DRAW)

      const posLoc = ctx.getAttribLocation(program, "position")
      ctx.enableVertexAttribArray(posLoc)
      ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0)

      const resLoc = ctx.getUniformLocation(program, "resolution")
      const timeLoc = ctx.getUniformLocation(program, "time")

      let startTime = Date.now()

      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx.viewport(0, 0, canvas.width, canvas.height)
      }

      resize()
      window.addEventListener("resize", resize)

      const render = () => {
        const elapsed = (Date.now() - startTime) / 1000
        ctx.uniform2f(resLoc, canvas.width, canvas.height)
        ctx.uniform1f(timeLoc, elapsed)
        ctx.drawArrays(ctx.TRIANGLES, 0, 6)
        animationId = requestAnimationFrame(render)
      }

      render()

      return () => {
        if (animationId) cancelAnimationFrame(animationId)
        window.removeEventListener("resize", resize)
      }
    } catch (e) {
      console.error("WebGL init failed:", e)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="webgl-background"
    />
  )
}
