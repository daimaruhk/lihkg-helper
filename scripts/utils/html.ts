export function html<T extends HTMLElement = HTMLElement>(strings: TemplateStringsArray, ...values: unknown[]) {
  let plainHtml = strings[0];
  for (let i = 1; i < strings.length; i++) {
    const value = values[i - 1];
    if (typeof value === 'string') {
      plainHtml += value;
    } else {
      plainHtml += String(value);
    }
    plainHtml += strings[i];
  }
  const wrapper = document.createElement('div');
  wrapper.innerHTML = plainHtml;
  return wrapper.firstElementChild as T;
}