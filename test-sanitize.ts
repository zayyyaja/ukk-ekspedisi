import { z } from "zod";
import { sanitizeInput } from "./src/lib/sanitize";

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaInput: z.string().min(1),
});

export function validateRequest<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown,
): z.infer<TSchema> {
  return schema.parse(sanitizeInput(data));
}

try {
  const data = {
    email: "test@example.com",
    password: "password123",
    captchaInput: "03AFcWeA7..."
  };
  console.log("Input:", data);
  const validated = validateRequest(customerLoginSchema, data);
  console.log("Validated:", validated);
} catch (e) {
  console.error("Error:", e);
}
