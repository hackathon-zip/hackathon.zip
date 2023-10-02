import Navbar from "./Navbar";

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("Call to HackathonLayout");
  return (
    <div
      style={{
        width: "calc(100vw - (100vw - 100%))",
        height: "100vh",
      }}
    >
      <Navbar breadcrumbs={[]} />

      <div
        style={{
          background: "#fafafa",
          width: "calc(100vw - (100vw - 100%))",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
