export interface Instruction {
  id: number;
  title: string;
  amount: number;
  scheduledDate: string;
  isPaid: boolean;
  description: string;
  groupId?: number | null;
} 