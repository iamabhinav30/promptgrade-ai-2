import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RechartsRadarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DimensionScore } from "../types";

interface RadarChartProps {
  originalDimensions: DimensionScore[];
  finalDimensions: DimensionScore[];
}

export default function RadarChart({ originalDimensions, finalDimensions }: RadarChartProps) {
  const data = finalDimensions.map((dimension) => {
    const original = originalDimensions.find((item) => item.name === dimension.name);
    return {
      dimension: dimension.name.replace("_", " "),
      Original: original?.score ?? 0,
      Final: dimension.score,
    };
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Dimension Radar</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" />
            <PolarRadiusAxis domain={[0, 1]} />
            <Radar name="Original" dataKey="Original" stroke="#ef4444" fill="#ef4444" fillOpacity={0.12} strokeDasharray="5 5" />
            <Radar name="Final" dataKey="Final" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.22} />
            <Tooltip />
            <Legend />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
