import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";
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
    <div className="w-[calc(100vw-(100vw-100%))] h-screen flex flex-col">
      <Navbar breadcrumbs={[]} showTabs={false} />

      <div
        className={`${
          theme === "light" ? "bg-slate-50" : "bg-slate-950"
        } w-[calc(100vw-(100vw-100%))] h-auto flex-grow`}
      >
        {children}
      </div>
      <div className="p-4 text-center bg-white">
        <div className="max-w-[450px] m-auto">
          Built by hackathon organizers for hackathon organizers; open sourced
          at{" "}
          <Link href="https://github.com/hackathon-zip" target="_blank">
            github.com/hackathon-zip
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
