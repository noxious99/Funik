import { Button } from '@/components/ui/button'
import { IoMdLogIn } from "react-icons/io";
import React from 'react'

const Navbar:React.FC = () => {
  return (
    <>
      <div className='flex items-center px-5 h-[80px] w-full bg-amber-600 mb-10 justify-between'>
        <Button
          variant='outline'
        >
          <IoMdLogIn/>
          Login
        </Button>
        <div className='text-2xl font-bold text-gray-100'>Funik !!</div>
        <div></div>
      </div>
    </>
  )
}

export default Navbar