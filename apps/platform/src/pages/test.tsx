import { useEffect, useState } from "react"

export default function ConicBlurEffect(){

    const [containerRotate, setContainerRotate] = useState(0);
    

    useEffect(() => {
        const interval = setInterval(() => {
            if(containerRotate >= 360) setContainerRotate(0)
            else setContainerRotate(containerRotate + 0.1)
        }, 5)
        return () => clearInterval(interval)
    }, [containerRotate])

    return (
        <>
            <style jsx>{`
            .container {
                border-radius: 500px;
                filter: blur(70px);
                height: 400px;
                overflow: visible;
                width: 400px;
            }

            .conic {
                background: conic-gradient(from 0deg at 50% 50%,#5792ff 0deg,rgb(120,183,255) 54deg,#00a6ff 106deg,#4797ff 162deg,#04f 252deg,rgb(51,153,255) 306deg,rgb(89,167,255) 360deg);
                border-radius: 50%;
                inset: 140px 0 0;
                opacity: .8;
                overflow: hidden;
                position: absolute;
            }

            `}</style>
            <div className="flex items-center justify-center h-screen">
                <div className="container" style={{ rotate: `${containerRotate}deg`}}>
                    <div className="conic" style={{ scale: `${0.9 + 0.1 * Math.sin((containerRotate * Math.PI) / 180)}`}}/>
                </div>
            </div>
        </>
    )
}