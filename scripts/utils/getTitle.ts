export function getTitle() {
  return (document.title || '').split('|')[0].trim();
}