import type { Metadata } from "next";
import AdminClientWrapper from "../admin/AdminClientWrapper"; 

export const metadata: Metadata = {
  title: "AIJ Team Creations - Admin Panel",
  description: "Admin Panel of AIJ Team Creations",
  icons: {
    icon: "./upscaled_720x720_nobg.png" // Fixed path: Starts with "/"
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pass the children into the client-side auth wrapper
  return <AdminClientWrapper>{children}</AdminClientWrapper>;
}