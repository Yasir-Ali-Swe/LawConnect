import React from 'react'
import { SidebarTrigger } from './ui/sidebar'
const DasboardNavbar = () => {
  return (
    <div className='bg-sidebar text-sidebar-foreground h-16 w-full'>
      <SidebarTrigger />
    </div>
  )
}

export default DasboardNavbar