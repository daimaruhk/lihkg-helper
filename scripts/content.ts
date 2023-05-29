import { BackupHelper, injectScript, isDarkMode, isMobileDevice } from './utils';

const navBtnQueryDesktop = '[data-tip="熱門回覆"]';
const navBtnQueryMobile = 'ul li button .i-hot-reply';
const drawerBtnQuery = 'a[href="/category/32"]'; // "黑洞台" button

// since LIHKG.com is client-side rendering,
// use MutationObserver to observe the DOM rendering process,
// append the extension DOM whenever the rendering is done.
const observer = new MutationObserver((mutations) => {
  const isMobile = isMobileDevice();
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      const isElementNode = node.nodeType === 1;
      if (isElementNode) {
        const element = node as HTMLElement;

        if (!!element.querySelector(drawerBtnQuery)) {
          window.dispatchEvent(new CustomEvent('app:create-drawer-btn'));
        }

        if (!isMobile && !!element.querySelector(navBtnQueryDesktop)) {
          window.dispatchEvent(new CustomEvent('app:create-desktop-nav-btn'));
        }

        if (isMobile && !!element.querySelector(navBtnQueryMobile)) {
          window.dispatchEvent(new CustomEvent('app:create-mobile-nav-btn', { detail: { element } }));
        }
      }
    })
  })
});

observer.observe(document.body, { childList: true, subtree: true });

// create a backup button on the nav bar (Desktop)
window.addEventListener('app:create-desktop-nav-btn', () => {
  const sibling = document.querySelector(navBtnQueryDesktop)!;
  const backupImagePath = `images/backup-${isDarkMode() ? 'dark' : 'light'}.png`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span data-tip="備份" title="備份">
      <span style="display:grid;place-items:center;">
        <image src=${chrome.runtime.getURL(backupImagePath)} style="width:20px;height:20px" />
      </span>
    </span>
  `;
  const backupBtn = wrapper.firstElementChild!;
  backupBtn.addEventListener('click', () => BackupHelper.backup());
  sibling.parentElement!.insertBefore(backupBtn, sibling);
  wrapper.remove();
});

// create a backup button on the bottom nav menu (Mobile)
window.addEventListener('app:create-mobile-nav-btn', (e: any) => {
  const parent = e.detail.element.querySelector('ul') as HTMLElement;
  const backupImagePath = `images/backup-${isDarkMode() ? 'dark' : 'light'}.png`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <li>
      <button>
        <span style="display:grid;place-items:center;margin-right:1.7rem;">
          <image src=${chrome.runtime.getURL(backupImagePath)} style="width:24px;height:24px;" />
        </span>
        備份
      </button>
    </li>
  `;
  const backupBtn = wrapper.querySelector('button')!;
  backupBtn.addEventListener('click', () => BackupHelper.backup());
  parent.appendChild(wrapper.firstElementChild!);
  wrapper.remove();
});

// use "黑洞台" as "備份台"
window.addEventListener('app:create-drawer-btn', () => {
  const link = document.querySelector(drawerBtnQuery)!;
  link.textContent = '備份台';
}, { once: true });

injectScript('scripts/fetch.js');