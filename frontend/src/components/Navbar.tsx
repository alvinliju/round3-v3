import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  let location = useLocation();

  let token = localStorage.getItem("jwtToken")

  return (
    <header className="bg-[#ff0000] py-2 px-2 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg">round3</div>
            <nav className="flex space-x-4 text-white">
              
            <a href="/writers" className="text-sm hover:underline text-white">
                writers
              </a>
              {(location.pathname != '/login') && (location.pathname != '/post') && <a href="/login" className="text-sm hover:underline text-white">
                login
              </a>}
              {token && <a href="/request" className="text-sm hover:underline">
                post
              </a>}
              <a href="/request" className="text-sm hover:underline">
                invite
              </a>
            </nav>
          </div>
    </header>
  )
}

export default Navbar