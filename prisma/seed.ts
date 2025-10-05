import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const a = await prisma.person.create({ data: { fullName: "Grandparent A" } });
  const b = await prisma.person.create({ data: { fullName: "Parent B" } });
  const c = await prisma.person.create({ data: { fullName: "Child C" } });
  await prisma.relationship.create({ data: { parentId: a.id, childId: b.id } });
  await prisma.relationship.create({ data: { parentId: b.id, childId: c.id } });
}
main().finally(() => process.exit(0));
