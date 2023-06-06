import { Logger, Storage, getThreadId, getTitle, html, isDarkMode } from '../utils';
import Modal from './Modal';
import '../../styles/button.css';

class DeleteButton {
  private createButtonEvent = 'app:create-delete-btn';
  private targetQuery = '[data-tip="熱門回覆"]';

  constructor() {
    window.addEventListener(this.createButtonEvent, () => this.createButton())
  };

  public create() {
    window.dispatchEvent(new CustomEvent(this.createButtonEvent));
  };

  private createButton() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;

    const deleteImagePath = `images/delete-${isDarkMode() ? 'light' : 'dark'}.png`;
    const deleteBtn = html`
      <span data-tip="刪除備份" title="刪除備份" style="width:42px;">
        <span class="btn-wrapper">
          <image src=${chrome.runtime.getURL(deleteImagePath)} class="btn-icon"></image>
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

export default new DeleteButton();