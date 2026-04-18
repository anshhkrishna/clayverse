"use client";

import { useState, useMemo } from "react";
import { X, Download, FileCode2, Box, AlignLeft, Printer, Zap } from "lucide-react";
import { useStudioStore } from "@/stores/studioStore";
import { cn, formatBytes } from "@/lib/utils";
import { generateSTL, downloadSTL, estimateSTLSize } from "@/lib/export/stlExporter";
import {
  generateSVGProfile,
  generateDXF,
  downloadSVG,
  downloadDXF,
  estimateSVGSize,
  estimateDXFSize,
} from "@/lib/export/svgExporter";
import {
  generateGCode,
  downloadGCode,
  estimateGCodeSize,
} from "@/lib/export/gcodeExporter";
import {
  generatePDFTemplate,
  downloadPDF,
  estimatePDFSize,
} from "@/lib/export/pdfExporter";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExportTab = "stl" | "svg" | "gcode" | "pdf" | "ar";
type Resolution = "low" | "medium" | "high";
type Unit = "mm" | "cm" | "inch";
type PDFScale = 1 | 0.5 | 0.2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS: { id: ExportTab; label: string; icon: React.ReactNode }[] = [
  { id: "stl", label: "STL/OBJ", icon: <Box size={14} /> },
  { id: "svg", label: "SVG/DXF", icon: <AlignLeft size={14} /> },
  { id: "gcode", label: "G-code", icon: <FileCode2 size={14} /> },
  { id: "pdf", label: "PDF", icon: <Printer size={14} /> },
  { id: "ar", label: "AR (USDZ)", icon: <Zap size={14} /> },
];

const RESOLUTION_TRIANGLES: Record<Resolution, number> = {
  low: 1024,
  medium: 4096,
  high: 16384,
};

function makeDemoProfile(): [number, number][] {
  // Simple bowl profile for demo
  return Array.from({ length: 20 }, (_, i) => {
    const t = i / 19;
    const r = 40 + 20 * Math.sin(t * Math.PI);
    const h = t * 80;
    return [r, h] as [number, number];
  });
}

function makeDemoGeometry(resolution: Resolution): {
  vertices: Float32Array;
  indices: Uint32Array;
} {
  const rings = resolution === "low" ? 8 : resolution === "medium" ? 16 : 32;
  const segs = resolution === "low" ? 16 : resolution === "medium" ? 32 : 64;
  const profile = makeDemoProfile();
  const vertCount = (rings + 1) * (segs + 1);
  const vertices = new Float32Array(vertCount * 3);
  const indices = new Uint32Array(rings * segs * 6);

  let vi = 0;
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const pIdx = Math.min(Math.floor(t * (profile.length - 1)), profile.length - 2);
    const lt = t * (profile.length - 1) - pIdx;
    const radius = profile[pIdx][0] + lt * (profile[pIdx + 1][0] - profile[pIdx][0]);
    const height = profile[pIdx][1] + lt * (profile[pIdx + 1][1] - profile[pIdx][1]);
    for (let s = 0; s <= segs; s++) {
      const angle = (s / segs) * Math.PI * 2;
      vertices[vi++] = radius * Math.cos(angle);
      vertices[vi++] = height;
      vertices[vi++] = radius * Math.sin(angle);
    }
  }

  let ii = 0;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segs; s++) {
      const a = r * (segs + 1) + s;
      const b = a + segs + 1;
      indices[ii++] = a; indices[ii++] = b; indices[ii++] = a + 1;
      indices[ii++] = b; indices[ii++] = b + 1; indices[ii++] = a + 1;
    }
  }

  return { vertices, indices };
}

// ─── Common options bar ───────────────────────────────────────────────────────

