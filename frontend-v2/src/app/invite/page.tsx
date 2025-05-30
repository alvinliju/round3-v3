"use client"
import { useState } from 'react';
import { Button } from '@radix-ui/themes';
import type { FormEvent } from 'react';
const API_URL = "http://localhost:8080"

function Page() {
    const [email, setEmail] = useState("")
    const [isSending, setSending] = useState(false)
    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!email){
            alert("Please enter an email")
            return
        }

        const res = await fetch(`${API_URL}/invite-writer`, 
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
        setSending(false)
        setEmail(""); 
      }

  return (
    <div className='flex-1 max-w-5xl mx-auto px-2 py-12 flex justify-center items-center'>
      <div>
      <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Invite Writer</h1>
                    <p className="text-gray-600 mt-2 text-sm">
                    Know someone who should be sharing their work? Invite them to join the platform. <br/> You'll be their first subscriber ($5/month) and they'll get an invitation to create an account, <br/>  if they didnt signup you'll be refuned.
                    </p>
                </div>
        <form action="" className="flex flex-col mt-4" onSubmit={e => handleSubmit(e)} >
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-4" placeholder="richhendriks@gmail.com" />
            
             <Button type='submit' onClick={()=>setSending(true)} radius='none' color="gray" variant="solid" size={"2"} highContrast>
             {isSending ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Invite..
                            </span>
                        ) : "Send Invite"}    

             </Button>

             
           
            
        </form>
        
      </div>
        
        
    </div>
  )
}


export default Page