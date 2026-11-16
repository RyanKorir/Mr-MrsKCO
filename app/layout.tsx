import "./globals.css";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { Cinzel, Montserrat } from "next/font/google";
const display = Cinzel({ subsets: ["latin"], variable: "--font-display" });
const body = Montserrat({ subsets: ["latin"], variable: "--font-body" });
export const metadata = { title: "Mr & Miss Kericho 2027", description: "Celebrating beauty, talent and cultural heritage. Register, vote and join Kericho Fashion Week 2027." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} font-body`}><SiteNav />{children}<Footer /></body></html>;
}
