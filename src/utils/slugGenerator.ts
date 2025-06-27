// Utility functions for generating URL-friendly slugs

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export function isValidSlug(slug: string): boolean {
  // Check if slug contains only valid characters
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug) && slug.length > 0 && !slug.startsWith('-') && !slug.endsWith('-')
}
