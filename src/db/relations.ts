import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  registryBook: {
    certificates: r.many.certificates(),
  },

  certificateTypes: {
    certificates: r.many.certificates(),
    blanks: r.many.certificateBlanks(),
  },

  certificateBlanks: {
    certificateType: r.one.certificateTypes({
      from: r.certificateBlanks.certificateTypeId,
      to: r.certificateTypes.id,
    }),
    certificate: r.one.certificates({
      from: r.certificateBlanks.id,
      to: r.certificates.blankId,
    }),
  },

  certificates: {
    registryBook: r.one.registryBook({
      from: r.certificates.registryBookId,
      to: r.registryBook.id,
    }),
    certificateType: r.one.certificateTypes({
      from: r.certificates.certificateTypeId,
      to: r.certificateTypes.id,
    }),
    blank: r.one.certificateBlanks({
      from: r.certificates.blankId,
      to: r.certificateBlanks.id,
    }),
    corrections: r.many.certificateCorrectionLog(),
  },

  certificateCorrectionLog: {
    certificate: r.one.certificates({
      from: r.certificateCorrectionLog.certificateId,
      to: r.certificates.id,
    }),
  },

  graduationDecisions: {},

  blankInventoryLog: {},
}));
