export const createCreditApplicationsTableMigration = {
  name: 'create-credit-applications-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    //
    // Production:
    // CREATE TABLE credit_applications (
    //   id,
    //   referenceId,
    //   date,
    //   amount,
    //   status,
    //   observations,
    //   createdAt,
    //   updatedAt
    // );
  },

  async down(): Promise<void> {
    // Production:
    // DROP TABLE credit_applications
  },
};
