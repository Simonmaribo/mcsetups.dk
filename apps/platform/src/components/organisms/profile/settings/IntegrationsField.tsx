import { IntegrationType } from "database";
import SettingsField from "./SettingsField";
import getIntegrations from "@/api/users/profile/integrations/getIntegrations";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/useUser";
import { Badge } from "@/components/molecules/Badge";
import Tippy from "@tippyjs/react";
import connectPaypal from "@/api/users/profile/integrations/paypal/connectPaypal";
import disconnectPaypal from "@/api/users/profile/integrations/paypal/disconnectPaypal";

const INTEGRATIONS: {
    name: string;
    description: string;
    icon: string;
    type: IntegrationType,
    functions: {
        connect: () => Promise<void>;
        disconnect: () => Promise<void>;
    }
}[] = [
    {
        name: "PayPal",
        description: "Tilslut din PayPal-konto for at modtage betalinger.",
        icon: "/images/icons/paypal.png",
        type: "PAYPAL",
        functions: {
            connect: async () => connectPaypal(),
            disconnect: async () => disconnectPaypal()
        }
    },
]

export default function IntegrationsField(){

    const { user } = useUser();
    
    const { data: integrations } = useQuery({
        queryKey: ['user-integrations'],
        queryFn: async() => await getIntegrations(),
        refetchOnWindowFocus: true,
    });

    const isConnected = (type: IntegrationType) => {
        if(!integrations) return null;
        if(integrations.length === 0) return null;
        if(integrations.find(int => int.type === type) === undefined) return null;
        return true;
    }

    return (
        <SettingsField title="Integrationer" description="Tilslut dine integrationskontoer.">
            <div className="flex flex-col gap-2">
                {
                    INTEGRATIONS.map((integration, index) => (
                        <div className="ring-1 ring-gray-200 p-3 bg-gray-50 rounded-lg">
                            <div className="flex flex-row gap-2">
                                <div className="w-10 h-10 p-2 rounded-full bg-white">
                                    <img src={integration.icon} alt={integration.name} className="w-full h-full object-contain"/>
                                </div>
                                <div className="flex w-full justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-slate-900">{integration.name}</h2>
                                        </div>
                                        <p className="text-gray-500 text-sm">{integration.description}</p>
                                    </div>
                                    { integrations && (
                                        <div className="flex flex-col">
                                            { 
                                                isConnected(integration.type) == null ? (
                                                    <div onClick={() => integration.functions.connect()} className="px-2 py-1 shadow rounded-md bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer active:scale-95 transition-all">
                                                        <p className="text-sm text-gray-500">Tilslut</p>
                                                    </div>
                                                ) : (
                                                    <div onClick={() => integration.functions.disconnect()}  className="px-2 py-1 shadow rounded-md bg-emerald-200 border border-emerald-300 hover:bg-emerald-100 cursor-pointer active:scale-95 transition-all">
                                                        <p className="text-sm text-emerald-900">Tilsluttet</p>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </SettingsField>
    )
}