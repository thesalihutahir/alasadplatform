import { Inter } from "next/font/google";
import "./globals.css";
// UPDATE 1: Correct path matches where we created the file
import { AuthContextProvider } from "@/context/AuthContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Al Asad Education Foundation",
  description: "Transforming education through Qur'an values and community empowerment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* UPDATE 2: Correct Name matches the export */}
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
