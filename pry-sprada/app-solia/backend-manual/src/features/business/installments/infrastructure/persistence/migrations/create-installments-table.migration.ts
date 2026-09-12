export const createInstallmentsTableMigration = {
  name: 'create-installments-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    // Production:
    // CREATE TABLE installments (
    //   id,
    //   name,
    //   description,
    //   isActive,
    //   status,
    //   createdAt,
    //   updatedAt
    // )
  },

  async down(): Promise<void> {
    // Production: DROP TABLE installments
  },
};
