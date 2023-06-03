import { BackupButton } from './BackupButton';
import { DeleteButton } from './DeleteButton';
import { Modal } from './Modal';
import { NavLink } from './NavLink';

Modal.init();
BackupButton.init();
DeleteButton.init();
NavLink.init();

// since LIHKG.com is client-side rendering,
// use MutationObserver to observe the DOM rendering,
// append the extension DOM whenever the rendering is done.
const observer = new MutationObserver((mutations) => {
  const isBackupPost = window.location.pathname.startsWith('/thread/backup:');
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      const isElementNode = node.nodeType === 1;
      if (!isElementNode) return;

      const element = node as HTMLElement;
      if (!!element.querySelector('a[href="/category/32"]')) {
        NavLink.create();
      }

      if (!isBackupPost && !!element.querySelector('[data-tip="熱門回覆"]')) {
        BackupButton.create();
      }

      if (isBackupPost && !!element.querySelector('[data-tip="熱門回覆"]')) {
        DeleteButton.create();
      }
    })
  })
});

observer.observe(document.body, { childList: true, subtree: true });

injectScript('scripts/client_script.js');

function injectScript(src: string) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(src);
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}