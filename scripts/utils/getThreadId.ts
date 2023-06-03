export function getThreadId() {
  const regexp = /^\/thread\/(backup:)?(?<threadId>\d+)\/page/;
  const group = window.location.pathname.match(regexp)?.groups || {};
  return group.threadId
}