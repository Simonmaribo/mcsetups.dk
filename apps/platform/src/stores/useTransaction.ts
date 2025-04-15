import getTransaction, { getTransactionResponse } from "@/api/users/getTransaction";
import { create } from "zustand";

type TransactionStore = {
    transaction: getTransactionResponse | null;
    setTransaction: ({ transactionId }: { transactionId?: string | number }) => Promise<void>;
    clearTransaction: () => void;
};

const useTransactionStore = create<TransactionStore>((set) => ({
    transaction: null,
    setTransaction: async ({ transactionId }: { transactionId?: string | number }) => {
        const transaction = await getTransaction({ transactionId} as any );
        set({ transaction })
    },
    clearTransaction: () => set({ transaction: null }),
}));

export default useTransactionStore;