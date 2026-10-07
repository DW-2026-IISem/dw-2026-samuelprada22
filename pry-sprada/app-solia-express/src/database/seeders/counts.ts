export type SeedCounts = {
  members: number;
  accounts: number;
  movements: number;
  credit_applications: number;
  credits: number;
  rates: number;
  installments: number;
  installment_payments: number;
  committee_decisions: number;
  audits: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  members: 10,
  accounts: 10,
  movements: 15,
  credit_applications: 10,
  credits: 10,
  rates: 10,
  installments: 20,
  installment_payments: 20,
  committee_decisions: 10,
  audits: 25,
};

export function resolveSeedCounts(): SeedCounts {
  return {
    members:
      Number(process.env.SEED_MEMBERS) ||
      DEFAULT_SEED_COUNTS.members,

    accounts:
      Number(process.env.SEED_ACCOUNTS) ||
      DEFAULT_SEED_COUNTS.accounts,

    movements:
      Number(process.env.SEED_MOVEMENTS) ||
      DEFAULT_SEED_COUNTS.movements,

    credit_applications:
      Number(process.env.SEED_CREDIT_APPLICATIONS) ||
      DEFAULT_SEED_COUNTS.credit_applications,

    credits:
      Number(process.env.SEED_CREDITS) ||
      DEFAULT_SEED_COUNTS.credits,

    rates:
      Number(process.env.SEED_RATES) ||
      DEFAULT_SEED_COUNTS.rates,

    installments:
      Number(process.env.SEED_INSTALLMENTS) ||
      DEFAULT_SEED_COUNTS.installments,

    installment_payments:
      Number(process.env.SEED_INSTALLMENT_PAYMENTS) ||
      DEFAULT_SEED_COUNTS.installment_payments,

    committee_decisions:
      Number(process.env.SEED_COMMITTEE_DECISIONS) ||
      DEFAULT_SEED_COUNTS.committee_decisions,

    audits:
      Number(process.env.SEED_AUDITS) ||
      DEFAULT_SEED_COUNTS.audits,
  };
}
