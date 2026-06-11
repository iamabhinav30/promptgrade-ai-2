import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadar, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../context/ThemeContext";
import type { DimensionScore } from "../types";

interface Props { originalDimensions: DimensionScore[]; finalDimensions: DimensionScore[]; }

export default function RadarChart({ originalDimensions, finalDimensions }: Props) {
  const { theme } = useTheme();
  const isDark    = theme === "dark";

  const gridStroke    = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const axisStroke    = isDark ? "#4b5563" : "#9ca3af";
  const tickFill      = isDark ? "#4b5563" : "#9ca3af";
  const radiusStroke  = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const tooltipBg     = isDark ? "#16161f" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const tooltipColor  = isDark ? "#f9fafb" : "#111827";
  const labelColor    = isDark ? "#6b7280" : "#9ca3af";

  const data = finalDimensions.map((d) => {
    const orig = originalDimensions.find((o) => o.name === d.name);
    return { subject: d.name.replace(/_/g, " "), Original: orig?.score ?? 0, Final: d.score };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid strokeDasharray="3 3" stroke={gridStroke} />
          <PolarAngleAxis dataKey="subject" stroke={axisStroke} style={{ fontSize: "11px" }} tick={{ fill: tickFill }} />
          <PolarRadiusAxis domain={[0, 1]} stroke={radiusStroke} tick={{ fontSize: 9, fill: tickFill }} tickCount={4} />
          <Radar name="Original" dataKey="Original" stroke="#ef4444" fill="#ef4444" fillOpacity={0.06} strokeDasharray="4 4" strokeWidth={1.5} />
          <Radar name="Final"    dataKey="Final"    stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", fontSize: "12px", color: tooltipColor }}
            formatter={(v) => [(v as number).toFixed(2), ""]}
            labelStyle={{ color: labelColor }}
          />
          <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "11px", color: labelColor }} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
