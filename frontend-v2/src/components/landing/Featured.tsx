import React from 'react'
import Link from 'next/link'
function Featured() {
  return (
    <div>
        {/* Featured Writer */}
        <div>
            <h2 className="text-xl font-medium mb-2">Check out our <Link className='text-black underline hover:no-underline' href={"/writers"}>writers</Link></h2>

            {/* <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    A
                  </div>
                  <span className="font-medium">alvin</span>
                </div>
                <a href="#" className="text-red-600 text-sm hover:underline">
                  round3.xyz →
                </a>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>42 updates</span>
                <span>127 subscribers</span>
              </div>
            </div> */}
          </div>
    </div>
  )
}

export default Featured