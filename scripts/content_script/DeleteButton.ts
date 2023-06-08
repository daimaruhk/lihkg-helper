import { Logger, Storage, getThreadId, getTitle, html, isDarkMode } from '../utils';
import Modal from './Modal';
import '../../styles/button.css';

class DeleteButton {
  private targetQuery = '[data-tip="熱門回覆"]';

  public create() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;

    const deleteImagePath = `images/delete-${isDarkMode() ? 'light' : 'dark'}.png`;
    const deleteBtn = html`
      <span data-tip="刪除備份" title="刪除備份" class="btn-container">
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