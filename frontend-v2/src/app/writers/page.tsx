"use client"
import { useState, type FormEvent } from "react"
import useSWR from "swr";

const API_URL = process.env.API_URL;
const PAGE_SIZE = 7;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Writer {
    ID: string;
    Name: string;
    Website: string;
    Email: string; // Make sure backend includes this
}

function WritersList() {
    const [selectedWriter, setSelectedWriter] = useState<Writer | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState("");
    const [page, setPage] = useState(0);

    const { data, error, isLoading } = useSWR<{ writers: Writer[] }>(
        `${API_URL}/writers`, 
        fetcher,
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    );

    // Error and loading states remain the same...

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!selectedWriter || !email) {
            alert("Please fill all fields");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/subscribe`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    WriterEmail: selectedWriter.Email,
                    SubscriberEmail: email
                })
            });

            const responseData = await res.json();
            alert(res.ok ? "Subscribed successfully!" : responseData.message);
            setEmail("");
            setShowModal(false);
        } catch (err) {
            alert("Subscription failed. Please try again.");
        }
    }

    return (
        <div className="flex flex-col min-h-screen  pb-8">
            
            <div className="max-w-4xl mx-auto px-4 py-6 w-full">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Writers</h1>
                    {data?.writers && (
                        <p className="text-gray-600 text-sm">
                            {data.writers.length} writer{data.writers.length !== 1 ? 's' : ''}
                            • Page {page + 1} of {Math.ceil(data.writers.length / PAGE_SIZE)}
                        </p>
                    )}
                </div>

                {/* Writers List */}
                <div className="space-y-2">
                    {data?.writers
                        ?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
                        .map((writer) => (
                            <div 
                                key={writer.ID} 
                                className="flex justify-between items-center p-4 bg-white border border-gray-200  hover:shadow-sm transition-shadow"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-900">{writer.Name}</h3>
                                    <a
                                        href={writer.Website.startsWith('http') ? writer.Website : `https://${writer.Website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                    >
                                        {writer.Website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedWriter(writer);
                                        setShowModal(true);
                                    }}
                                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2  text-sm font-medium transition-colors"
                                >
                                    Subscribe
                                </button>
                            </div>
                        ))
                    }
                </div>

                {/* Pagination */}
                {data?.writers && data.writers.length > PAGE_SIZE && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 0))}
                            disabled={page === 0}
                            className="px-4 py-2 bg-gray-100  disabled:opacity-50 hover:bg-gray-200 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => 
                                (p + 1) * PAGE_SIZE < data.writers.length ? p + 1 : p
                            )}
                            disabled={(page + 1) * PAGE_SIZE >= data.writers.length}
                            className="px-4 py-2 bg-gray-100  disabled:opacity-50 hover:bg-gray-200 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Subscription Modal */}
            {showModal && selectedWriter && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
                    >
                        <h3 className="font-medium text-lg mb-4">
                            Subscribe to {selectedWriter.Name}
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Email
                            </label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-3 py-2 border border-gray-300  focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedWriter(null);
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 font-medium transition-colors"
                            >
                                Subscribe
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default WritersList;