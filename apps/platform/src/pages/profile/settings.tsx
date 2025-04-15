import updateProfile from "@/api/users/profile/updateProfile"
import LoadingState from "@/components/atoms/state/LoadingState"
import IntegrationsField from "@/components/organisms/profile/settings/IntegrationsField"
import SettingsField from "@/components/organisms/profile/settings/SettingsField"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import withAuth from "@/hoc/withAuth"
import useUser from "@/hooks/useUser"
import DefaultLayout from "@/layouts/DefaultLayout"
import Meta from "@/layouts/Meta"
import ProfileLayout from "@/layouts/ProfileLayout"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import Tippy from "@tippyjs/react"
import { useState } from "react"
import { FieldValues, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"


const schema = z.object({
    displayName: 
        z.string().regex(/^[a-zA-Z0-9_]+$/, "Brugernavn må kun indeholde bogstaver, tal og understregningstegn."),
    description: z.string().optional().nullable(),
    emailNotifications: z.boolean()
})

function Settings(){

    const { user } = useUser()
    const [submitting, setSubmitting] = useState(false)
    const queryClient = useQueryClient()

    const { getValues, setValue, watch, register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched",
        defaultValues: {
            displayName: user?.displayName,
            description: user?.description || "",
            emailNotifications: user?.emailNotifications || false
        }
    });
    
    watch(["displayName", "description", "emailNotifications"])

    async function submit(data: FieldValues){
        if(!user) return;
        setSubmitting(true)
        await updateProfile({
            displayName: data.displayName,
            description: data.description,
            emailNotifications: data.emailNotifications
        })
        .then(() => {
            toast.success("Profil opdateret!")
            queryClient.invalidateQueries(["user"])
        }).catch((err) => {
            toast.error(err?.error || "Der skete en fejl.")
        }).finally(() => {
            setSubmitting(false)
        })
    }

    return (
        <DefaultLayout>
            <Meta title="McSetups | Profil-indstillinger"/>
            <div className="bg-white border-b border-t border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex justify-between items-center gap-4">
                    <div className="flex flex-col gap-5 w-full">
                        <h1 className="text-2xl font-bold text-slate-900">Indstillinger</h1>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                <div className="w-full mx-auto text-left ring-1 max-w-none bg-white shadow ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">    
                    <div className="flex flex-col gap-4">
                        { user ? (
                            <>
                                <SettingsField title="Profil" description="Vælg hvordan din profil vises på platformen.">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col sm:flex-row gap-x-4">
                                            <div className="flex-1">
                                                <label htmlFor="displayname" className="text-md font-medium text-gray-700">Brugernavn</label>
                                                <input {...register("displayName" )} className={`mt-1 w-full border rounded-md p-2 ${errors?.displayName?.message ? "border-red-500" : "border-gray-300"}`} placeholder={user?.displayName}/>
                                                {
                                                    errors?.displayName?.message ? (
                                                        <p className="text-red-500 text-sm">{errors?.displayName?.message}</p>
                                                    ) : (
                                                        <div className="flex flex-row justify-end">
                                                            <p className={`${(getValues()?.displayName?.length || 0) > 16 || (getValues()?.displayName?.length || 0) < 3 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.displayName?.length || 0} / 16`}</p>
                                                        </div> 
                                                    )
                                                }
                                            </div>   
                                            <div className="flex-1">
                                                <label htmlFor="discordname" className="text-md font-medium text-gray-700">Discord Navn</label>
                                                <input  value={user?.discordName} disabled className={`cursor-not-allowed mt-1 w-full border rounded-md p-2 border-gray-300 text-gray-500`} placeholder={user?.discordName}/>
                                                <div className="flex flex-row justify-end">
                                                    <p className={"text-gray-500 text-sm"}>Log ind for at opdatere</p>
                                                </div> 
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <div className="flex-1">
                                                <label htmlFor="email" className="text-md font-medium text-gray-700">Email</label>
                                                <input value={user?.email} disabled className={`cursor-not-allowed mt-1 w-full border rounded-md p-2 ${1+1==3 ? "border-red-500" : "border-gray-300"} text-gray-500`} placeholder={user?.email || "support@mcsetups.dk"}/>
                                                <div className="flex flex-row justify-end">
                                                    <p className={"text-gray-500 text-sm"}>Log ind for at opdatere</p>
                                                </div> 
                                            </div>   
                                        </div>
                                        <div className="flex">
                                            <div className="flex-1">
                                                <label htmlFor="description" className="text-md font-medium text-gray-700">Beskrivelse</label>
                                                <textarea {...register("description" )} className={`mt-1 w-full border rounded-md p-2 ${errors?.description?.message ? "border-red-500" : "border-gray-300"}`} placeholder="Skriv en kort beskrivelse om dig selv her..."/>
                                                <div className="flex flex-row justify-end">
                                                    <p className={`${(getValues()?.description?.length || 0) > 100 ? "text-red-500" : "text-gray-500" }`}>{`${getValues()?.description?.length || 0} / 100`}</p>
                                                </div> 
                                            </div>   
                                        </div>
                                    </div>
                                </SettingsField>
                                <IntegrationsField/>
                                <SettingsField title="Notifikationer" description="Vælg hvordan du vil modtage notifikationer.">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-row items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-slate-900">Via Hjemmesiden</h3>
                                                <p className="text-gray-500 text-sm">Modtag notifikationer på hjemmesiden.</p>
                                            </div>
                                            <Tippy content={<span>Du vil altid modtage notifikationer på hjemmesiden.</span>}>
                                                <div>
                                                    <Switch disabled checked/>
                                                </div>
                                            </Tippy>
                                        </div>
                                        <div className="flex flex-row items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-slate-900">Via Email</h3>
                                                <p className="text-gray-500 text-sm">Modtag notifikationer via email.</p>
                                            </div>
                                            <Switch
                                                onCheckedChange={(checked) => {
                                                    setValue("emailNotifications", checked)
                                                }}
                                                checked={getValues()?.emailNotifications}
                                            />
                                        </div>
                                    </div>
                                </SettingsField>
                                <div className="flex justify-end">
                                    <Button 
                                        disabled={submitting}
                                    onClick={handleSubmit((data) => submit(data))}>Gem ændringer</Button>
                                </div>
                            </>
                        ) : (
                            <LoadingState/>
                        ) }
                    </div>
                </div>
            </div>
        </DefaultLayout>
    )
}

export default withAuth(Settings)