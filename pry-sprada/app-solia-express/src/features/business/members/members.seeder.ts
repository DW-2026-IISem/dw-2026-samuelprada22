import { faker } from "@faker-js/faker";
import { Member } from "./members.model";

/**
 * Seeder del feature Members.
 *
 * Genera datos falsos utilizando @faker-js/faker.
 *
 * Es idempotente:
 * si ya existen registros en la tabla members,
 * no vuelve a insertar datos.
 */
export async function seedMembers(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  members: count=0, se omite");
    return 0;
  }

  const existing = await Member.count();

  if (existing > 0) {
    console.log(
      `⏭️  members: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: faker.person.fullName(),
    description: faker.lorem.sentence(),
    isActive: true,
  }));

  await Member.bulkCreate(rows);

  console.log(
    `✅ members: insertados ${count} registro(s) falsos`
  );

  return count;
}
