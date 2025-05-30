"use client"
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'


const API_URL = process.env.API_URL

function VerifyLogin() {
    const searchParams = useSearchParams();
    const verificationToken = searchParams.get("token");
    const [message, setMessage] = useState("Verifying")
    const router = useRouter()

    const verifyToken = async () => {
        const res = await fetch(`${API_URL}/login/verify`, 
            {
                method : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({"Token":verificationToken})
            }
        )

        

        if (res.status != 200){
            alert("something went wrong try again")
            return
        }

        const data = await res.json()

        console.log(data)

        setMessage("Success")

        localStorage.setItem('jwtToken', data.Token)

        router.push("/post")

    }

    useEffect(()=>{
        verifyToken()
        
    }, [verificationToken])

    

  return (
    <div className='flex-1 max-w-5xl mx-auto px-2 py-12 flex justify-center items-center'>

        <div >
            <h1 className='text-xl font-bold mb-2'>Login Verification..</h1>
            <p className='text-sm'>{message}</p>
        </div>
        
    </div>
  )
}

export default VerifyLogin