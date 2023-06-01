import { MessagePayload, MessageType } from './type';
import AppEvent from './utils/AppEvent';
import { BackupHelper } from './utils/BackupHelper';
import Storage from './utils/Storage';

const navBtnQueryDesktop = '[data-tip="熱門回覆"]';
const navBtnQueryMobile = 'ul li button .i-hot-reply';
const drawerBtnQuery = 'a[href="/category/32"]'; // "黑洞台" button

// since LIHKG.com is client-side rendering,
// use MutationObserver to observe the DOM rendering,
// append the extension DOM whenever the rendering is done.
const observer = new MutationObserver((mutations) => {
  const isMobile = isMobileDevice();
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      const isElementNode = node.nodeType === 1;
      if (isElementNode) {
        const element = node as HTMLElement;

        if (!!element.querySelector(drawerBtnQuery)) {
          window.dispatchEvent(new CustomEvent(AppEvent.CreateDrawerButton));
        }

        if (!isMobile && !!element.querySelector(navBtnQueryDesktop)) {
          window.dispatchEvent(new CustomEvent(AppEvent.CreateDesktopNavButton));
        }

        if (isMobile && !!element.querySelector(navBtnQueryMobile)) {
          window.dispatchEvent(new CustomEvent(AppEvent.CreateMobileNavButton, { detail: { element } }));
        }
      }
    })
  })
});

observer.observe(document.body, { childList: true, subtree: true });

// create a backup button on the nav bar (Desktop)
window.addEventListener(AppEvent.CreateDesktopNavButton, () => {
  const sibling = document.querySelector(navBtnQueryDesktop)!;
  const backupImagePath = `images/backup-${isDarkMode() ? 'light' : 'dark'}.png`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <span data-tip="備份" title="備份" style="width:42px;">
      <span style="display:grid;place-items:center;">
        <image src=${chrome.runtime.getURL(backupImagePath)} style="width:20px;height:20px" class="backup-icon"></image>
        <span class="hidden backup-spinner backup-spinner-sm backup-spinner-${isDarkMode() ? 'light' : 'dark'}"></span>
      </span>
    </span>
  `;
  const backupBtn = wrapper.firstElementChild!;
  backupBtn.addEventListener('click', () => BackupHelper.backup());
  sibling.parentElement!.insertBefore(backupBtn, sibling);
  wrapper.remove();
});

// create a backup button non the bottom nav menu (Mobile)
window.addEventListener(AppEvent.CreateMobileNavButton, (e: any) => {
  const parent = e.detail.element.querySelector('ul') as HTMLElement;
  const backupImagePath = `images/backup-${isDarkMode() ? 'light' : 'dark'}.png`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <li>
      <button>
        <span style="display:grid;place-items:center;margin-right:1.7rem;">
          <image src=${chrome.runtime.getURL(backupImagePath)} style="width:24px;height:24px;" class="backup-icon"></image>
          <span class="hidden backup-spinner backup-spinner-md backup-spinner-${isDarkMode() ? 'light' : 'dark'}"></span>
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
window.addEventListener(AppEvent.CreateDrawerButton, () => {
  const link = document.querySelector(drawerBtnQuery)!;
  link.textContent = '備份台';
}, { once: true });

window.addEventListener(AppEvent.OnBackupStart, () => {
  const spinner = document.querySelector('.backup-spinner')!;
  const icon = document.querySelector('.backup-icon')!;
  spinner.classList.remove('hidden');
  icon.classList.add('hidden');
});

window.addEventListener(AppEvent.OnBackupComplete, () => {
  const spinner = document.querySelector('.backup-spinner')!;
  const icon = document.querySelector('.backup-icon')!;
  spinner.classList.add('hidden');
  icon.classList.remove('hidden');
});

chrome.runtime.onMessage.addListener((message: MessagePayload) => {
  if (message.type === MessageType.RequestHeader) {
    // Save the request header to session storage
    Storage.set('request', message.payload, { session: true });
  }
});

injectScript('scripts/client_script.js');

function injectScript(src: string) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(src);
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

function isDarkMode() {
  const settings = JSON.parse(window.localStorage.getItem('modesettings') as string);
  const officeMode = Number(window.localStorage.getItem('officemode')) || 0;
  const isDarkMode = settings[officeMode]?.darkMode;
  return !!isDarkMode;
}

function isMobileDevice() {
  return window.innerWidth <= 767;
}