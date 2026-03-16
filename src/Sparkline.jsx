export default function Sparkline({ data, positive, width = 68, height = 28 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const fillPts = `0,${height} ${polyline} ${width},${height}`;

  const color = positive ? "#30d158" : "#ff453a";
  const fillColor = positive ? "rgba(48,209,88,0.15)" : "rgba(255,69,58,0.15)";

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polygon points={fillPts} fill={fillColor} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
