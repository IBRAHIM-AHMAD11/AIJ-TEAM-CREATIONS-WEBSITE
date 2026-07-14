import { Button } from '@/components/ui/button'
import React from 'react'

const Toolbar = () => {
  return (
    <nav className="text-3xl text-gray-300 border-[#1D1D1F] bg-[#090909]/95 flex items-center justify-between h-10 p-1.5">
      <div className='flex-1' />
      <div className='min-w-[280px] max-[642px] grow-2 shrink'>
        <Button size={"sm"} className={"bg-accent/25 hover:bg-accent/25 w-full justify-start h-7 px-2"}>

        </Button>
      </div>
    </nav>
  )
}

export default Toolbar