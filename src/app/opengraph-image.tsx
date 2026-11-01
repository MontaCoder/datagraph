import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Datagraph. The file holds the answer. Upload a CSV, ask in plain English, and read the chart.";

/**
 * Open Graph card — the sheet: warm white ground, ink grotesk, and
 * the sample file's own price trace in cool blue.
 */
export default function OpengraphImage() {
  const W = 1072;
  const H = 190;
  const deciles = [1, 101, 206, 265, 350, 408, 489, 621, 731, 858, 999];
  const pts = deciles.map((v, i) => `${((i / (deciles.length - 1)) * W).toFixed(1)} ${(H - (v / 1000) * H).toFixed(1)}`);
  const line = `M${pts.join("L")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf8f4",
          color: "#1c1b19",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{ display: "flex" }}>Datagraph</div>
          <div style={{ display: "flex", fontSize: 15, color: "#6f6a62", letterSpacing: "0.02em" }}>
            products-100.csv, 100 rows
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 92,
            fontWeight: 500,
            letterSpacing: "-0.035em",
            lineHeight: 1.02,
          }}
        >
          <div style={{ display: "flex" }}>the file holds</div>
          <div style={{ display: "flex" }}>the answer.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, color: "#6f6a62", marginBottom: 18 }}>
            upload a csv, ask in plain english, and read the chart.
          </div>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <path d={`${line}L${W} ${H}L0 ${H}Z`} fill="#d7e3fa" />
            <path d={line} fill="none" stroke="#3f6fd8" strokeWidth="2" />
          </svg>
        </div>
      </div>
    ),
    size
  );
}
