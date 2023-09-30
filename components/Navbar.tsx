import { ClerkLoaded, UserButton } from "@clerk/nextjs"
import { Breadcrumbs } from "@geist-ui/core"
import HomeIcon from "@geist-ui/react-icons/home"

export default function Navbar ({ breadcrumbs }: { breadcrumbs: any }) {
    return (
      <nav style={{
        width: '100%',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        padding: '0px 32px',
        background: '#000',
        boxShadow: 'inset 0 -1px 0 0 hsla(0,0%,100%,.1)'
      }}>
  
        <Breadcrumbs>
          <Breadcrumbs.Item href="/dashboard"><HomeIcon /></Breadcrumbs.Item>
          {breadcrumbs}
          {/* <Breadcrumbs.Item href=""><Inbox /> Inbox</Breadcrumbs.Item>
          <Breadcrumbs.Item>Page</Breadcrumbs.Item> */}
        </Breadcrumbs>
        <div>
          <ClerkLoaded>
            <UserButton signInUrl="/sign-in" userProfileMode="modal" afterSignOutUrl="/" />
          </ClerkLoaded>
        </div>
  
      </nav>
    )
  }