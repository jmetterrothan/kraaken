import WebGL2H from "../utility/WebGL2H";

import fsText from "@src/assets/shaders/text.fs.glsl?raw";
import vsText from "@src/assets/shaders/text.vs.glsl?raw";
import { IVector2 } from "../models/math.model";

export type DebugTextStyle = {
  fontPx?: number; // in CSS px (will be multiplied by DPR internally)
  fontFamily?: string;
  color?: string;
  outlineColor?: string;
  outlinePx?: number; // in CSS px (scaled by DPR)
  lineGapPx?: number; // in CSS px (scaled by DPR)
};

type DebugTextOverlayAnchorPosition = "top_left" | "top_center" | "top_right" | "bottom_left" | "bottom_center" | "bottom_right";
type DebugTextOverlayAlign = "left" | "right" | "center";

class DebugTextOverlay {
  private hudCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private tex: WebGLTexture;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;

  private uTexLoc: WebGLUniformLocation;

  private frameW = 1;
  private frameH = 1;
  private dpr = 1;

  private style: Required<DebugTextStyle> = {
    fontPx: 12,
    fontFamily: "monospace",
    color: "#fff",
    outlineColor: "rgba(0,0,0,1)",
    outlinePx: 4,
    lineGapPx: 16,
  };

  private anchor: DebugTextOverlayAnchorPosition;
  private cursors: Record<DebugTextOverlayAnchorPosition, IVector2>;

  constructor(private gl: WebGL2RenderingContext) {
    this.hudCanvas = document.createElement("canvas");

    const ctx = this.hudCanvas.getContext("2d");

    if (!ctx) throw new Error("DebugTextOverlay: failed to get 2D context");
    this.ctx = ctx;

    const tex = gl.createTexture();
    if (!tex) throw new Error("DebugTextOverlay: failed to create texture");
    this.tex = tex;

    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.program = WebGL2H.createProgram(gl, vsText, fsText);
    const loc = gl.getUniformLocation(this.program, "uTex");
    if (!loc) throw new Error("DebugTextOverlay: missing uniform uTex");
    this.uTexLoc = loc;

    // Fullscreen quad VAO (triangle strip)
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    if (!vao || !vbo) throw new Error("DebugTextOverlay: failed to create VAO/VBO");
    this.vao = vao;
    this.vbo = vbo;

    const data = new Float32Array([
      // x,  y,   u, v
      -1,
      -1,
      0,
      0,
      1,
      -1,
      1,
      0,
      -1,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
    ]);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.anchor = "bottom_left";

    this.cursors = {
      bottom_center: this.getAnchorPos("bottom_center"),
      bottom_left: this.getAnchorPos("bottom_left"),
      bottom_right: this.getAnchorPos("bottom_right"),
      top_center: this.getAnchorPos("top_center"),
      top_left: this.getAnchorPos("top_left"),
      top_right: this.getAnchorPos("top_right"),
    };
  }

  public setStyle(partial: DebugTextStyle) {
    this.style = { ...this.style, ...partial };
  }

  /**
   * Call when the framebuffer size changes.
   * Pass canvas.width/height (device px) and DPR.
   */
  public resize(frameW: number, frameH: number, dpr: number) {
    this.frameW = Math.max(1, frameW | 0);
    this.frameH = Math.max(1, frameH | 0);
    this.dpr = Math.max(1, dpr || 1);

    this.hudCanvas.width = this.frameW;
    this.hudCanvas.height = this.frameH;

    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameW, this.frameH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  public begin() {
    // Clear in device px
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.frameW, this.frameH);

    // Scale font-related sizes to stay consistent in CSS px across DPRs
    const fontPx = Math.round(this.style.fontPx * this.dpr);
    this.ctx.font = `${fontPx}px ${this.style.fontFamily}`;
    this.ctx.textBaseline = "top";

    this.cursors = {
      bottom_center: this.getAnchorPos("bottom_center"),
      bottom_left: this.getAnchorPos("bottom_left"),
      bottom_right: this.getAnchorPos("bottom_right"),
      top_center: this.getAnchorPos("top_center"),
      top_left: this.getAnchorPos("top_left"),
      top_right: this.getAnchorPos("top_right"),
    };
  }

