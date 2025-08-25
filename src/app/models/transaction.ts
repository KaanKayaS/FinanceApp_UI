export interface Transaction {
    digitalPlatformName: string;
    subscriptionPlanName: string | null;
    amount: number;
    paymentDate: string;
    addBalanceCategory: number | null;
} 