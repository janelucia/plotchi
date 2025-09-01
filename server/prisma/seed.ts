import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.wateringHistory.deleteMany();
  await prisma.plantPhoto.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      id: "demo-user-id",
      email: "demo@plant-tamagotchi.com",
      name: "Demo User",
    },
  });

  console.log("👤 Created demo user");

  // Create sample plants with realistic data
  const plants = await Promise.all([
    // Plants with different watering schedules and statuses
    prisma.plant.create({
      data: {
        name: "Monstera Deliciosa",
        species: "Monstera deliciosa",
        wateringFrequencyDays: 7,
        lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        notes:
          "Loves bright, indirect light. Starting to develop fenestrations!",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "Snake Plant",
        species: "Sansevieria trifasciata",
        wateringFrequencyDays: 14,
        lastWatered: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago (overdue)
        notes: "Very low maintenance. Perfect for beginners.",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "Fiddle Leaf Fig",
        species: "Ficus lyrata",
        wateringFrequencyDays: 10,
        lastWatered: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago (overdue)
        notes: "Drama queen! Very sensitive to overwatering and underwatering.",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "Peace Lily",
        species: "Spathiphyllum wallisii",
        wateringFrequencyDays: 5,
        lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: "Droops dramatically when thirsty - great natural indicator!",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "Pothos",
        species: "Epipremnum aureum",
        wateringFrequencyDays: 7,
        lastWatered: null, // Never watered (new plant)
        notes:
          "Propagated from my friend's plant. Should root easily in water.",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "Rubber Plant",
        species: "Ficus elastica",
        wateringFrequencyDays: 8,
        lastWatered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: "Beautiful glossy leaves. Wipe them weekly for best shine.",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "Spider Plant",
        species: "Chlorophytum comosum",
        wateringFrequencyDays: 6,
        lastWatered: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago (overdue)
        notes: "Producing lots of babies! Need to propagate them soon.",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),

    prisma.plant.create({
      data: {
        name: "ZZ Plant",
        species: "Zamioculcas zamiifolia",
        wateringFrequencyDays: 21,
        lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        notes: "Almost indestructible. Perfect for my dark corner.",
        profileImageUrl: null,
        userId: demoUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${plants.length} plants`);

  // Create some watering history for a few plants with photo examples
  const wateringHistory = await Promise.all([
    // Monstera watering history
    prisma.wateringHistory.create({
      data: {
        plantId: plants[0].id,
        wateredAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        notes: "First watering after repotting",
        imageUrl: null, // No photo for this early entry
      },
    }),
    prisma.wateringHistory.create({
      data: {
        plantId: plants[0].id,
        wateredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: "Regular watering - new leaf unfurling!",
        imageUrl: null, // Could add sample image path here later
      },
    }),

    // Snake Plant watering history
    prisma.wateringHistory.create({
      data: {
        plantId: plants[1].id,
        wateredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: "Initial watering when I got it",
        imageUrl: null,
      },
    }),
    prisma.wateringHistory.create({
      data: {
        plantId: plants[1].id,
        wateredAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        notes: "Soil was completely dry - finally watered it!",
        imageUrl: null, // Sample watering photo could go here
      },
    }),

    // Peace Lily watering history
    prisma.wateringHistory.create({
      data: {
        plantId: plants[3].id,
        wateredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: "Was starting to droop dramatically",
        imageUrl: null,
      },
    }),
    prisma.wateringHistory.create({
      data: {
        plantId: plants[3].id,
        wateredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: "Regular maintenance watering - looking perky again",
        imageUrl: null, // Great opportunity for before/after photos
      },
    }),

    // Rubber Plant watering history with photo documentation
    prisma.wateringHistory.create({
      data: {
        plantId: plants[5].id,
        wateredAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        notes: "After cleaning the leaves - they look so shiny!",
        imageUrl: null, // Perfect for a photo journal entry
      },
    }),
    prisma.wateringHistory.create({
      data: {
        plantId: plants[5].id,
        wateredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: "Regular watering + photo to track new growth",
        imageUrl: null, // Most recent watering with photo
      },
    }),
  ]);

  console.log(`💧 Created ${wateringHistory.length} watering history records`);

  // Summary of what was created
  const plantsWithStatus = await prisma.plant.findMany({
    include: {
      wateringHistory: {
        orderBy: { wateredAt: "desc" },
        take: 1,
      },
    },
  });

  console.log("\n🌿 Seed Summary:");
  plantsWithStatus.forEach((plant) => {
    const daysSinceWatered = plant.lastWatered
      ? Math.floor(
          (Date.now() - plant.lastWatered.getTime()) / (1000 * 60 * 60 * 24),
        )
      : "Never";
    const isOverdue = plant.lastWatered
      ? daysSinceWatered >= plant.wateringFrequencyDays
      : true;

    console.log(`  📍 ${plant.name} (${plant.species})`);
    console.log(`     Watering frequency: ${plant.wateringFrequencyDays} days`);
    console.log(`     Last watered: ${daysSinceWatered} days ago`);
    console.log(`     Status: ${isOverdue ? "🚨 OVERDUE" : "✅ OK"}`);
    console.log("");
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
