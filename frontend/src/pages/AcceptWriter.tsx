import { useState, type FormEvent } from "react";
import Navbar from "../components/Navbar";
import { useSearchParams } from "react-router-dom";



function AcceptWriter() {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [website, setWebsite] = useState("")

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!email){
            alert("Please enter an email")
            return
        }

        const res = await fetch('http://localhost:8080/accept-invite', 
            {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({ID:id,Name:name, Email:email, Website:website})
            }
        )

        const data = await res.json()

        alert(data.message); // Show the alert
        setName("") ; setEmail("") ; setWebsite("")
    }

  return (
    <div>
        <Navbar/>
        <form action="" onSubmit={e => handleSubmit(e)} className="flex flex-col gap-2">
            <label htmlFor="">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white"  type="email" placeholder="gilfoil@gmail.com" />
            <label htmlFor="" className="mt-2">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white"  type="text" placeholder="gilfoil" />
            <label htmlFor="" className="mt-2">Website Link</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white"   type="text" placeholder="what you working on?" />
            <button type="submit" className="bg-red-600 px-4 py-2 max-w-fit text-white mt-4">verify</button>
        </form>
    </div>
  )
}

export default AcceptWriter