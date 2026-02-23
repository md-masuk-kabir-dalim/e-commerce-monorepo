/**
 * Generates a unique slug (or any field) for a Mongoose model.
 *
 * @param model - Mongoose model (e.g., CategoryModel)
 * @param baseValue - The string to convert into a slug
 * @param fieldName - The field to test uniqueness for (e.g., "slug")
 */
export const generateUniqueIdentifier = async (
  model: any,
  baseValue: string,
  fieldName: string
): Promise<string> => {
  // Convert to slug
  let baseSlug = baseValue
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let uniqueValue = baseSlug;

  // Fetch all documents with slug starting with baseSlug
  const existingDocs = await model
    .find({ [fieldName]: new RegExp(`^${baseSlug}`) })
    .select(fieldName)
    .lean();

  if (existingDocs.length > 0) {
    const suffixes = existingDocs.map((doc: any) => {
      const value = doc[fieldName];
      const match = value.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const maxSuffix = Math.max(...suffixes);
    uniqueValue = `${baseSlug}-${maxSuffix + 1}`;
  }

  return uniqueValue;
};
