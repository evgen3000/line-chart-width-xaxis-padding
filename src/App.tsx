import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  x: number;
  uv: number;
  pv: number;
  amt: number;
  pv_z?: number;
  uv_z?: number;
}

const rawData: DataPoint[] = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400, x: 0 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210, x: 1 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290, x: 2 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000, x: 3 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181, x: 4 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500, x: 5 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100, x: 6 },
];

const calculateZScores = (values: number[]): number[] => {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length,
  );
  return values.map((v) => (v - mean) / std);
};

function segmentLineZAboveThreshold<T extends Record<string, any>>(
  data: T[],
  valueKey: "pv" | "uv",
  zKey: "pv_z" | "uv_z",
  baseColor: string,
  threshold = 1,
): { data: T[]; stroke: string }[] {
  const segments: { data: T[]; stroke: string }[] = [];
  let currentSegment: T[] = [];
  let currentColor = data[0][zKey] > threshold ? "#ff0000" : baseColor;

  for (let i = 0; i < data.length - 1; i++) {
    const a = data[i];
    const b = data[i + 1];
    const za = a[zKey];
    const zb = b[zKey];

    const colorA = za > threshold ? "#ff0000" : baseColor;
    const colorB = zb > threshold ? "#ff0000" : baseColor;

    currentSegment.push(a);

    // переход из одного режима в другой — вставляем точку
    if (colorA !== colorB) {
      const t = (threshold - za) / (zb - za);
      const interpolated: T = {
        ...a,
        ...Object.fromEntries(
          Object.keys(a).map((key) => {
            const av = a[key];
            const bv = b[key];
            if (typeof av === "number" && typeof bv === "number") {
              return [key, av + (bv - av) * t];
            }
            return [key, av];
          }),
        ),
        [zKey]: threshold,
        name: `${a.name}-${b.name}`,
      };

      currentSegment.push(interpolated);
      segments.push({ data: [...currentSegment], stroke: currentColor });

      // начинаем новый сегмент с этой точки
      currentSegment = [interpolated];
      currentColor = colorB;
    }
  }

  currentSegment.push(data[data.length - 1]);
  if (currentSegment.length > 1) {
    segments.push({ data: currentSegment, stroke: currentColor });
  }

  return segments;
}

const CustomDot = ({ cx, cy, payload, dataKey }: any) => {
  const z = payload[`${dataKey}_z`];
  const color = z > 1 ? "#ff0000" : dataKey === "pv" ? "#8884d8" : "#82ca9d";
  return <circle cx={cx} cy={cy} r={4} fill={color} />;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  const name = point?.name || "—";

  return (
    <div style={{ background: "#fff", border: "1px solid #ccc", padding: 10 }}>
      <strong>{name}</strong>
      <br />
      {["pv", "uv"].map((key) => {
        const z = point[`${key}_z`];
        const value = point[key];
        const color = z > 1 ? "#ff0000" : key === "pv" ? "#8884d8" : "#82ca9d";
        return (
          <div key={key} style={{ color }}>
            {key} : {value} (z={z?.toFixed(2)})
          </div>
        );
      })}
    </div>
  );
};

const CustomLegend = () => (
  <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
    <div style={{ color: "#8884d8" }}>● pv</div>
    <div style={{ color: "#82ca9d" }}>● uv</div>
  </div>
);

export default function App() {
  const pvZ = calculateZScores(rawData.map((d) => d.pv));
  const uvZ = calculateZScores(rawData.map((d) => d.uv));

  const dataWithZ: DataPoint[] = rawData.map((d, i) => ({
    ...d,
    pv_z: pvZ[i],
    uv_z: uvZ[i],
  }));

  const pvSegments = segmentLineZAboveThreshold(
    dataWithZ,
    "pv",
    "pv_z",
    "#8884d8",
  );
  const uvSegments = segmentLineZAboveThreshold(
    dataWithZ,
    "uv",
    "uv_z",
    "#82ca9d",
  );

  return (
    <div style={{ width: "100%", height: 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            ticks={rawData.map((d) => d.x)}
            tickFormatter={(x) => {
              const point = rawData.find((d) => d.x === x);
              return point?.name || "";
            }}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />

          {pvSegments.map((seg, i) => (
            <Line
              key={`pv-${i}`}
              data={seg.data}
              dataKey="pv"
              stroke={seg.stroke}
              strokeWidth={2}
              dot={<CustomDot dataKey="pv" />}
              isAnimationActive={false}
              type="linear"
            />
          ))}

          {uvSegments.map((seg, i) => (
            <Line
              key={`uv-${i}`}
              data={seg.data}
              dataKey="uv"
              stroke={seg.stroke}
              strokeWidth={2}
              dot={<CustomDot dataKey="uv" />}
              isAnimationActive={false}
              type="linear"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
