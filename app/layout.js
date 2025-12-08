import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Al Asad Education Foundation",
  description: "Transforming education through Qur'an values and community empowerment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the entire app in AuthProvider for Admin access */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
