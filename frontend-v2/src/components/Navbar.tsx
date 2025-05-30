import React from 'react'
import { Button } from '@radix-ui/themes'
import Link from 'next/link'

function Navbar() {
  return (
    <>
        <header className="py-4 px-6 border-b border-gray-100">
  <div className="max-w-5xl mx-auto flex justify-between items-center">
    <div className="text-lg font-semibold flex gap-2 items-center justify-center"> <Link href={"/"}>bachman-funded</Link></div>
    <div className="flex items-center space-x-8 text-sm font-medium">
      <Link href={"/writers"} className="hover:text-gray-600 transition-colors">writers</Link>
      <Link href={"/invite"} className="hover:text-gray-600 transition-colors">Invite</Link>
      <Button color='gray' variant='solid' size={"1"} radius='none' highContrast> <Link href={"/login"}>LogIn</Link></Button>
      {/* <a href="/login" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Login</a> */}
    </div>
  </div>
</header>
    </>
  )
}

export default Navbar