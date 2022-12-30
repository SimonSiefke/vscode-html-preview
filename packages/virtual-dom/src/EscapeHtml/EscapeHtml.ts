export const escapeHtml = (text: string) => {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
