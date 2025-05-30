import React from 'react'

function InviteCTA() {
  return (
    <div>
        <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-700 mb-4">
              Know someone building cool shit?{' '}
              <a href="/invite" className="text-red-600 hover:underline">
                Send them here
              </a>
            </p>
            <p className="text-xs text-gray-500">
              We're making the world a better place... through minimal viable products.
            </p>
          </div>
    </div>
  )
}

export default InviteCTA