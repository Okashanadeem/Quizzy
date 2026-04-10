import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Online Quiz Web App",
  description: "A modern platform for automated assessments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="flex-grow flex flex-col mt-[75px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
