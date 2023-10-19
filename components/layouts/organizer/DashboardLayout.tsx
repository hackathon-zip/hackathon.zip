import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [breadcrumbs, setBreadcrumbs] = useState<
    { value: React.ReactNode; href?: string }[]
  >([]);

  const { theme } = useTheme();

  return (
    <div
      style={{
        width: "calc(100vw - (100vw - 100%))",
        height: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Navbar breadcrumbs={[]} showTabs={false} />

      <div
        style={{
          background: theme === "light" ? "#fafafa" : "#101010",
          width: "calc(100vw - (100vw - 100%))",
          height: "auto",
          flexGrow: 1
        }}
      >
        {children}
      </div>
      <div style={{ background: "#fff", textAlign: "center", padding: "16px" }}>
        <div style={{ maxWidth: "450px", margin: "auto" }}>
          Built by hackathon organizers for hackathon organizers; open sourced
          at{" "}
          <Link href="https://github.com/hackathon-zip" target="_blank">
            github.com/hackathon-zip
          </Link>
          .
        </div>
      </div>
      
      <style
        dangerouslySetInnerHTML={{
          __html: `
      
          .select-content {
            width: auto;
            height: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 4px;
          }
        `
        }}
      />
    </div>
  );
}
