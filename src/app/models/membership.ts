export interface CreateMembershipRequest {
  digitalPlatformId: number;
  subscriptionType: SubscriptionType;
  creditCardId: number;
}

export enum SubscriptionType {
  Monthly = 1,
  Yearly = 2,
  SixMonthly = 3
}

export interface UserMembership {
  digitalPlatformId: number;
  digitalPlatformName: string;
  imagePath: string | null;
  subscriptionPlanName: string;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
} 