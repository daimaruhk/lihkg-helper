import { PostData, Response, SuccessResponse } from '../type';
import { getThreadId, html, isDarkMode, Logger, Storage } from '../utils';
import '../../styles/button.css';

class BackupButton {
  private targetQuery = '[data-tip="熱門回覆"]';
  private isLoading = false;

  public create() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;

    const backupImagePath = `images/backup-${isDarkMode() ? 'light' : 'dark'}.png`;
    const backupBtn = html`
      <span data-tip="備份" title="備份" class="btn-container">
        <span class="btn-wrapper">
          <image src=${chrome.runtime.getURL(backupImagePath)} class="btn-icon"></image>
          <span class="hidden backup-spinner backup-spinner-${isDarkMode() ? 'light' : 'dark'}"></span>
        </span>
      </span>
    `;
    backupBtn.addEventListener('click', () => {
      this.backupStart();
    });
    target.parentElement!.insertBefore(backupBtn, target);
  };

  private async backupStart() {
    const threadId = getThreadId();
    if (this.isLoading || !threadId) return;
    this.isLoading = true;

    const spinner = document.querySelector('.backup-spinner')!;
    const icon = document.querySelector('.btn-icon')!;
    spinner.classList.remove('hidden');
    icon.classList.add('hidden');

    try {
      const resp = await this.fetch(threadId, 1);
      if (resp.success !== 1) throw new Error(`Unable to fetch /api_v2/thread/${threadId}/page/1.`);
      const {
        item_data,
        ...metadata
      } = (resp as SuccessResponse).response!;
      this.mutateThreadId(metadata);

      const existingPost = (Storage.get(threadId, { namespace: 'post', decompress: true }) || {}) as PostData;
      existingPost.metadata = metadata; // update the latest post metadata
      existingPost.pages = existingPost.pages || []; // assign default empty array if not exist.
      
      const totalPage = metadata.total_page;
      const currentPage = existingPost.pages.length || 1;
      for (let i = currentPage; i <= totalPage; i++) {
        Logger.info(`Fetching /api_v2/thread/${threadId}/page/${i}.`);
        const resp = await this.delay(() => this.fetch(threadId, i), 500);
        if (resp.success !== 1) {
          Logger.error(`Unable to fetch /api_v2/thread/${threadId}/page/${i}, backup terminated.`);
          break; // stop the backup if any of the request failed.
        }
        const itemData = (resp as SuccessResponse).response?.item_data!;
        this.mutateThreadId(itemData);
        existingPost.pages[i - 1] = itemData; // page number is 1-based index, convert to 0-based.
      }
      Storage.set(threadId, existingPost, { namespace: 'post', compress: true });
    } catch (err) {
      Logger.error(err.message);
    } finally {
      this.backupComplete();
    }
  };

  private backupComplete() {
    this.isLoading = false;
    const spinner = document.querySelector('.backup-spinner')!;
    const icon = document.querySelector('.btn-icon')!;
    spinner.classList.add('hidden');
    icon.classList.remove('hidden');
  };

  private async fetch(threadId: string, page: number): Promise<Response> {
    const headers = {
      referer: `https://lihkg.com/thread/${threadId}/page/${page}`,
      'x-li-device': this.getRandomDevice(),
      'x-li-device-type': 'browser',
      'x-li-load-time': this.random(1, 5, 6)
    };
    return fetch(`https://lihkg.com/api_v2/thread/${threadId}/page/${page}?order=reply_time`, { headers }).then((resp) => resp.json());
  };

  private delay<T>(cb: () => T, millisecond = 0) {
    return new Promise<T>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await cb();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, millisecond);
    });
  };

  private random(min: number, max: number, toFixed = 0) {
    return (Math.random() * (max - min) + min).toFixed(toFixed);
  };

  private getRandomDevice() {
    let device = '';
    for (let i = 0; i < 40; i++) {
      device += Math.floor(Math.random() * 16).toString(16);
    }
    return device;
  };

  // Normal posts and backup posts can be differentiated by thread_id,
  // backup post id is prefixed by "backup:{thread_id}"
  private mutateThreadId(obj: Record<string, any> | Record<string, any>[] ) {
    const threadIdKey = 'thread_id';
    if (Array.isArray(obj)) {
      obj.forEach((item) => this.mutateThreadId(item));
    } else {
      Object.keys(obj).forEach((key) => {
        if (key === threadIdKey) {
          obj[key] = `backup:${obj[key]}`;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.mutateThreadId(obj[key]);
        }
      });
    }
  };
}

export default new BackupButton();