import { FailureResponse, KeyValuePair, PostData, PostList, PostPage, Response, SuccessResponse } from '../type';
import AppEvent from './AppEvent';
import Logger from './Logger';
import Storage from './Storage';

export class BackupHelper {
  private static readonly regularApiRegex = /^https:\/\/lihkg.com\/api_v2\/thread\/(?<threadId>\d+)\/page\/(?<page>\d+)/;
  private static readonly backupApiRegex = /^https:\/\/lihkg.com\/api_v2\/thread\/backup:(?<threadId>\d+)\/page\/(?<page>\d+)/;
  public static isLoading = false;

  public static getAll() {
    const data = Storage.getAll<PostData>({ namespace: 'post', decompress: true });
    console.info('備份台:', data);
    return this.formatResponse<PostList>({
      category: {
        cat_id: '32', // cat_id=32 is for "黑洞台"
        name: '備份台',
        postable: false,
      },
      is_pagination: false,
      items: data.map((postData) => postData.metadata),
    });
  }

  public static get(threadId: string, page: number) {
    const data = Storage.get<PostData>(threadId, { namespace: 'post', decompress: true });
    console.info(`Thread ${threadId}, page ${page}:`, data);
    if (!data) return this.getErrorResponse();
    return this.formatResponse<PostPage>({
      ...data.metadata,
      allow_create_child_thread: false,
      page: page.toString(),
      item_data: data.pages?.[page - 1] || [],
    });
  }

  public static async backup() {
    if (this.isLoading) return;
    this.isLoading = true;
    window.dispatchEvent(new CustomEvent(AppEvent.OnBackupStart));

    try {
      const request = Storage.get<chrome.webRequest.WebRequestHeadersDetails>('request', { session: true });
      if (!request) throw new Error('Request not found.');

      const { url, requestHeaders } = request;
      const { threadId } = this.parseRequestUrl(url, false);
      if (!threadId) throw new Error('Unable to parse request url.');

      const resp = await this.fetch(threadId, 1, requestHeaders!);
      if (resp.success !== 1) throw new Error(`Unable to fetch /api_v2/thread/${threadId}/page/1.`);

      const {
        me, // we don't want to store the sensitive data "me"
        item_data,
        ...metadata
      } = (resp as SuccessResponse).response!;
      const existingPost = (Storage.get(threadId, { namespace: 'post', decompress: true }) || {}) as PostData;
      this.mutateThreadId(metadata);
      existingPost.metadata = metadata; // update the latest post metadata
      existingPost.pages = existingPost.pages || []; // assign default empty array if not exist.

      const totalPage = metadata.total_page;
      const currentPage = existingPost.pages.length || 1;
      for (let i = currentPage; i <= totalPage; i++) {
        console.info(`Fetching /api_v2/thread/${threadId}/page/${i}.`);
        const resp = await this.delay(() => this.fetch(threadId, i, requestHeaders!), 500);
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
      this.isLoading = false;
      window.dispatchEvent(new CustomEvent(AppEvent.OnBackupComplete));
    }
  }

  public static parseRequestUrl(url: string, isBackup = true) {
    const regexp = isBackup ? this.backupApiRegex : this.regularApiRegex;
    return url.match(regexp)?.groups || {};
  }

  private static async fetch(threadId: string, page: number, requestHeaders: chrome.webRequest.HttpHeader[]): Promise<Response> {
    const initHeader: HeadersInit = {
      referer: `https://lihkg.com/thread/${threadId}/page/${page}`
    };
    const headers = requestHeaders.reduce((headersObj, header) => ({
      ...headersObj,
      [header.name]: header.value!,
    }), initHeader);
    delete headers['X-LI-USER']; // delete the user id
    headers['X-LI-REQUEST-TIME'] = (Date.now() + this.random(-200, 200)).toString(); // update the request time, +/-200ms
    headers['X-LI-LOAD-TIME'] = this.random(3, 5, 7).toString();
    return fetch(`https://lihkg.com/api_v2/thread/${threadId}/page/${page}?order=reply_time`, { headers }).then((resp) => resp.json());
  }

  // Normal posts and backup posts can be differentiated by thread_id,
  // backup post id is prefixed by "backup:{thread_id}"
  private static mutateThreadId(obj: KeyValuePair | KeyValuePair[] ) {
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
  }

  private static formatResponse<T>(payload: T): SuccessResponse<T> {
    return {
      success: 1,
      server_time: Date.now(),
      response: payload
    }
  }

  private static getErrorResponse(): FailureResponse {
    return {
      error_code: 998,
      error_message: ':0) 遇到錯誤  (998)',
      server_time: Date.now(),
      success: 0
    }
  }

  private static random(min: number, max: number, toFixed = 0) {
    return (Math.random() * (max - min) + min).toFixed(toFixed);
  }

  private static delay<T>(cb: () => T, millisecond = 0) {
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
  }
}