
import Navbar from '../components/Navbar'

function FrontPage() {
  return (
    <div>
        <Navbar></Navbar>

    <div className='flex flex-col gap-4'>
        <h1 className='text-xl font-bold space-y-4'>  
          A platform for founders who are too busy to write.
        </h1>

        <div className='flex flex-col '>
            <p className='font-bold space'>For creators:</p>
            <p className='text-sm space-y-2'>Get paid for sharing updates about what you're already doing, get funded by your peers. <p>To create an account someone must invite you <a className='underline text-orange-500' href='/request'>send them this link.</a></p></p>

            <p className='font-bold mt-4'>For readers:</p>
            <p className='text-sm space-y-2'>Pay 5$/m for someone cool, <br/> Get Updates. Ask Questions. Access opportunity.</p>
        </div>
       
        

        {/* Secondary CTA */}
      <div className='mt-4'>
        <p className='text-sm'>
          Know someone who should be here? <a className='text-orange-500 underline hover:text-orange-600' href='/request'>Invite a founder</a>
        </p>
      </div>


      {/* Social proof section */}
      <div className='text-xl font-bold mt-4'>
            <p>Check out some of our writers:</p>

        </div>
    </div>
        

    </div>
  )
}

export default FrontPage