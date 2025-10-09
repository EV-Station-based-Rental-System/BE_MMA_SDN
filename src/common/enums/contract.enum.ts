export enum ContractStatus {
  ISSUED = 'issued',
  PARTIALLY_SIGNED = 'partially_signed',
  SIGNED = 'signed',
  VOIDED = 'voided',
  EXPIRED = 'expired',
}

export enum ContractProvider {
  NATIVE = 'native',
  DOCUSIGN = 'docusign',
  ADOBESIGN = 'adobesign',
  SIGNNOW = 'signnow',
  OTHER = 'other',
}
