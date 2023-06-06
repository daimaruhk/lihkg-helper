class NavLink {
  private createLinkEvent = 'app:create-nav-link';
  private targetQuery = 'a[href="/category/32"]'; // "黑洞台" button

  constructor() {
    window.addEventListener(this.createLinkEvent, () => this.createLink(), { once: true });
  };

  public create() {
    window.dispatchEvent(new CustomEvent(this.createLinkEvent));
  };

  private createLink() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;
    const nav = target.cloneNode() as HTMLAnchorElement;
    nav.href = '/category/32';
    nav.textContent = '備份台';
    target.replaceWith(nav);
  };
}

export default new NavLink();