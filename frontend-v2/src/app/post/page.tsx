"use client"
import  { useState } from 'react'
import type { FormEvent } from 'react'

const API_URL =  process.env.API_URL;

function UpdateEditor() {
    const[subject, setSubject] = useState("")
    const [content, setContent] = useState("")


    const JWT_TOKEN = localStorage.getItem('jwtToken')


    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!subject){
            alert("Please enter an subject")
            return
        }
        if(!content){
            alert("Please enter some content")
            return
        }

        const res = await fetch(`${API_URL}/post-update`, 
            {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JWT_TOKEN}`,
                  },
                body: JSON.stringify({"Title":subject, "Body":content})
            }
        )

        const data = await res.json()

        alert(data.message); // Show the alert
        setContent(""); setSubject("")
        
    }
  return (
    <div className='px-12 mx-auto py-8 max-w-xl'>
        <form action="" className='flex flex-col ' onSubmit={e => handleSubmit(e)}>
            <label className="text-sm font-medium pb-1">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}  type="text" className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white" placeholder="write a short subject.." />
            <label className="text-sm  font-medium pb-1 mt-4">Content</label>
            <textarea name="" value={content} onChange={e => setContent(e.target.value)} className="border-1 border-gray-300 px-4 py-2 max-w-xl min-h-60 bg-white" id="" placeholder='keep it simple and preise..'></textarea>
            <button type="submit" className="bg-black px-4 py-2 max-w-fit text-white mt-4">Submit</button>
        </form>
    </div>
  )
}

export default UpdateEditor