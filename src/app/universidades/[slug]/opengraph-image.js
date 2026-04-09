import { ImageResponse } from "next/og";
import * as universityService from "@/domain/universityService";

export const runtime = "nodejs";
export const alt = "InfoCampus — Universidade";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }) {
  const { slug } = await params;

  let university;
  try {
    university = await universityService.getUniversityBySlug(slug);
  } catch {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a2e",
          color: "#ffffff",
          fontSize: "32px",
          fontFamily: "sans-serif",
        }}
      >
        Universidade não encontrada
      </div>,
      { ...size },
    );
  }

  const rating = university.stats?.averageRating;
  const reviewCount = university.stats?.reviewCount ?? 0;
  const typeLabel = university.type === "PUBLIC" ? "Pública" : "Privada";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily: "sans-serif",
        padding: "60px",
      }}
    >
      {/* Top: Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #c9b458, #e8d48b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1a1a2e",
          }}
        >
          IC
        </div>
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          InfoCampus
        </span>
      </div>

      {/* Center: University info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#ffffff",
            lineHeight: "1.1",
            margin: 0,
          }}
        >
          {university.name}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {university.location}
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "#c9b458",
              background: "rgba(201, 180, 88, 0.15)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontWeight: "600",
            }}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Bottom: Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        {rating != null && (
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#c9b458",
              }}
            >
              {rating.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              / 5.0
            </span>
          </div>
        )}
        {reviewCount > 0 && (
          <span
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            {reviewCount} {reviewCount === 1 ? "avaliação" : "avaliações"}
          </span>
        )}
      </div>
    </div>,
    { ...size },
  );
}
