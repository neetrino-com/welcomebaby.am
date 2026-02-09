export const IDRAM_CONFIG = {
  paymentFormUrl: 'https://banking.idram.am/Payment/GetPayment',
} as const

export function getIdramCredentials(): { recAccount: string; secretKey: string } {
  // Только явно IDRAM_TEST_MODE=true — тест; иначе всегда боевые credentials (IDRAM_REC_ACCOUNT, IDRAM_SECRET_KEY)
  const isTest = process.env.IDRAM_TEST_MODE === 'true'
  return {
    recAccount: isTest ? (process.env.IDRAM_TEST_REC_ACCOUNT ?? '') : (process.env.IDRAM_REC_ACCOUNT ?? ''),
    secretKey: isTest ? (process.env.IDRAM_TEST_SECRET_KEY ?? '') : (process.env.IDRAM_SECRET_KEY ?? ''),
  }
}

export function getIdramPaymentFormUrl(): string {
  return IDRAM_CONFIG.paymentFormUrl
}
