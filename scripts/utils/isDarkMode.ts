export function isDarkMode() {
  const settings = JSON.parse(window.localStorage.getItem('modesettings') as string);
  const officeMode = Number(window.localStorage.getItem('officemode')) || 0;
  const isDarkMode = settings[officeMode]?.darkMode;
  return !!isDarkMode;
}