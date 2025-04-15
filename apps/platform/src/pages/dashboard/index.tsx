import LoadingState from "@/components/atoms/state/LoadingState";
import useUser from "@/hooks/useUser";
import withAuth from "@/hoc/withAuth";
import AdminLayout from "@/layouts/AdminLayout";
import PendingReleases from "@/components/organisms/dashboard/PendingReleases";
import DashboardStats from "@/components/organisms/dashboard/DashboardStats";

function Dashboard(){
    
    let { user } = useUser();
    if(!user) return <div className="h-screen"> <LoadingState/></div>

    return (
        <AdminLayout>
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-10 pb-10 flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Velkommen, {user.displayName}</h1>
                </div>
            </div>
            <div className="mx-auto max-w-screen-xl px-2.5 md:px-20 pt-4 pb-10 items-center gap-4">
                <DashboardStats/>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-6 gap-y-6 mt-6">
                    { user.group <= 1 && (
                        <PendingReleases/>
                    )}
                    <div className="relative w-full mx-auto text-left ring-1 mt-0 max-w-none bg-white shadow border-blue-400 ring-gray-200 pl-6 pr-6 pt-6 pb-6 rounded-lg">
                        <h1 className="font-m">Åbne supportsager (10)</h1>
                    </div>
                </div>
                
            </div>
        </AdminLayout>
    )
}

export default withAuth(Dashboard, { maxGroup: 1 });