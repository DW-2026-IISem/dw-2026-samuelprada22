export const createAccountsTableMigration = {
  name: 'create-accounts-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    // Production:
    // CREATE TABLE accounts (
    //   id,
    //   name,
    //   description,
    //   isActive,
    //   status,
    //   createdAt,
    //   updatedAt
    // );
  },

  async down(): Promise<void> {
    // Production: DROP TABLE accounts
  },
};
