export default function LoadingState({
    color = "#0050ff"
}: { color?: string }) {

    // convert hex to rgba
    const rgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <style jsx>{`
                #loading {
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    border: 3px solid ${rgba(color, .3)};
                    border-radius: 50%;
                    border-top-color: ${color};
                    animation: spin 1s ease-in-out infinite;
                    -webkit-animation: spin 1s ease-in-out infinite;
                }
                
                @keyframes spin {
                    to { -webkit-transform: rotate(360deg); }
                }
                @-webkit-keyframes spin {
                    to { -webkit-transform: rotate(360deg); }
                }
            `}</style>
            <div id="loading"/>
        </div>
    )
}