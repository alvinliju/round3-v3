import { useState, type FormEvent } from "react"
import useSWR from "swr";
import Navbar from "../components/Navbar";

const PAGE_SIZE = 7;

const fetcher = (url:string) => fetch(url).then((res) => res.json());

interface Writer {
    "ID":string
    "Name": string,
    "Website": string,
}

interface WritersResponse {
    writers: Writer[]
  }


function WritersList() {
    const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);
    const [showModal, setShowModal] = useState(false)
    const [email, setEmail] = useState("")

    const [page, setPage] = useState(0);
    console.log(page)
    const {data, error, isLoading} = useSWR<WritersResponse>("http://localhost:8080/writers", fetcher)



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
    
      if (isLoading) {
        return (
          <div className="flex flex-col min-h-screen bg-[#f6f6ef]">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="text-sm text-gray-600">Loading writers...</div>
            </div>
          </div>
        )
      }

    const writers = data?.writers || []
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE
    const pageWriters = data && writers ? writers.slice(start, end) : [];
    const totalPages = Math.ceil(writers.length / PAGE_SIZE)

    
    

        const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const url = "http://localhost:8080/subscribe"
            console.log(selectedWriter, email)
    
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                  },
    
                body:JSON.stringify({"WriterEmail":selectedWriter, "SubscriberEmail":email})
            })
            const data = await res.json()
            if (res.ok) {
                alert("Subscribed successfully!");
              } else {
                alert(data.message);
              }

            setEmail("");
            setShowModal(false)
        }
  return (
    <div className="flex flex-col pb-8">

        <Navbar></Navbar>


        <div className="mb-6">
            <h1 className="text-xl font-bold text-black mb-2">Writers</h1>
            <p className="text-sm text-gray-600">
                {writers.length} writer{writers.length !== 1 ? "s" : ""} • Page {page + 1} of {totalPages || 1}
            </p>
        </div>

        {showModal && selectedWriter && (
  <div className="fixed inset-0 bg-black opacity-70 flex items-center justify-center z-50">
    <form onSubmit={handleSubmit} className="bg-white rounded p-6 w-full max-w-sm">
      <label>Email</label>
      <input
        type="email"
        placeholder="aviato@gmail.com"
        className="border p-2 w-full mb-3"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-1"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => { setShowModal(false); setSelectedWriter(null); }}
          className="bg-gray-200 px-4 py-1"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}



        <div className="space-y-1">
        {pageWriters && pageWriters.length > 0 && pageWriters.map((writer :any) => (
            <div key={writer.ID} className="flex items-center justify-between p-3 bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
            
                    <div>
                        <h3 className="font-medium text-black text-sm">{writer.Name}</h3>
                        <p className="text-xs text-gray-600">
                        Working on:{" "}
                        <a
                            href={writer.Website.startsWith("http") ? writer.Website : `https://${writer.Website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:underline"
                        >
                        {writer.Website}
                      </a>
                    </p>
                  </div>
                  <button
                  
                  onClick={() => {setShowModal(true); setSelectedWriter(writer.Email)}}
                  className="bg-red-500 text-white px-3 py-1 text-xs font-medium hover:bg-[#ff7722] transition-colors"
                >
                  subscribe
                </button>
            </div>

        )) 
        }
        </div>
        
        <div className="flex gap-2 mt-4 justify-center align-center">
                <button
                    onClick={() => setPage(pag => Math.max(pag - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage(p => writers && end < writers.length ? p + 1 : p)}
                    disabled={!writers || end >= writers.length}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
    </div>
  )
}

export default WritersList