  private getAnchorPos(anchor: DebugTextOverlayAnchorPosition) {
    const pX = 24;
    const pY = 24;

    switch (anchor) {
      case "top_left":
        return {
          x: Math.round(pX * this.dpr),
          y: Math.round(pY * this.dpr),
        };

      case "top_center":
        return {
          x: Math.round(this.frameW / 2),
          y: Math.round(pY * this.dpr),
        };

      case "top_right":
        return {
          x: Math.round(this.frameW - pX * this.dpr),
          y: Math.round(pY * this.dpr),
        };

      case "bottom_left":
        return {
          x: Math.round(pX * this.dpr),
          y: Math.round(this.frameH - pY * this.dpr),
        };

      case "bottom_center":
        return {
          x: Math.round(this.frameW / 2),
          y: Math.round(this.frameH - pY * this.dpr),
        };

      case "bottom_right":
        return {
          x: Math.round(this.frameW - pX * this.dpr),
          y: Math.round(this.frameH - pY * this.dpr),
        };

      default:
        return {
          x: 0,
          y: 0,
        };
    }
  }

  private getAnchorBaseAlignment(anchor: DebugTextOverlayAnchorPosition): DebugTextOverlayAlign {
    switch (anchor) {
      case "top_center":
      case "bottom_center":
        return "center";

      case "top_right":
      case "bottom_right":
        return "right";

      default:
        return "left";
    }
  }

  public moveTo(anchor: DebugTextOverlayAnchorPosition) {
    this.anchor = anchor;
  }

  /** Draw one line at the current cursor (top-left), then advance */
  public line(text: string, scale?: number) {
    const { x: cursorX, y: cursorY } = this.cursors[this.anchor];

    if (text.length > 0) {
      this.text(text, cursorX, cursorY, this.getAnchorBaseAlignment(this.anchor), scale);
    }

    const fontPx = Math.round(this.style.fontPx * this.dpr);
    const lineGap = Math.round(this.style.lineGapPx * this.dpr);

    const dir = this.anchor === "bottom_left" || this.anchor === "bottom_center" || this.anchor === "bottom_right" ? -1 : 1;
    this.cursors[this.anchor].y += (fontPx + lineGap) * dir;
  }

  /** Draw text at device-pixel coords (same space as your camera matrices) */
  public text(text: string, x: number, y: number, align: DebugTextOverlayAlign = "left", scale: number = 1) {
    const ctx = this.ctx;
    // inside text()
    ctx.save();
    ctx.translate(x | 0, y | 0);
    ctx.textBaseline = "alphabetic";

    const fontPx = Math.round(this.style.fontPx * this.dpr * scale);
    ctx.font = `${fontPx}px ${this.style.fontFamily}`;

    const m = ctx.measureText(text);

    const padX = Math.round(8 * this.dpr);
    const padY = Math.round(4 * this.dpr);

    const left = m.actualBoundingBoxLeft ?? 0;
    const right = m.actualBoundingBoxRight ?? m.width;
    const ascent = m.actualBoundingBoxAscent ?? fontPx;
    const descent = m.actualBoundingBoxDescent ?? Math.ceil(fontPx * 0.25);

    let ax = 0;
    if (align === "right") ax = -(left + right);
    else if (align === "center") ax = -(left + right) / 2;

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(ax - left - padX, -ascent - padY, left + right + padX * 2, ascent + descent + padY * 2);

    const ox = Math.round(this.style.outlinePx * this.dpr);
    ctx.lineWidth = ox;
    ctx.lineJoin = "round";
    ctx.strokeStyle = this.style.outlineColor;
    ctx.strokeText(text, ax, 0);

    ctx.fillStyle = this.style.color;
    ctx.fillText(text, ax, 0);

    ctx.restore();
  }

  /** Upload the HUD canvas into the GL texture (call once per frame after drawing) */
  public upload() {
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.tex);

    // Canvas pixels are premultiplied alpha → match it in unpack + blend during draw
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.hudCanvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  }

  /** Render overlay on top (fullscreen quad) */
  public render() {
    const gl = this.gl;

    const wasDepth = gl.isEnabled(gl.DEPTH_TEST);
    const wasCull = gl.isEnabled(gl.CULL_FACE);
    const wasBlend = gl.isEnabled(gl.BLEND);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    // Premultiplied alpha blend (important to avoid dark halos)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.uTexLoc, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindVertexArray(null);
    gl.useProgram(null);

    // restore engine state
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (!wasBlend) gl.disable(gl.BLEND);
    if (wasCull) gl.enable(gl.CULL_FACE);
    if (wasDepth) gl.enable(gl.DEPTH_TEST);
  }

  public dispose() {
    const gl = this.gl;

    gl.deleteTexture(this.tex);
    gl.deleteProgram(this.program);
    gl.deleteBuffer(this.vbo);
    gl.deleteVertexArray(this.vao);
  }
}

export default DebugTextOverlay;
