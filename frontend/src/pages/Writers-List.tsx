import { useState } from "react"
import useSWR from "swr";
import Navbar from "../components/Navbar";

const PAGE_SIZE = 7;

const fetcher = (url:string) => fetch(url).then((res) => res.json());

interface Writer {
    "name": string,
    "avatar": string,
    "subcount": string,
    "id":string
}


function WritersList() {
    const [page, setPage] = useState(0);
    console.log(page)
    const {data:writers, error, isLoading} = useSWR<Writer[]>("https://67e1b2a158cc6bf78526d2a4.mockapi.io/api/mock/v1/writers", fetcher)

    if (error) return "An error has occurred.";
    if (isLoading) return "Loading...";

    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE
    const pageWriters = writers ? writers.slice(start, end) : [];
    
    console.log(writers)
  return (
    <div className="flex flex-col pb-8">
        <Navbar></Navbar>
        <div>
            <h1>Writers</h1>
        </div>
        {pageWriters && pageWriters.length > 0 && pageWriters.map(writer => (
            <div key={writer.id} className="p-3 border border-gray-300 hover:border-gray-400 transition-colors">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                    <img className="max-w-12 rouned-lg" src={writer.avatar}></img>
                    <h1>{writer.name}</h1>
                </div>
            
                <div className="flex-1 py-2 gap-2">
                    <h3 className="font-medium">{writer.name}</h3>
                    <p className="text-sm text-gray-600">{writer.subcount} subscribers</p>
                </div>
                <button disabled className="bg-red-400 px-4 py-2 rounded-lg">Subscribe</button>
            </div>

        ))}
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