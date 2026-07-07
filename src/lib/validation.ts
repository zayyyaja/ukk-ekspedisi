import { z } from "zod";

import { sanitizeInput } from "@/lib/sanitize";
import type { ValidationErrors } from "@/types/api";

export function formatZodError(error: z.ZodError): ValidationErrors {
  return error.issues.reduce<ValidationErrors>((formattedErrors, issue) => {
    const key = issue.path.join(".") || "root";
    formattedErrors[key] = formattedErrors[key] ?? [];
    formattedErrors[key].push(issue.message || "Nilai tidak valid");

    return formattedErrors;
  }, {});
}

export function validateRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> {
  return schema.parse(sanitizeInput(data));
}
