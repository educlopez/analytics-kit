/**
 * Is `field` a whole member of this `Vary` list?
 *
 * Plain JS, and shared, because both the local smoke check and the deployment
 * edge check need it and one of them is a bare node script.
 *
 * The reason this is a function and not an inline regex: `/\baccept\b/i` looks
 * correct and matches `Accept-Encoding`, since `-` is a non-word character so
 * the trailing `\b` closes. Next sends `Vary: Accept-Encoding` on every page
 * response, so that regex reports "Vary: Accept is present" on responses that
 * never mention Accept — an assertion that stays green while guarding nothing.
 */
export function varies(vary, field) {
  return (vary ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(field.toLowerCase());
}
