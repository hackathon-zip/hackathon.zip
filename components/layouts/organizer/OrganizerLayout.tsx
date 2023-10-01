import Navbar from "./Navbar";

export default function HackathonLayout ({ children }: { children: React.ReactNode }) {
    console.log('Call to HackathonLayout')
    return (
        <>
            <Navbar breadcrumbs={[]} />
            {children}
        </>
    )
}
