
import './App.css'

function App() {

  const updates = [
    {founder:"alvin", company:"round3.xyz", content:"Hello world suckers"},
    {founder:"notalvin", company:"round4.xyz", content:"Hello world suckers"}
  ]

  return (
    <>

      <div className=' max-w-3xl mx-auto flex  flex-col p-2 gap-8'>

      {/*now thats a fucking navbar*/}
      <header className="bg-[#ff6600] py-2 px-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg">Recompiled</div>
          <nav className="flex space-x-4">
            <a href="/login" className="text-sm hover:underline">
              login
            </a>
            <a href="/request" className="text-sm hover:underline">
              invite
            </a>
          </nav>
        </div>
      </header>


        <div className='flex flex-col'>
          <p className='text-xl'>Founder Mode</p>
          <form className='flex flex-col gap-2'>
          <textarea className='border-1 border-solid rounded-lg w-64' placeholder='write your updates'></textarea>
          <button type='submit' className='bg-blue-500 rounded-lg px-2 max-w-24' >Submit</button>
          </form>

        </div>
        <div className='flex flex-col'>
          <p className='text-xl'>Reader Mode</p>
          {updates.map(update => (
            <div className='border-2 p-4'>
              <h2>Company:{update.company}</h2>
              <p>Founder:{update.founder}</p>
              <p>{update.content}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

export default App