function CommonOptions({
  scale,
  setScale,
  applyShrinkage,
  setApplyShrinkage,
  unit,
  setUnit,
}: {
  scale: number;
  setScale: (v: number) => void;
  applyShrinkage: boolean;
  setApplyShrinkage: (v: boolean) => void;
  unit: Unit;
  setUnit: (v: Unit) => void;
}) {
  return (
    <div className="p-4 border-b border-clay-200 bg-clay-50/60">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Scale */}
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-semibold text-clay-700 uppercase tracking-wide">
            Scale
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 accent-clay-500"
            />
            <span className="text-xs font-mono text-clay-700 w-8">{scale.toFixed(1)}x</span>
          </div>
        </div>

        {/* Units */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-clay-700 uppercase tracking-wide">
            Units
          </label>
          <div className="flex gap-1">
            {(["mm", "cm", "inch"] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={cn(
                  "px-2 py-0.5 text-xs rounded border transition-colors",
                  unit === u
                    ? "bg-clay-500 text-white border-clay-500"
                    : "bg-white text-clay-700 border-clay-200 hover:border-clay-400"
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Shrinkage */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-clay-700">Shrinkage compensation</label>
          <button
            onClick={() => setApplyShrinkage(!applyShrinkage)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              applyShrinkage ? "bg-clay-500" : "bg-ash-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                applyShrinkage ? "left-[18px]" : "left-0.5"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STL Tab ──────────────────────────────────────────────────────────────────

function STLTab({
  scale,
  unit,
}: {
  scale: number;
  unit: Unit;
}) {
  const [resolution, setResolution] = useState<Resolution>("medium");
  const [binary, setBinary] = useState(true);

  const unitScale = unit === "cm" ? 10 : unit === "inch" ? 25.4 : 1;
  const finalScale = scale * unitScale;

  const { indices } = useMemo(() => makeDemoGeometry(resolution), [resolution]);
  const sizeEst = estimateSTLSize(indices, binary);

  const handleDownload = () => {
    const { vertices, indices: idx } = makeDemoGeometry(resolution);
    downloadSTL(vertices, idx, "clayverse-export", { binary, scale: finalScale });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-clay-700 mb-2">Resolution</label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as Resolution[]).map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={cn(
                "flex-1 py-1.5 text-xs rounded border capitalize transition-colors",
                resolution === r
                  ? "bg-clay-500 text-white border-clay-500"
                  : "bg-white text-clay-700 border-clay-200 hover:border-clay-400"
              )}
            >
              {r}
              <span className="block text-[10px] opacity-70 mt-0.5">
                {RESOLUTION_TRIANGLES[r].toLocaleString()} tri
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-clay-700">Binary format</label>
        <button
          onClick={() => setBinary(!binary)}
          className={cn(
            "relative w-9 h-5 rounded-full transition-colors",
            binary ? "bg-clay-500" : "bg-ash-300"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              binary ? "left-[18px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      <div className="bg-clay-50 rounded-lg p-3 flex justify-between items-center text-xs text-clay-600">
        <span>Estimated file size</span>
        <span className="font-mono font-semibold">{formatBytes(sizeEst)}</span>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 bg-clay-500 hover:bg-clay-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
      >
        <Download size={15} />
        Download STL
      </button>
    </div>
  );
}

// ─── SVG/DXF Tab ─────────────────────────────────────────────────────────────

function SVGTab({ scale }: { scale: number }) {
  const [includeGrid, setIncludeGrid] = useState(true);
  const [includeDimensions, setIncludeDimensions] = useState(true);

  const profile = useMemo(() => makeDemoProfile(), []);
  const svgSize = estimateSVGSize(profile);
  const dxfSize = estimateDXFSize(profile);

  const handleSVG = () => {
    const svg = generateSVGProfile(profile, { scale: scale * 10, includeGrid, includeDimensions });
    downloadSVG(svg, "clayverse-profile");
  };

  const handleDXF = () => {
    const dxf = generateDXF(profile);
    downloadDXF(dxf, "clayverse-profile");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-clay-700">Grid overlay</label>
          <button
            onClick={() => setIncludeGrid(!includeGrid)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              includeGrid ? "bg-clay-500" : "bg-ash-300"
            )}
          >
            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", includeGrid ? "left-[18px]" : "left-0.5")} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-clay-700">Dimension labels</label>
          <button
            onClick={() => setIncludeDimensions(!includeDimensions)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              includeDimensions ? "bg-clay-500" : "bg-ash-300"
            )}
          >
            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", includeDimensions ? "left-[18px]" : "left-0.5")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-clay-600">
        <div className="bg-clay-50 rounded p-2 flex justify-between">
          <span>SVG size</span><span className="font-mono font-semibold">{formatBytes(svgSize)}</span>
        </div>
        <div className="bg-clay-50 rounded p-2 flex justify-between">
          <span>DXF size</span><span className="font-mono font-semibold">{formatBytes(dxfSize)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSVG}
          className="flex items-center justify-center gap-1.5 bg-clay-500 hover:bg-clay-600 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download size={13} />
          Download SVG
        </button>
        <button
          onClick={handleDXF}
          className="flex items-center justify-center gap-1.5 bg-earth-600 hover:bg-earth-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download size={13} />
          Download DXF
        </button>
      </div>
    </div>
  );
}

// ─── G-code Tab ───────────────────────────────────────────────────────────────

function GCodeTab() {
  const [layerHeight, setLayerHeight] = useState(1.0);
  const [nozzle, setNozzle] = useState(2.0);
  const [printSpeed, setPrintSpeed] = useState(600);
  const [preview, setPreview] = useState<string | null>(null);

  const profile = useMemo(() => makeDemoProfile(), []);

  const params = {
    profile,
    layerHeight,
    nozzleDiameter: nozzle,
    wallThickness: nozzle * 2,
    printSpeed,
    clayBody: "Stoneware",
  };

  const sizeEst = estimateGCodeSize(params);

  const handlePreview = () => {
    const gcode = generateGCode(params);
    const lines = gcode.split("\n").slice(0, 12);
    setPreview(lines.join("\n"));
  };

  const handleDownload = () => {
    const gcode = generateGCode(params);
    downloadGCode(gcode, "clayverse-print");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-clay-700">Layer height</label>
            <span className="text-xs font-mono text-clay-600">{layerHeight.toFixed(1)} mm</span>
          </div>
          <input type="range" min={0.5} max={3} step={0.1} value={layerHeight}
            onChange={(e) => setLayerHeight(Number(e.target.value))}
            className="w-full accent-clay-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-clay-700">Nozzle diameter</label>
            <span className="text-xs font-mono text-clay-600">{nozzle.toFixed(1)} mm</span>
          </div>
          <input type="range" min={1} max={5} step={0.5} value={nozzle}
            onChange={(e) => setNozzle(Number(e.target.value))}
            className="w-full accent-clay-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-clay-700">Print speed</label>
            <span className="text-xs font-mono text-clay-600">{printSpeed} mm/min</span>
          </div>
          <input type="range" min={100} max={1500} step={50} value={printSpeed}
            onChange={(e) => setPrintSpeed(Number(e.target.value))}
            className="w-full accent-clay-500" />
        </div>
      </div>

      {preview && (
        <div className="bg-earth-950 rounded-lg p-3 overflow-auto max-h-28">
          <pre className="text-[10px] text-sage-300 font-mono leading-relaxed whitespace-pre-wrap">{preview}</pre>
        </div>
      )}

      <div className="bg-clay-50 rounded-lg p-3 flex justify-between items-center text-xs text-clay-600">
        <span>Estimated file size</span>
        <span className="font-mono font-semibold">{formatBytes(sizeEst)}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center justify-center gap-1.5 border border-clay-300 text-clay-700 hover:bg-clay-50 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          Preview
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-1.5 bg-clay-500 hover:bg-clay-600 text-white py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download size={13} />
          Download
        </button>
      </div>
    </div>
  );
}

// ─── PDF Tab ──────────────────────────────────────────────────────────────────

const PDF_SCALES: { label: string; value: PDFScale }[] = [
  { label: "1:1", value: 1 },
  { label: "1:2", value: 0.5 },
  { label: "1:5", value: 0.2 },
];

function PDFTab({ projectName }: { projectName: string }) {
  const [pdfScale, setPdfScale] = useState<PDFScale>(1);
  const [includeGrid, setIncludeGrid] = useState(true);
  const [notes, setNotes] = useState("");

  const profile = useMemo(() => makeDemoProfile(), []);
  const sizeEst = estimatePDFSize({ projectName, profile, dimensions: { width: 80, height: 80 }, scale: pdfScale, includeGrid, notes });

  const handleDownload = () => {
    const blob = generatePDFTemplate({
      projectName,
      profile,
      dimensions: { width: 80, height: 80 },
      scale: pdfScale,
      includeGrid,
      notes,
    });
    downloadPDF(blob, `${projectName}-template`);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-clay-700 mb-2">Print scale</label>
        <div className="flex gap-2">
          {PDF_SCALES.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setPdfScale(value)}
              className={cn(
                "flex-1 py-1.5 text-xs rounded border transition-colors",
                pdfScale === value
                  ? "bg-clay-500 text-white border-clay-500"
                  : "bg-white text-clay-700 border-clay-200 hover:border-clay-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs text-clay-700">Include grid</label>
        <button
          onClick={() => setIncludeGrid(!includeGrid)}
          className={cn(
            "relative w-9 h-5 rounded-full transition-colors",
            includeGrid ? "bg-clay-500" : "bg-ash-300"
          )}
        >
          <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", includeGrid ? "left-[18px]" : "left-0.5")} />
        </button>
      </div>

      <div>
        <label className="block text-xs text-clay-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Firing notes, clay body info..."
          rows={3}
          className="w-full text-xs border border-clay-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-clay-400 bg-white text-clay-800 placeholder:text-clay-400"
        />
      </div>

      <div className="bg-clay-50 rounded-lg p-3 flex justify-between items-center text-xs text-clay-600">
        <span>Estimated size</span>
        <span className="font-mono font-semibold">{formatBytes(sizeEst)}</span>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 bg-clay-500 hover:bg-clay-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
      >
        <Download size={15} />
        Download PDF Template
      </button>
    </div>
  );
}

// ─── AR Tab ───────────────────────────────────────────────────────────────────

function ARTab() {
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-kiln-100 flex items-center justify-center mx-auto mb-4">
        <Zap size={28} className="text-kiln-500" />
      </div>
      <h3 className="font-semibold text-clay-800 mb-2">AR Export (USDZ)</h3>
      <p className="text-xs text-clay-500 leading-relaxed max-w-[220px] mx-auto">
        View your clay piece in augmented reality on iPhone and iPad. USDZ export is coming soon in a future Clayverse update.
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 bg-kiln-100 text-kiln-700 text-xs font-medium px-3 py-1 rounded-full">
        <span>Coming soon</span>
      </div>
    </div>
  );
}

// ─── Main ExportPanel ─────────────────────────────────────────────────────────

export function ExportPanel() {
  const { exportPanelOpen, toggleExportPanel, project } = useStudioStore();
  const [activeTab, setActiveTab] = useState<ExportTab>("stl");
  const [scale, setScale] = useState(1);
  const [applyShrinkage, setApplyShrinkage] = useState(false);
  const [unit, setUnit] = useState<Unit>("mm");

  if (!exportPanelOpen) return null;

  const projectName = project?.name ?? "Untitled";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={toggleExportPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-clay-200 bg-clay-50">
          <div>
            <h2 className="font-display font-semibold text-clay-900 text-sm">Export</h2>
            <p className="text-[11px] text-clay-500 truncate max-w-[180px]">{projectName}</p>
          </div>
          <button
            onClick={toggleExportPanel}
            className="p-1.5 rounded-lg hover:bg-clay-100 text-clay-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Common options */}
        <CommonOptions
          scale={scale}
          setScale={setScale}
          applyShrinkage={applyShrinkage}
          setApplyShrinkage={setApplyShrinkage}
          unit={unit}
          setUnit={setUnit}
        />

        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-clay-200 bg-white flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-clay-500 text-clay-700"
                  : "border-transparent text-clay-400 hover:text-clay-600"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "stl" && <STLTab scale={scale} unit={unit} />}
          {activeTab === "svg" && <SVGTab scale={scale} />}
          {activeTab === "gcode" && <GCodeTab />}
          {activeTab === "pdf" && <PDFTab projectName={projectName} />}
          {activeTab === "ar" && <ARTab />}
        </div>
      </div>
    </>
  );
}

export default ExportPanel;
