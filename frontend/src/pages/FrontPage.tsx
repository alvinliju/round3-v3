
import Navbar from '../components/Navbar'
import useSWR from 'swr'

const API_URL = import.meta.env.VITE_API_URL 

const fetcher = (url:string) => fetch(url).then((res) => res.json());

interface Writer {
  "ID":string
  "Name": string,
  "Website": string,
}

interface WritersResponse {
  writers: Writer[]
}

function FrontPage() {



  const {data, error, isLoading} = useSWR<WritersResponse>(`${API_URL}/writers`, fetcher)

  const writers = data?.writers || []

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f6f6ef]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="p-4 text-red-600 bg-red-50 border border-red-200 text-sm">
            Failed to load writers. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
        <Navbar></Navbar>

    <div className='flex flex-col gap-4'>
        <h1 className='text-xl font-bold space-y-4'>  
          A platform for founders who are too busy to write.
        </h1>

        <div className='flex flex-col '>
            <p className='font-bold space'>For creators:</p>
            <p className='text-sm space-y-2'>Get paid for sharing updates about what you're already doing, get funded by your peers. <p>To create an account someone must invite you <a className='underline text-red-500' href='/request'>send them this link.</a></p></p>

            <p className='font-bold mt-4'>For readers:</p>
            <p className='text-sm space-y-2'>Pay 5$/m for someone cool, <br/> Get Updates. Ask Questions. Access opportunity.</p>
        </div>
       
        

        {/* Secondary CTA */}
      <div className='mt-4'>
        <p className='text-sm'>
          Know someone who should be here? <a className='text-red-500 underline hover:text-red-600' href='/request'>Invite a founder</a>
        </p>
      </div>


      {/* Writers section */}
      <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Check out some of our writers:</h2>
            {isLoading && <p>loading writers</p>}
            {writers.length > 0 ? (
              <div className="space-y-3">
                {writers.map((writer) => (
                  <div key={writer.ID} className="border-l-2 border-gray-300 pl-4 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <a href='/writers' className="font-medium text-gray-900 underline">{writer.Name}</a>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Working on:</span>
                        <a
                          href={writer.Website.startsWith("http") ? writer.Website : `https://${writer.Website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 underline hover:text-red-600 transition-colors"
                        >
                          {writer.Website}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No writers available at the moment.</p>
            )}
          </div>
    </div>
        

    </div>
  )
}

export default FrontPage