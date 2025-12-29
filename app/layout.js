import { Inter } from "next/font/google";
import "./globals.css";
// Context Imports
import { AuthContextProvider } from "@/context/AuthContext"; 
import { ModalProvider } from "@/app/context/ModalContext"; // Import the Modal System

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Al-Asad Education Foundation",
  description: "Transforming education through Qur'an values and community empowerment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <ModalProvider> {/* Wrapped here so every page can use it */}
            {children}
          </ModalProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
