
import { User } from "../types/auth";

export function calculateInstallmentPeriods(user: User | null, category: string): number {
  let periods = 3; // Default

  // Logic: 
  // - Students get 6 months (longer).
  // - Suits get strictly 2 months (shorter).
  
  // Student check
  if (user?.isStudent === true) {
      periods = 6;
  }
  
  // Category check (overrides student if suit?)
  // User request: "shorter installment for suit". 
  // Assuming this is a business constraint / risk management.
  if (category && category.toLowerCase() === 'suit') {
      periods = 2;
  }

  // Example for removing installments:
  // if (category.toLowerCase() === 'accessory') return 0;

  return periods;
}
