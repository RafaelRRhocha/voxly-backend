import bcrypt from "bcrypt";

import { PrismaClient, SurveyType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEntity = await prisma.entity.create({
    data: {
      name: "Admin",
    },
  });

  const ADMIN_PASSWORD = process.env.JWT_SECRET || "admin123";
  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@voxly.com",
      password_hash: adminPassword,
      entity_id: adminEntity.id,
      role: UserRole.admin,
    },
  });

  console.log("Entity and user created:", {
    entity: adminEntity,
    user: { ...adminUser, password_hash: "[HIDDEN]" },
  });

  const demoEntity = await prisma.entity.create({
    data: {
      name: "Demo Account",
    },
  });

  const demoPassword = await bcrypt.hash("demo123", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@voxly.com",
      password_hash: demoPassword,
      entity_id: demoEntity.id,
      role: UserRole.manager,
    },
  });

  console.log("Demo entity and user created:", {
    entity: demoEntity,
    user: { ...demoUser, password_hash: "[HIDDEN]" },
  });

  const store = await prisma.store.create({
    data: {
      name: "Store 1",
      entity_id: demoEntity.id,
    },
  });
  console.log("Store created:", store);

  const seller = await prisma.seller.create({
    data: {
      name: "Seller 1",
      store_id: store.id,
    },
  });
  console.log("Seller created:", seller);

  const seller2 = await prisma.seller.create({
    data: {
      name: "Seller 2",
      store_id: store.id,
    },
  });
  console.log("Seller created:", seller2);

  const survey = await prisma.survey.create({
    data: {
      name: "Survey 1",
      type: SurveyType.nps,
      seller_id: seller.id,
      created_by: demoUser.id,
    },
  });
  console.log("Survey created:", survey);

  const survey2 = await prisma.survey.create({
    data: {
      name: "Survey 2",
      type: SurveyType.nps,
      seller_id: seller2.id,
      created_by: demoUser.id,
    },
  });
  console.log("Survey created:", survey2);

  const surveyResponse = await prisma.surveyResponse.createMany({
    data: [
      {
        survey_id: survey.id,
        score: 5,
        comment: "This is a comment 1",
      },
      {
        survey_id: survey.id,
        score: 5,
        comment: "This is a comment 2",
      },
      {
        survey_id: survey2.id,
        score: 5,
        comment: "This is a comment 3",
      },
    ],
  });
  console.log("Survey Responses created:", surveyResponse);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
