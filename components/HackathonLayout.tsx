import Navbar from "./Navbar";

export default function HackathonLayout ({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar breadcrumbs={[]}/>
            {children}
        </>
    )
}