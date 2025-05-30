import React from 'react'
import { Badge } from '@radix-ui/themes'

function Hero() {
  return (
    <div>
        <div className="space-y-8">
          <div className=''>
            <div className='flex items-center justify-center py-4'>
            <Badge color='blue'>currently in beta</Badge>
            </div>
            
            <h1 className="text-4xl font-medium mb-4 leading-tight">
              Get paid for your progress.
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              No VCs. No jargon. Just founders making it happen.
            </p>
            <p className="text-sm text-gray-500">
              This guy fucks... with progress updates.
            </p>
          </div>
          </div>
    </div>
  )
}

export default Hero