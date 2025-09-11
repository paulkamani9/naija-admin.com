/**
 * Currency utilities for handling money stored as integer cents
 *
 * All monetary values in the database are stored as integer cents to avoid
 * floating point precision issues. For example:
 * - $100.50 is stored as 10050 cents
 * - ₦1,500.75 is stored as 150075 cents
 */

/**
 * Convert dollars to cents (multiply by 100)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars (divide by 100)
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents
 * @param currency - Currency code (default: 'NGN' for Naira)
 * @param locale - Locale for formatting (default: 'en-NG')
 */
export function formatCurrency(
  cents: number,
  currency: string = "NGN",
  locale: string = "en-NG"
): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(dollars);
}

/**
 * Parse currency string to cents
 * Removes currency symbols and converts to cents
 */
export function parseCurrencyToCents(currencyString: string): number {
  // Remove all non-digit and non-decimal characters
  const numericString = currencyString.replace(/[^\d.-]/g, "");
  const dollars = parseFloat(numericString) || 0;
  return dollarsToCents(dollars);
}

/**
 * Validate that a cents value is reasonable for Nigerian context
 */
export function validateNairaCents(cents: number): boolean {
  // Minimum: ₦0.01 (1 cent)
  // Maximum: ₦100,000,000 (10 billion cents)
  return cents >= 1 && cents <= 10000000000;
}

/**
 * Format insurance plan costs for display
 */
export function formatPlanCosts(plan: {
  monthlyCostCents: number;
  yearlyCostCents: number;
  deductibleCents: number;
  annualOutOfPocketLimitCents: number;
  annualMaxBenefitCents: number;
}) {
  return {
    monthly: formatCurrency(plan.monthlyCostCents),
    yearly: formatCurrency(plan.yearlyCostCents),
    deductible: formatCurrency(plan.deductibleCents),
    outOfPocketLimit: formatCurrency(plan.annualOutOfPocketLimitCents),
    maxBenefit: formatCurrency(plan.annualMaxBenefitCents),
    // Calculate savings
    yearlySavings: formatCurrency(
      plan.monthlyCostCents * 12 - plan.yearlyCostCents
    ),
  };
}

/**
 * Calculate insurance plan metrics
 */
export function calculatePlanMetrics(plan: {
  monthlyCostCents: number;
  yearlyCostCents: number;
  deductibleCents: number;
  annualMaxBenefitCents: number;
}) {
  const monthlyDollars = centsToDollars(plan.monthlyCostCents);
  const yearlyDollars = centsToDollars(plan.yearlyCostCents);
  const deductibleDollars = centsToDollars(plan.deductibleCents);
  const maxBenefitDollars = centsToDollars(plan.annualMaxBenefitCents);

  return {
    effectiveMonthlyRate: yearlyDollars / 12,
    monthlySavings: monthlyDollars - yearlyDollars / 12,
    yearlyPremiumDiscount:
      ((monthlyDollars * 12 - yearlyDollars) / (monthlyDollars * 12)) * 100,
    coverageRatio: maxBenefitDollars / yearlyDollars,
    deductiblePercentage: (deductibleDollars / yearlyDollars) * 100,
  };
}
