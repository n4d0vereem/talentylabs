/**
 * Seed data pour développement
 * Crée l'agence par défaut et les catégories initiales
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local FIRST
config({ path: resolve(process.cwd(), ".env.local") });

const TEMP_AGENCY_ID = "agency_dev_temp_001";
const TEMP_USER_ID = "user_dev_temp_001"; // Sera remplacé par Better Auth

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Import dynamically AFTER dotenv is loaded
    const { db } = await import("./index");
    const { agencies, talentCategories, brands, users } = await import("./schema");
    const { eq } = await import("drizzle-orm");

    // Créer un user temporaire si il n'existe pas
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, TEMP_USER_ID))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: TEMP_USER_ID,
        email: "dev@talentylabs.local",
        emailVerified: true,
        name: "Dev User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ User temporaire créé");
    }

    // Vérifier si l'agence existe déjà
    const existingAgency = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, TEMP_AGENCY_ID))
      .limit(1);

    if (existingAgency.length === 0) {
      // Créer l'agence par défaut
      await db.insert(agencies).values({
        id: TEMP_AGENCY_ID,
        name: "Eidoles",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsR1VIXKGXfimfGgz9qZwKSm6mMmXoRla5Dw&s",
        primaryColor: "#000000",
        useDefaultColors: true,
        ownerId: TEMP_USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Agence créée");

      // Créer les catégories par défaut
      const defaultCategories = [
        "Influenceur",
        "Créateur de contenu",
        "Artiste",
        "Sportif",
        "Mannequin",
      ];

      for (const categoryName of defaultCategories) {
        await db.insert(talentCategories).values({
          id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: categoryName,
          agencyId: TEMP_AGENCY_ID,
          createdAt: new Date(),
        });
      }

      console.log("✅ Catégories créées");

      // Créer quelques marques par défaut
      const defaultBrands = [
        { name: "Nike", initials: "NK" },
        { name: "Adidas", initials: "AD" },
        { name: "Puma", initials: "PM" },
      ];

      for (const brand of defaultBrands) {
        await db.insert(brands).values({
          id: `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: brand.name,
          initials: brand.initials,
          logo: "",
          agencyId: TEMP_AGENCY_ID,
          createdAt: new Date(),
        });
        
        // Small delay to ensure unique IDs
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log("✅ Marques créées");
    } else {
      console.log("ℹ️  Agence déjà existante, skip seed");
    }

    console.log("🎉 Seed terminé !");
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };

