/** Deep link that opens Ask and runs the query immediately. */
export function askHref(query: string) {
  return `/ask?q=${encodeURIComponent(query)}`;
}
