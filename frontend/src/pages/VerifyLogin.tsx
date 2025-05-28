import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL 

function VerifyLogin() {
    const [searchParams] = useSearchParams();
    const verificationToken = searchParams.get("token");
    const [message, setMessage] = useState("Verifying")
    const naviagte = useNavigate()

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

        naviagte("/post")

    }

    useEffect(()=>{
        verifyToken()
        
    }, [verificationToken])

    

  return (
    <div>
        <Navbar></Navbar>
        <div>
            <h1 className='text-xl font-bold mb-2'>Wtiter Login</h1>
            <p className='text-sm'>{message}</p>
        </div>
        
    </div>
  )
}

export default VerifyLogin