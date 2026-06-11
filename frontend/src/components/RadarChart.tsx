import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadar, ResponsiveContainer, Tooltip } from "recharts";
import type { DimensionScore } from "../types";

interface Props { originalDimensions: DimensionScore[]; finalDimensions: DimensionScore[]; }

export default function RadarChart({ originalDimensions, finalDimensions }: Props) {
  const data = finalDimensions.map((d) => {
    const orig = originalDimensions.find((o) => o.name === d.name);
    return {
      subject: d.name.replace(/_/g, " "),
      Original: orig?.score ?? 0,
      Final:    d.score,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="subject" stroke="#4b5563" style={{ fontSize: "11px" }} />
          <PolarRadiusAxis domain={[0, 1]} stroke="rgba(255,255,255,0.04)" tick={{ fontSize: 9, fill: "#4b5563" }} tickCount={4} />
          <Radar name="Original" dataKey="Original" stroke="#ef4444" fill="#ef4444" fillOpacity={0.06} strokeDasharray="4 4" strokeWidth={1.5} />
          <Radar name="Final"    dataKey="Final"    stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: "#16161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "12px", color: "#f9fafb" }}
            formatter={(v) => [(v as number).toFixed(2), ""]}
            labelStyle={{ color: "#6b7280" }}
          />
          <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "11px", color: "#6b7280" }} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
