export interface CreateInvestmentPlanRequest {
  name: string;
  description?: string;
  targetPrice: number;
  targetDate: string;
  investmentCategory: InvestmentCategory;
  investmentFrequency: InvestmentFrequency;
}

export enum InvestmentCategory {
  Vehicle = 1,
  Education = 2,
  House = 3,
  Trip = 4,
  Family = 5,
  Investment = 6,
  Technology = 7,
  Health = 8,
  SpecialDayAccumulation = 9,
  Other = 10
}

export enum InvestmentFrequency {
  Daily = 1,
  Weekly = 2,
  Monthly = 3
}

export interface InvestmentPlan {
  id: number;
  name: string;
  description?: string;
  targetPrice: number;
  currentAmount: number;
  targetDate: string;
  isCompleted: boolean;
  investmentCategory: InvestmentCategory;
  investmentFrequency: InvestmentFrequency;
  perPaymentAmount: number;
  howManyDaysLeft: number;
} 