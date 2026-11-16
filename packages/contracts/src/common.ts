import * as z from 'zod';

export const ERROR_CODES = ['validation_error', 'not_found', 'conflict', 'internal_error'] as const;

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});

export const idParamSchema = z.object({ id: z.uuid() });

export const paginatedSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  });

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
