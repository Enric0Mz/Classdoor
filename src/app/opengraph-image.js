import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InfoCampus — Avaliações de Universidades Brasileiras";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* Logo area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #c9b458, #e8d48b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: "bold",
            color: "#1a1a2e",
          }}
        >
          IC
        </div>
        <span
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#ffffff",
            letterSpacing: "-1px",
          }}
        >
          InfoCampus
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: "28px",
          color: "#c9b458",
          fontWeight: "600",
          marginBottom: "16px",
        }}
      >
        Avaliações Reais de Universidades Brasileiras
      </p>

      {/* Description */}
      <p
        style={{
          fontSize: "20px",
          color: "rgba(255, 255, 255, 0.7)",
          maxWidth: "700px",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        Compare universidades, leia avaliações de alunos e encontre a
        instituição ideal para sua carreira acadêmica.
      </p>
    </div>,
    { ...size },
  );
}
