import { z } from "zod";

export const CompanyProfileUpdateSchema = z
  .object({
    trading_name: z.string().trim().nullish().transform((val) => (val && val.length > 0 ? val : null)),
    website: z.string().trim().nullish().transform((val) => (val && val.length > 0 ? val : null)),
    description: z.string().trim().nullish().transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export type CompanyProfileUpdateInput = z.infer<typeof CompanyProfileUpdateSchema>;
