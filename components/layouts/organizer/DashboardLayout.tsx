import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
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
        height: "100vh"
      }}
    >
      <Navbar breadcrumbs={[]} showTabs={false} />

      <div
        style={{
          background: theme === "light" ? "#fafafa" : "#101010",
          width: "calc(100vw - (100vw - 100%))",
          height: "auto"
        }}
      >
        {children}
      </div>
    </div>
  );
}
