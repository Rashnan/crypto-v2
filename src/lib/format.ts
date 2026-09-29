/** Insert a space every `size` characters, used to group bits or hex digits. */
export function groupEvery(value: string, size = 4): string {
  return value.replace(new RegExp(`(.{${size}})`, 'g'), '$1 ').trim()
}
