export class NavLink {
  private static createLinkEvent = 'app:create-nav-link';
  private static targetQuery = 'a[href="/category/32"]'; // "黑洞台" button

  public static init() {
    window.addEventListener(this.createLinkEvent, () => this.createLink(), { once: true });
  };

  public static create() {
    window.dispatchEvent(new CustomEvent(this.createLinkEvent));
  };

  private static createLink() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;
    const nav = target.cloneNode() as HTMLAnchorElement;
    nav.href = '/category/32';
    nav.textContent = '備份台';
    target.replaceWith(nav);
  };
}