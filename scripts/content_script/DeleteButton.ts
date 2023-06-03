import { Logger, Storage, getThreadId, getTitle, html, isDarkMode } from '../utils';
import { Modal } from './Modal';

export class DeleteButton {
  private static createButtonEvent = 'app:create-delete-btn';
  private static targetQuery = '[data-tip="熱門回覆"]';

  public static init() {
    window.addEventListener(this.createButtonEvent, () => this.createButton())
  };

  public static create() {
    window.dispatchEvent(new CustomEvent(this.createButtonEvent));
  };

  private static createButton() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;

    const deleteImagePath = `images/delete-${isDarkMode() ? 'light' : 'dark'}.png`;
    const deleteBtn = html`
      <span data-tip="刪除備份" title="刪除備份" style="width:42px;">
        <span class="icon-wrapper">
          <image src=${chrome.runtime.getURL(deleteImagePath)} class="delete-icon"></image>
        </span>
      </span>
    `;
    deleteBtn.addEventListener('click', () => {
      const title = getTitle();
      const threadId = getThreadId();
      Modal.show({
        title: "刪除備份",
        message: `確認要刪除「${title}」？"`,
        action: () => {
          Logger.info(`Delete thread ${threadId}.`);
          Storage.delete(threadId, { namespace: 'post' });
          window.location.replace('https://lihkg.com/category/32'); // reload the page
        }
      });
    });
    target.parentElement!.insertBefore(deleteBtn, target);
  };
}