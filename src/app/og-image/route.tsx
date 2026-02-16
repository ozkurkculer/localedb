import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a1a1a 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 900,
              background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.05em",
            }}
          >
            LocaleDB
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              color: "#9ca3af",
              textAlign: "center",
              maxWidth: "900px",
              fontWeight: 500,
            }}
          >
            The Localization Encyclopedia
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1f2937",
                padding: "12px 24px",
                borderRadius: "8px",
                color: "#10b981",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              250+ Countries
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1f2937",
                padding: "12px 24px",
                borderRadius: "8px",
                color: "#34d399",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              180+ Currencies
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#1f2937",
                padding: "12px 24px",
                borderRadius: "8px",
                color: "#6ee7b7",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              200+ Languages
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
