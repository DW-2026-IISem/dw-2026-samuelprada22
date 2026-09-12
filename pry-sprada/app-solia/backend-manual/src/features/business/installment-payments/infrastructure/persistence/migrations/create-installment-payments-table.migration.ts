export const createInstallmentPaymentsTableMigration = {
  name: 'create-installment-payments-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    // Production:
    // CREATE TABLE installment_payments
    // (id, name, description, isActive, status, createdAt, updatedAt)
  },

  async down(): Promise<void> {
    // Production: DROP TABLE installment_payments
  },
};
