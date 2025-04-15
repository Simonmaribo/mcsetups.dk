import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Modal from "./Modal";

export default NiceModal.create(() => {

    const modal = useModal()

    return (
        <Modal modal={modal}
            className="sm:max-w-3xl"
            title="Styling Guide"
            description={
                <div>
                    Vi gør brug af Markdown til at style produktbeskrivelser og changelogs.<br/>
                    Du kan læse mere om Markdown her: <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" rel="noreferrer" target="_blank" className="text-blue-500">Markdown Guide</a>
                    <br/><br/>
                    Derudover kan du bruge ren HTML til at style din tekst.
                    <br/><br/>
                    <p className="text-slate-900 font-semibold text-lg">Eksempler</p>
                    <div className="bg-gray-100 p-2 rounded-md text-slate-900">
                        # Overskrift<br/>
                        ## Underskrift<br/>
                        **Fed tekst**<br/>
                        *Kursiv tekst*<br/>
                        [Link](https://www.google.com)<br/><br/>
                        ![Billede](https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png)<br/><br/>
                        {'<'}img src={'"'}https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png{'"'} alt={'"'}Billede{'"'} style={'"'}width: auto; height: 200px{'"'}/{'>'}<br/><br/>
                        
                        {'<'}span style={'"'}color: red{'"'}{'>'}Rød tekst{'<'}/span{'>'}<br/><br/>
                        
                        [youtube]3P7jnolWfHw[/youtube]<br/><br/>

                        ```<br/>
                        Kodeblok<br/>
                        ```<br/>
                        <br/>
                    </div>
                </div>
            }
        />
    )
})