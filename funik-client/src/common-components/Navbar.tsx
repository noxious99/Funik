import { Button } from '@/components/ui/button'
import { IoMdLogIn } from "react-icons/io";
import React from 'react'

const Navbar: React.FC = () => {
  return (
    <>
      <div className='flex items-center px-5 h-[80px] w-full bg-primary text-primary-foreground mb-10 justify-between'>
        {/* 1st section */}
        <div className='flex-1'>
          <Button
          className='bg-primary hover:bg-secondary'
            variant='outline'
          >
            <IoMdLogIn />
            Login
          </Button>
        </div>
        {/* 2nd section */}
        <div className='flex-1 flex justify-center'>
          <div className='text-2xl font-bold text-gray-100'>Funik.ME</div>
        </div>
        {/* 3rd section */}
        <div className='flex-1'></div>
      </div>
    </>
  )
}

export default Navbar