export const createCreditsTableMigration = {
  name: 'create-credits-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    // Production:
    // CREATE TABLE credits (
    //   id,
    //   referenceId,
    //   date,
    //   amount,
    //   status,
    //   observations,
    //   createdAt,
    //   updatedAt
    // )
  },

  async down(): Promise<void> {
    // Production: DROP TABLE credits
  },
};
