import { Plus_Jakarta_Sans, Noto_Serif } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://infocampus.com.br"),
  title: {
    template: "%s | InfoCampus",
    default: "InfoCampus — Avaliações de Universidades Brasileiras",
  },
  description:
    "Encontre a universidade perfeita com avaliações reais de alunos e ex-alunos. Compare universidades públicas e privadas do Brasil, veja notas, reviews e rankings.",
  openGraph: {
    siteName: "InfoCampus",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} ${notoSerif.variable}`}
    >
      <body
        className={`${plusJakartaSans.className} flex min-h-screen flex-col`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
