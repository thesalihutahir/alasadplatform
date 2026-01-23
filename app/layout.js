import { Inter } from "next/font/google";
import "./globals.css";
// Context Imports
import { AuthContextProvider } from "@/context/AuthContext"; 
import { ModalProvider } from "@/context/ModalContext"; // Import the Modal System

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Al-Asad Education Foundation",
  description: "Transforming education through Qur'an values and community empowerment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Temporary code for Eruda*/}
<script>
  // Only load Eruda if the URL contains "?eruda=true"
  (function () {
    var src = '//cdn.jsdelivr.net/npm/eruda';
    if (!/eruda=true/.test(window.location) && localStorage.getItem('active-eruda') != 'true') return;
    document.write('<scr' + 'ipt src="' + src + '"></scr' + 'ipt>');
    document.write('<scr' + 'ipt>eruda.init();</scr' + 'ipt>');
  })();
</script>
      </head>
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
