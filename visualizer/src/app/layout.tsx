import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <main className='w-dvw h-dvh'>
        <SidebarTrigger className='absolute z-50 cursor-pointer' />
        {children}
      </main>
    </SidebarProvider>
  )
}

export default Layout