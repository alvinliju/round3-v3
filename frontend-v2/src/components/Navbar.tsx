import React from 'react'

function Navbar() {
  return (
    <>
        <header className="py-4 px-6 border-b border-gray-100">
  <div className="max-w-5xl mx-auto flex justify-between items-center">
    <div className="text-lg font-semibold flex gap-2 items-center justify-center">bachman-funded</div>
    <div className="flex items-center space-x-8 text-sm font-medium">
      <a href="/writers" className="hover:text-gray-600 transition-colors">Browse</a>
      <a href="/invite" className="hover:text-gray-600 transition-colors">Invite</a>
      <a href="/login" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Login</a>
    </div>
  </div>
</header>
    </>
  )
}

export default Navbar