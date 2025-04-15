import ProfileLayout from "@/layouts/ProfileLayout";
import DeveloperProfile from "@/components/templates/DeveloperProfile";
import UserProfile from "@/components/templates/UserProfile";
import LoadingState from "@/components/atoms/state/LoadingState";
import useUser from "@/hooks/useUser";
import withAuth from "@/hoc/withAuth";
import Meta from "@/layouts/Meta";

function Profile(){
    let { user } = useUser();
    if(!user) return <div className="h-screen"> <LoadingState/></div>
    return (
        <>
            <Meta title="McSetups | Profil"/>
            <ProfileLayout>
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10">
                    { user.verified ? <DeveloperProfile user={user}/> : <UserProfile user={user}/>} 
                </div>
            </ProfileLayout>
        </>
    )
}

export default withAuth(Profile);