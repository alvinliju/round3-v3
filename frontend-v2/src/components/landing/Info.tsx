import React from 'react'

function Info() {
  return (
    <div>
        {/* For Creators */}
        <div className='flex flex-col mb-4'>
            <h2 className="text-xl font-medium mb-4">For creators:</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Get paid for sharing what you're already building</p>
              <p>• Build an audience that gets your hustle</p>
              <p>• No artificial scarcity bullshit</p>
            </div>
          </div>

          {/* For Readers */}
          <div>
            <h2 className="text-xl font-medium mb-4">For readers:</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>• Pay <span className="font-medium">$5/month</span> to support someone cool</p>
              <p>• Get weekly updates, ask questions, access opportunities</p>
              <p>• Direct line to founders building interesting things</p>
            </div>
          </div>
    </div>
  )
}

export default Info