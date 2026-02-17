import "./globals.css";

export const metadata = {
  title: "Classdoor",
  description: "University reputation platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
