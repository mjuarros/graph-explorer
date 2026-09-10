import { z } from "zod";
import { fromError } from "zod-validation-error";

/**
 * Builds the exact `fromError` `ValidationError` that a function would throw
 * when `schema.safeParse(data)` fails. Use with `.toThrow()` or
 * `.rejects.toThrow()` to assert the full error instance, not just a message.
 */
export function validationErrorFor<T>(schema: z.ZodType<T>, data: unknown) {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    throw new Error("Expected schema to fail for this data");
  }
  return fromError(parsed.error);
}

/**
 * Asserts that `fn` throws a `ZodError` whose `issues` exactly match those
 * produced by `schema.safeParse(data)`. This is the closest we can get to
 * `toThrow(new ZodError(...))` because `new ZodError` carries internal state
 * that `toThrow`/`toEqual` do not ignore.
 */
export async function expectZodErrorFor<T>(
  schema: z.ZodType<T>,
  data: unknown,
  fn: () => Promise<unknown>,
) {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    throw new Error("Expected schema to fail for this data");
  }
  const expectedIssues = parsed.error.issues;

  try {
    await fn();
  } catch (error) {
    expect(error).toBeInstanceOf(z.ZodError);
    expect((error as z.ZodError).issues).toEqual(expectedIssues);
    return;
  }

  throw new Error("Expected function to throw a ZodError");
}
