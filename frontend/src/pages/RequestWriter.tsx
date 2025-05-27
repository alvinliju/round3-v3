import { useState } from "react"
import { type FormEvent }from "react";
import Navbar from "../components/Navbar"

const API_URL = "https://round3-v3.onrender.com/"

function RequestWriter() {
    const [writerEmail, setWriterEmail] = useState("");
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!writerEmail){
            alert("Please enter an email")
            return
        }

        const res = await fetch(`${API_URL}/invite-writer`, 
            {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({"Email":writerEmail})
            }
        )

        const data = await res.json()

        alert(data.message); // Show the alert
        setWriterEmail(""); 
    }
  return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">Invite a writer</h1>
            <p className="text-sm text-gray-800">Know someone who should be sharing their work? Invite them to join the platform.
            You'll be their first subscriber ($5/month) and they'll get an invitation to create an account, if they didnt signup you'll be refuned.</p>
        </div>
        <form action="" className="flex flex-col mt-2" onSubmit={e => handleSubmit(e)} >
            <label className="text-sm t pb-1">Writers Email</label>
            <input value={writerEmail} onChange={e => setWriterEmail(e.target.value)} type="email" className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white" placeholder="richhendriks@gmail.com" />
            <button type="submit" className="bg-red-600 px-4 py-2 max-w-fit text-white mt-4">Invite & Subscribe</button>
        </form>
    </div>
  )
}

export default RequestWriter