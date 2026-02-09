import { createHash } from 'crypto'

export function md5(text: string): string {
  return createHash('md5').update(text, 'utf8').digest('hex')
}

export function verifyIdramChecksum(params: {
  recAccount: string
  amountFromOrder: string
  secretKey: string
  billNo: string
  payerAccount: string
  transId: string
  transDate: string
  receivedChecksum: string
}): boolean {
  const str = `${params.recAccount}:${params.amountFromOrder}:${params.secretKey}:${params.billNo}:${params.payerAccount}:${params.transId}:${params.transDate}`
  const calculated = md5(str).toUpperCase()
  const received = (params.receivedChecksum ?? '').toUpperCase()
  return calculated === received
}
