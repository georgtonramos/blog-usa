import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={poppins.variable}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-text-dark antialiased">
        <Header />
        <main className="container-readable flex-grow py-8 md:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
