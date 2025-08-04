import "./globals.css";
import { ThemeProvider } from "../../contexts/ThemeContext";

export const metadata = {
  title: "Killer Currency Converter",
  description: "Next.js currency converter with live rates, dark mode, charts & more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
