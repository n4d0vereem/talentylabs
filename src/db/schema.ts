import { pgTable, text, timestamp, boolean, integer, json, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TALENT_MANAGER', 'TALENT']);
export const userStatusEnum = pgEnum('user_status', ['INVITED', 'ACTIVE', 'DISABLED']);
export const invitationStatusEnum = pgEnum('invitation_status', ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED']);

// ============================================
// BETTER AUTH TABLES
// ============================================

// @ts-ignore - Circular reference with agencies is resolved at runtime
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  name: text("name"),
  image: text("image"),
  
  // Nouveaux champs pour le système de collaborateurs
  role: userRoleEnum("role").default('TALENT_MANAGER').notNull(),
  status: userStatusEnum("status").default('ACTIVE').notNull(),
  // @ts-ignore - Circular reference with agencies is resolved at runtime
  agencyId: text("agency_id").references(() => agencies.id, { onDelete: "cascade" }),
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  password: text("password"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ============================================
// AGENCY & SETTINGS
// ============================================

export const agencies = pgTable("agencies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  primaryColor: text("primary_color").default("#000000"),
  useDefaultColors: boolean("use_default_colors").default(true),
  // @ts-ignore - Circular reference with users is resolved at runtime
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const talentCategories = pgTable("talent_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  agencyId: text("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  initials: text("initials").notNull(),
  agencyId: text("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// TALENTS
// ============================================

export const talents = pgTable("talents", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: text("birth_date"),
  category: text("category"),
  topSize: text("top_size"),
  bottomSize: text("bottom_size"),
  shoeSize: text("shoe_size"),
  foodIntolerances: text("food_intolerances"),
  address: text("address"),
  addressComplement: text("address_complement"),
  addressSecondary: text("address_secondary"),
  phone: text("phone"),
  email: text("email"),
  bio: text("bio"),
  location: text("location"),
  image: text("image"),
  
  // Social media
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  snapchat: text("snapchat"),
  
  // Instagram data (stored as JSON)
  instagramData: json("instagram_data").$type<{
    handle: string;
    followers: string;
    engagement: string;
    avgLikes: string;
  }>(),
  
  agencyId: text("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COLLABORATIONS
// ============================================

export const collaborations = pgTable("collaborations", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }),
  marque: text("marque").notNull(), // Nom de la marque (dénormalisé pour performance)
  mois: text("mois").notNull(),
  contenu: text("contenu"),
  datePreview: text("date_preview"),
  datePublication: text("date_publication"),
  budget: text("budget").notNull(),
  type: text("type").notNull(), // "entrant" | "sortant"
  gestionnaire: text("gestionnaire"),
  facture: text("facture"),
  statut: text("statut").notNull(), // "en_cours" | "termine" | "annule"
  displayOrder: integer("display_order").default(0).notNull(), // Ordre d'affichage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CALENDAR EVENTS
// ============================================

export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  type: text("type").notNull(), // "RDV" | "EVENT" | "PREVIEW" | "PUBLICATION" | "TOURNAGE"
  description: text("description"),
  location: text("location"),
  document: text("document"), // base64 ou URL
  photo: text("photo"), // base64 ou URL
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// INSIGHTS (statistics manually editable)
// ============================================

export const talentInsights = pgTable("talent_insights", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }).unique(),
  
  // Instagram
  instagramFollowers: text("instagram_followers"),
  instagramEngagement: text("instagram_engagement"),
  instagramAvgLikes: text("instagram_avg_likes"),
  instagramGrowth: text("instagram_growth"),
  
  // TikTok
  tiktokFollowers: text("tiktok_followers"),
  tiktokEngagement: text("tiktok_engagement"),
  tiktokViews: text("tiktok_views"),
  
  // Snapchat
  snapchatFollowers: text("snapchat_followers"),
  snapchatViews: text("snapchat_views"),
  
  // YouTube
  youtubeSubscribers: text("youtube_subscribers"),
  youtubeEngagement: text("youtube_engagement"),
  youtubeAvgViews: text("youtube_avg_views"),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// MEDIA KIT
// ============================================

export const mediaKits = pgTable("media_kits", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }).unique(),
  pdfUrl: text("pdf_url").notNull(), // base64 ou URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// DOCUMENTS (Passeport, ID, contrats, etc.)
// ============================================

export const talentDocuments = pgTable("talent_documents", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Passeport", "Carte d'identité", "Contrat", etc.
  fileUrl: text("file_url").notNull(), // base64 ou URL du PDF/image
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ============================================
// TODOS (To-do list pour chaque talent)
// ============================================

export const talentTodos = pgTable("talent_todos", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  deadline: text("deadline"), // Format: YYYY-MM-DD
  completed: boolean("completed").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// INVITATIONS
// ============================================

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  agencyId: text("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  status: invitationStatusEnum("status").default('PENDING').notNull(),
  
  expiresAt: timestamp("expires_at").notNull(),
  invitedBy: text("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  acceptedAt: timestamp("accepted_at"),
  
  metadata: json("metadata").$type<{ talentIds?: string[] }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// TALENT ASSIGNMENTS (User ↔ Talent)
// ============================================

export const talentAssignments = pgTable("talent_assignments", {
  id: text("id").primaryKey(),
  talentId: text("talent_id").notNull().references(() => talents.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedBy: text("assigned_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleOnTalent: text("role_on_talent").notNull().default('MANAGER'), // 'MANAGER' | 'VIEWER'
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COLLABORATORS (ancienne table, peut être gardée pour infos externes)
// ============================================

export const collaborators = pgTable("collaborators", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // "Talent Manager" | "Commercial" | etc.
  type: text("type").notNull(), // "Interne" | "Freelance" | "Prestataire"
  status: text("status").notNull(), // "Actif" | "Inactif" | "En attente"
  permissions: json("permissions").$type<{
    canViewAllTalents: boolean;
    canEditTalents: boolean;
    canViewFinance: boolean;
    canManageCampaigns: boolean;
  }>(),
  agencyId: text("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  talentAssignments: many(talentAssignments),
  invitationsSent: many(invitations, { relationName: 'invitedBy' }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  agency: one(agencies, {
    fields: [invitations.agencyId],
    references: [agencies.id],
  }),
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'invitedBy',
  }),
}));

export const talentAssignmentsRelations = relations(talentAssignments, ({ one }) => ({
  talent: one(talents, {
    fields: [talentAssignments.talentId],
    references: [talents.id],
  }),
  user: one(users, {
    fields: [talentAssignments.userId],
    references: [users.id],
  }),
  assigner: one(users, {
    fields: [talentAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  owner: one(users, {
    fields: [agencies.ownerId],
    references: [users.id],
  }),
  talents: many(talents),
  brands: many(brands),
  categories: many(talentCategories),
  collaborators: many(collaborators),
}));

export const talentsRelations = relations(talents, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [talents.agencyId],
    references: [agencies.id],
  }),
  collaborations: many(collaborations),
  events: many(calendarEvents),
  insights: one(talentInsights),
  mediaKit: one(mediaKits),
  documents: many(talentDocuments),
  todos: many(talentTodos),
  assignments: many(talentAssignments),
}));

export const collaborationsRelations = relations(collaborations, ({ one }) => ({
  talent: one(talents, {
    fields: [collaborations.talentId],
    references: [talents.id],
  }),
}));

