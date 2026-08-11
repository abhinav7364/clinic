import type { Metadata } from "next";
import "./globals.css";
import { PortalLayout } from "@/components/layout/PortalLayout";

export const metadata: Metadata = {
  title: {
    default: "CareClinic Doctor Portal",
    template: "%s | CareClinic",
  },
  description:
    "Professional Doctor Portal for CareClinic Outpatient Centre — manage patient queue, consultations, prescriptions, and patient records efficiently.",
  keywords: ["doctor portal", "clinic management", "EMR", "electronic medical record", "outpatient"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <PortalLayout>{children}</PortalLayout>
      </body>
    </html>
  );
}
