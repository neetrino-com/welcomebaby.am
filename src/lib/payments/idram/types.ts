export interface IdramPaymentFormParams {
  EDP_LANGUAGE: 'RU' | 'EN' | 'AM'
  EDP_REC_ACCOUNT: string
  EDP_DESCRIPTION: string
  EDP_AMOUNT: string
  EDP_BILL_NO: string
  EDP_EMAIL?: string
  [key: string]: string | undefined
}
