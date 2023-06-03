import { MessagePayload, MessageType, ModalOptions } from './type';
import AppEvent from './utils/AppEvent';
import { BackupHelper } from './utils/BackupHelper';
import Storage from './utils/Storage';

const navBtnQueryDesktop = '[data-tip="熱門回覆"]';
const drawerBtnQuery = 'a[href="/category/32"]'; // "黑洞台" button

// since LIHKG.com is client-side rendering,
// use MutationObserver to observe the DOM rendering,
// append the extension DOM whenever the rendering is done.
const observer = new MutationObserver((mutations) => {
  const isBackupPost = window.location.pathname.startsWith('/thread/backup:');
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      const isElementNode = node.nodeType === 1;
      if (isElementNode) {
        const element = node as HTMLElement;

        if (!!element.querySelector(drawerBtnQuery)) {
          window.dispatchEvent(new CustomEvent(AppEvent.CreateDrawerButton));
        }

        if (!isBackupPost && !!element.querySelector(navBtnQueryDesktop)) {
          window.dispatchEvent(new CustomEvent(AppEvent.CreateNavButton));
        }

        if (isBackupPost && !!element.querySelector(navBtnQueryDesktop)) {
          window.dispatchEvent(new CustomEvent(AppEvent.CreateDeleteButton));
        }
      }
    })
  })
});

observer.observe(document.body, { childList: true, subtree: true });

// create a backup button on the nav bar.
window.addEventListener(AppEvent.CreateNavButton, () => {
  const sibling = document.querySelector(navBtnQueryDesktop)!;
  const backupImagePath = `images/backup-${isDarkMode() ? 'light' : 'dark'}.png`;
  const backupBtn = html`
    <span data-tip="備份" title="備份" style="width:42px;">
      <span class="icon-wrapper">
        <image src=${chrome.runtime.getURL(backupImagePath)} class="backup-icon"></image>
        <span class="hidden backup-spinner backup-spinner-${isDarkMode() ? 'light' : 'dark'}"></span>
      </span>
    </span>
  `;
  backupBtn.addEventListener('click', () => BackupHelper.backup());
  sibling.parentElement!.insertBefore(backupBtn, sibling);
});

// create a delete button on the nav bar.
window.addEventListener(AppEvent.CreateDeleteButton, () => {
  const sibling = document.querySelector(navBtnQueryDesktop)!;
  const deleteImagePath = `images/delete-${isDarkMode() ? 'light' : 'dark'}.png`;
  const deleteBtn = html`
    <span data-tip="刪除備份" title="刪除備份" style="width:42px;">
      <span class="icon-wrapper">
        <image src=${chrome.runtime.getURL(deleteImagePath)} class="delete-icon"></image>
      </span>
    </span>
  `;
  deleteBtn.addEventListener('click', () => {
    const { threadId } = BackupHelper.parseURL(window.location.pathname);
    const postTitle = (document.title || "").split('|')[0].trim();
    const options: ModalOptions = {
      title: "刪除備份",
      message: `確認要刪除「${postTitle}」？"`,
      action: () => BackupHelper.delete(threadId)
    };
    window.dispatchEvent(new CustomEvent(AppEvent.OnModalOpen, { detail: options }));
  });
  sibling.parentElement!.insertBefore(deleteBtn, sibling);
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

window.addEventListener(AppEvent.OnModalOpen, (e: CustomEvent<ModalOptions>) => {
  const modal = html<HTMLDialogElement>`
    <dialog id="lihkg-helper-modal">
      <div class="modal-header">
        <div class="modal-title">${e.detail.title}</div>
        <button class="modal-btn-hover">
          <i class="i-close"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-content">${e.detail.message}</div>
        <div class="modal-btns">
          <button class="modal-btn modal-btn-hover modal-confirm-btn">確認</button>
          <button class="modal-btn modal-btn-hover modal-cancel-btn">取消</button>
        </div>
      </div>
    </dialog>
  `;
  const onClose = () => window.dispatchEvent(new CustomEvent(AppEvent.OnModalClose));
  modal.querySelector('.modal-header button').addEventListener('click', onClose);
  modal.querySelector('.modal-cancel-btn').addEventListener('click', onClose);
  modal.querySelector('.modal-confirm-btn').addEventListener('click', e.detail.action);
  document.body.appendChild(modal);
  modal.showModal();
});

window.addEventListener(AppEvent.OnModalClose, () => {
  const modal = document.querySelector<HTMLDialogElement>('#lihkg-helper-modal');
  if (!modal) return;
  modal.close();
  modal.remove();
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

function html<T extends HTMLElement = HTMLElement>(strings: TemplateStringsArray, ...values: unknown[]) {
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