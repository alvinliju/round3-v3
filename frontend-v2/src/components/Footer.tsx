import React from 'react'

function Footer() {
  return (
    <div className=''>
        <footer className="border-t border-gray-200 py-6 px-6 text-xs text-gray-500">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span>© 2024 bachman-funded.xyz</span>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-gray-700">privacy</a>
            <a href="#" className="hover:text-gray-700">terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer