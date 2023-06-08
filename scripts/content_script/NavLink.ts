class NavLink {
  private targetQuery = 'a[href="/category/32"]'; // "黑洞台" button
  private created = false;

  public create() {
    // only need to create once
    if (this.created) return;
    this.created = true;
    const target = document.querySelector(this.targetQuery);
    if (!target) return;
    const nav = target.cloneNode() as HTMLAnchorElement;
    nav.href = '/category/32';
    nav.textContent = '備份台';
    target.replaceWith(nav);
  };
}

export default new NavLink();