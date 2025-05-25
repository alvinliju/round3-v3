import { useState } from 'react';
import type { FormEvent } from 'react';
import Navbar from '../components/Navbar';

function WriterLogin() {
    const [email, setEmail] = useState("")
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!email){
            alert("Please enter an email")
            return
        }

        const res = await fetch('', 
            {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({"Email":email})
            }
        )

        const data = await res.json()

        alert(data.message); // Show the alert
        setEmail(""); 
    }
  return (
    <div>
        <Navbar></Navbar>
        <div>
            <h1 className='text-xl font-bold mb-2'>Wtiter Login</h1>
            <p className='text-sm'>Submit your email, we'll send you a link to login.</p>
        </div>
        <form action="" className="flex flex-col mt-4" onSubmit={e => handleSubmit(e)} >
            <label className="text-sm t pb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white" placeholder="richhendriks@gmail.com" />
            <button type="submit" className="bg-red-600 px-4 py-2 max-w-fit text-white mt-4">Submit</button>
        </form>
    </div>
  )
}

export default WriterLogin