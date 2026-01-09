import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const certificationSchema = pgSchema("certification");

export const certificateStatusEnum = certificationSchema.enum(
  "certificate_status",
  ["active", "revoked", "corrected", "replaced"],
);

export const blankStatusEnum = certificationSchema.enum("blank_status", [
  "in_stock",
  "assigned",
  "used",
  "damaged",
  "destroyed",
]);

export const registryBook = certificationSchema.table(
  "registry_book",
  {
    id: serial("id").primaryKey(),
    bookNumber: text("book_number").notNull(),
    year: integer("year").notNull(),
    storageLocation: text("storage_location"),
    isClosed: boolean("is_closed").default(false).notNull(),
    openedAt: timestamp("opened_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("registry_book_number_year_uidx").on(
      table.bookNumber,
      table.year,
    ),
    index("registry_book_year_idx").on(table.year),
  ],
);

export const certificateBlanks = certificationSchema.table(
  "certificate_blanks",
  {
    id: serial("id").primaryKey(),
    serialNumber: text("serial_number").notNull().unique(),
    certificateTypeId: integer("certificate_type_id")
      .notNull()
      .references(() => certificateTypes.id, { onDelete: "restrict" }),
    status: blankStatusEnum("status").default("in_stock").notNull(),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
    receivedFrom: text("received_from"),
    assignedTo: text("assigned_to"),
    assignedAt: timestamp("assigned_at"),
    usedAt: timestamp("used_at"),
    destroyedAt: timestamp("destroyed_at"),
    destroyedReason: text("destroyed_reason"),
    destroyedBy: text("destroyed_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("certificate_blanks_serial_uidx").on(table.serialNumber),
    index("certificate_blanks_status_idx").on(table.status),
    index("certificate_blanks_typeId_idx").on(table.certificateTypeId),
  ],
);

export const certificateTypes = certificationSchema.table(
  "certificate_types",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    templatePath: text("template_path"),
    validityMonths: integer("validity_months"),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("certificate_types_code_uidx").on(table.code)],
);

export const certificates = certificationSchema.table(
  "certificates",
  {
    id: serial("id").primaryKey(),
    registryBookId: integer("registry_book_id")
      .notNull()
      .references(() => registryBook.id, { onDelete: "restrict" }),
    certificateTypeId: integer("certificate_type_id")
      .notNull()
      .references(() => certificateTypes.id, { onDelete: "restrict" }),
    blankId: integer("blank_id").references(() => certificateBlanks.id, {
      onDelete: "restrict",
    }),
    studentId: text("student_id").notNull(),

    fullNameSnapshot: text("full_name_snapshot").notNull(),
    dobSnapshot: date("dob_snapshot").notNull(),
    pobSnapshot: text("pob_snapshot").notNull(),
    genderSnapshot: text("gender_snapshot").notNull(),
    ethnicitySnapshot: text("ethnicity_snapshot"),
    nationalitySnapshot: text("nationality_snapshot"),
    idNumberSnapshot: text("id_number_snapshot"),

    classification: text("classification").notNull(),
    decisionNumber: text("decision_number").notNull(),
    decisionDate: date("decision_date").notNull(),
    serialNumber: text("serial_number").notNull().unique(),
    registryNumber: text("registry_number").notNull().unique(),

    issueDate: date("issue_date").notNull(),
    expiryDate: date("expiry_date"),
    signerName: text("signer_name"),
    signerTitle: text("signer_title"),

    status: certificateStatusEnum("status").default("active").notNull(),
    revocationReason: text("revocation_reason"),
    revocationDate: date("revocation_date"),
    revocationDecisionNumber: text("revocation_decision_number"),

    issuedBy: text("issued_by").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("certificates_serial_uidx").on(table.serialNumber),
    uniqueIndex("certificates_registry_uidx").on(table.registryNumber),
    index("certificates_registryBookId_idx").on(table.registryBookId),
    index("certificates_typeId_idx").on(table.certificateTypeId),
    index("certificates_studentId_idx").on(table.studentId),
    index("certificates_status_idx").on(table.status),
    index("certificates_decisionNumber_idx").on(table.decisionNumber),
  ],
);

export const certificateCorrectionLog = certificationSchema.table(
  "certificate_correction_log",
  {
    id: serial("id").primaryKey(),
    certificateId: integer("certificate_id")
      .notNull()
      .references(() => certificates.id, { onDelete: "restrict" }),
    correctionDecisionNumber: text("correction_decision_number").notNull(),
    correctionDate: date("correction_date").notNull(),
    oldContent: jsonb("old_content").notNull(),
    newContent: jsonb("new_content").notNull(),
    reason: text("reason").notNull(),
    performedBy: text("performed_by").notNull(),
    approvedBy: text("approved_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("correction_log_certificateId_idx").on(table.certificateId),
    index("correction_log_decisionNumber_idx").on(
      table.correctionDecisionNumber,
    ),
  ],
);

export const graduationDecisions = certificationSchema.table(
  "graduation_decisions",
  {
    id: serial("id").primaryKey(),
    decisionNumber: text("decision_number").notNull().unique(),
    decisionDate: date("decision_date").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    signerName: text("signer_name").notNull(),
    signerTitle: text("signer_title").notNull(),
    totalGraduates: integer("total_graduates").default(0).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedAt: timestamp("published_at"),
    createdBy: text("created_by").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("graduation_decisions_number_uidx").on(table.decisionNumber),
    index("graduation_decisions_date_idx").on(table.decisionDate),
  ],
);

export const blankInventoryLog = certificationSchema.table(
  "blank_inventory_log",
  {
    id: serial("id").primaryKey(),
    action: text("action").notNull(),
    serialNumberFrom: text("serial_number_from").notNull(),
    serialNumberTo: text("serial_number_to").notNull(),
    quantity: integer("quantity").notNull(),
    performedBy: text("performed_by").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("blank_inventory_action_idx").on(table.action),
    index("blank_inventory_performedBy_idx").on(table.performedBy),
  ],
);
