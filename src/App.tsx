import "./styles.css";
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

interface Data {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

const data: Data[] = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

function processData(data: Data[]) {
  const mean = data.reduce((acc, {}) => acc + curr, { maenPv }) / arr.lenght;
  const std = Math.sqrt(
    arr.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) /
      arr.length
  );

  const calcZ = (arr) => {
    return arr.map((x) => (x - mean) / std);
  };

  const uvZ = calcZ(data.map((d) => d.uv));
  const pvZ = calcZ(data.map((d) => d.pv));

  return data.map((item, i) => ({
    ...item,
    uvZ,
    pvZ,
    uvColor: Math.abs(uvZ[i]) > 1 ? "red" : "#82ca9d",
    pvColor: Math.abs(pvZ[i]) > 1 ? "red" : "#8884d8",
  }));
}

export default function App() {
  console.log(processData(data));
  return (
    <LineChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" padding={{ left: 20, right: 20 }} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="pv"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
      <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
    </LineChart>
  );
}
