import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Al Asad Education Foundation",
  description: "Transforming education through Qur'an values and community empowerment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* UPDATE: Added 'lg:pl-72' to create space for the fixed sidebar on desktop.
          The sidebar is 72 (18rem) wide, so we pad the body by the same amount.
      */}
      <body className={`${inter.className} lg:pl-72`}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
