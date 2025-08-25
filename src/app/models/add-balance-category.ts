export enum AddBalanceCategory {
  Salary = 1,
  CashIncome = 2,
  AdditionalIncome = 3,
  PrizeIncome = 4,
  InvestmentIncome = 5,
  RentalIncome = 6,
  CreditCardMoney = 7,
  PiggyBank = 8,
  CrashPigyBank = 9
}

export const AddBalanceCategoryLabels: { [key in AddBalanceCategory]: string } = {
  [AddBalanceCategory.Salary]: 'Maaş',
  [AddBalanceCategory.CashIncome]: 'Nakit Gelir',
  [AddBalanceCategory.AdditionalIncome]: 'Ek Gelir',
  [AddBalanceCategory.PrizeIncome]: 'İkramiye Geliri',
  [AddBalanceCategory.InvestmentIncome]: 'Yatırım Geliri',
  [AddBalanceCategory.RentalIncome]: 'Kira Geliri',
  [AddBalanceCategory.CreditCardMoney]: 'Kredi Kartı Parası',
  [AddBalanceCategory.PiggyBank]: 'Kumbaraya Para Ekleme',
  [AddBalanceCategory.CrashPigyBank]: 'Kumbara Kırma'
};

export function getAddBalanceCategoryOptions() {
  return Object.entries(AddBalanceCategoryLabels)
    .filter(([value, label]) => {
      const categoryValue = Number(value);
      // PiggyBank ve CrashPigyBank kategorilerini filtrele
      return categoryValue !== AddBalanceCategory.PiggyBank && 
             categoryValue !== AddBalanceCategory.CrashPigyBank;
    })
    .map(([value, label]) => ({
      value: Number(value),
      label
    }));
} 