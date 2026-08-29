import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "MediMind - Nền Tảng Học Tập Y Khoa & Phân Tích Tư Duy Bloom",
  description:
    "Hệ thống ôn luyện trắc nghiệm MCQ, Flashcard 3D theo 6 cấp độ tư duy Bloom, quản lý cây thư mục đa cấp và trợ lý AI Y khoa dành cho sinh viên Y Dược.",
  keywords: [
    "Y khoa",
    "Trắc nghiệm Y khoa",
    "MCQ Bloom Taxonomy",
    "Flashcard Y khoa",
    "Nội khoa",
    "Dược lý",
    "Sinh viên Y Dược",
    "Đại học Y",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
