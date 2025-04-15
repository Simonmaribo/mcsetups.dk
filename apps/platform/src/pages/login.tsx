import { useEffect } from "react"

export default function Login(){

    useEffect(() => {
        if(typeof window !== 'undefined'){
            window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`
        }
    }, [])
    
    return (<></>)
}