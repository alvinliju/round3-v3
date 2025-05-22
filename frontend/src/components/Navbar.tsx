

function Navbar() {
  return (
    <header className="bg-[#ff0000] py-2 px-2 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg">round3</div>
            <nav className="flex space-x-4 text-white">
              <a href="/login" className="text-sm hover:underline text-white">
                login
              </a>
              <a href="/request" className="text-sm hover:underline">
                invite
              </a>
            </nav>
          </div>
    </header>
  )
}

export default Navbar