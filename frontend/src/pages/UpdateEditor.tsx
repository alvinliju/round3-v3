import  { useState } from 'react'
import Navbar from '../components/Navbar'
import type { FormEvent } from 'react'
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

        const res = await fetch('http://localhost:8080/post-update', 
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
    <div>
        <Navbar/>
        <form action="" className='flex flex-col' onSubmit={e => handleSubmit(e)}>
            <label className="text-sm pb-1">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}  type="text" className="border-1 border-gray-300 px-4 py-2 max-w-xl bg-white" placeholder="write a short subject.." />
            <label className="text-sm  pb-1 mt-4">Content</label>
            <textarea name="" value={content} onChange={e => setContent(e.target.value)} className="border-1 border-gray-300 px-4 py-2 max-w-xl min-h-60 bg-white" id="" placeholder='keep it simple and preise..'></textarea>
            <button type="submit" className="bg-red-600 px-4 py-2 max-w-fit text-white mt-4">Submit</button>
        </form>
    </div>
  )
}

export default UpdateEditor