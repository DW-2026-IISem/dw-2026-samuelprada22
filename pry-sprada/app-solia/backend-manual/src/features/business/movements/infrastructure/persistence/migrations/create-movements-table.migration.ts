export const createMovementsTableMigration = {
  name: 'create-movements-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    // Production:
    // CREATE TABLE movements (
    //   id,
    //   referenceId,
    //   type,
    //   date,
    //   amount,
    //   observations,
    //   status,
    //   createdAt,
    //   updatedAt
    // );
  },

  async down(): Promise<void> {
    // Production: DROP TABLE movements
  },
};
