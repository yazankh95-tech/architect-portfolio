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

      // Fragment shader - warm architectural gold wave
      const fsSource = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        void main() {
          vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
          float d = length(p) * 0.05;

          float rx = p.x * (1.0 + d);
          float gx = p.x;
          float bx = p.x * (1.0 - d);

          float r = 0.05 / abs(p.y + sin((rx + time * 0.5) * 1.0) * 0.5);
          float g = 0.05 / abs(p.y + sin((gx + time * 0.5) * 1.0) * 0.5);
          float b = 0.05 / abs(p.y + sin((bx + time * 0.5) * 1.0) * 0.5);

          gl_FragColor = vec4(r * 1.0, g * 0.85, b * 0.65, 1.0);
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
