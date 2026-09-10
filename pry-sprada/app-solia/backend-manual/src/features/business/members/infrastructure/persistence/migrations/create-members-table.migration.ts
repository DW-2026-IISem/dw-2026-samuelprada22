export const createMembersTableMigration = {
  name: 'create-members-table',

  async up(): Promise<void> {
    // Sequelize sync handles table creation in development.
    // Production:
    // CREATE TABLE members (
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
    // Production: DROP TABLE members
  },
};
