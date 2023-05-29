import { KeyValuePair, PostData, PostList, PostPage, Response } from './type';

export class BackupHelper {
  private static regularApiRegex = /^https:\/\/lihkg.com\/api_v2\/thread\/(?<threadId>\d+)\/page\/(?<page>\d+)/;
  private static backupApiRegex = /^https:\/\/lihkg.com\/api_v2\/thread\/backup:(?<threadId>\d+)\/page\/(?<page>\d+)/;

  public static getAll() {
    const data = Storage.get() as { [threadId: string]: PostData };
    return formatResponse<PostList>({
      category: {
        cat_id: '32', // cat_id=32 is for "黑洞台"
        name: '備份台',
        postable: false,
      },
      is_pagination: false,
      items: Object.values(data).map((postData) => postData.metadata),
    });
  }

  public static get(threadId: string, page = 1) {
    const data = Storage.get(threadId);
    if (!data) return null;
    return formatResponse<PostPage>({
      ...data.metadata,
      allow_create_child_thread: false,
      page: page.toString(),
      item_data: data.pages[page - 1],
    });
  }

  public static async backup() {
    const { request } = await chrome.storage.session.get('request') as { request?: chrome.webRequest.WebRequestHeadersDetails };
    if (!request) {
      Logger.error('Request not found.');
      return;
    }

    const { url, requestHeaders } = request;
    const { threadId } = this.parseRequestUrl(url, false);
    if (!threadId) {
      Logger.error('Unable to parse request url.');
      return;
    }

    const {
      success,
      response: {
        me, // we don't want to store the sensitive data "me"
        item_data,
        ...metadata
      }
    } = await this.fetch(threadId, 1, requestHeaders!);
    if (success !== 1) {
      Logger.error(`Unable to fetch /api_v2/thread/${threadId}/page/1.`);
      return;
    }

    const existingPost = (Storage.get(threadId) || {}) as PostData;
    mutateThreadId(metadata);
    existingPost.metadata = metadata; // update the latest post metadata
    existingPost.pages = existingPost.pages || []; // assign default empty array if not exist.

    const totalPage = metadata.total_page;
    const currentPage = existingPost.pages.length || 1;
    for (let i = currentPage; i <= totalPage; i++) {
      const { success, response: { item_data } } = await this.fetch(threadId, i, requestHeaders!);
      if (success !== 1) {
        Logger.error(`Unable to fetch /api_v2/thread/${threadId}/page/${i}, backup terminated.`);
        break; // stop the backup if any of the request failed.
      }
      mutateThreadId(item_data);
      existingPost.pages[i - 1] = item_data; // page number is 1-based index, convert to 0-based.
    }
    Storage.set(threadId, existingPost);
  }

  public static parseRequestUrl(url: string, isBackup = true) {
    const regexp = isBackup ? this.backupApiRegex : this.regularApiRegex;
    return url.match(regexp)?.groups || {};
  }

  private static async fetch(threadId: string, page: number, requestHeaders: chrome.webRequest.HttpHeader[]): Promise<Response<PostPage>> {
    const initHeader: HeadersInit = {
      referer: `https://lihkg.com/thread/${threadId}/page/${page}`
    };
    const headers = requestHeaders.reduce((headersObj, header) => ({
      ...headersObj,
      [header.name]: header.value!,
    }), initHeader);
    return fetch(`https://lihkg.com/api_v2/thread/${threadId}/page/${page}?order=reply_time`, { headers }).then((resp) => resp.json());
  }
}

class Logger {
  private static namespace = "LIHKG Backup Helper";

  public static error(msg: string) {
    console.error(`${this.namespace} - ${msg}`)
  }
}

class Storage {
  public static get(key?: string) {
    try {
      const data = JSON.parse(window.localStorage.getItem('app:data') as string) || {};
      if (!key) return data;
      return data[key] || null;
    } catch (err) {
      Logger.error('Error when parsing localStorage data.');
      return null;
    }
  }

  public static set(key: string, value: any) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem('app:data') as string) || {};
      window.localStorage.setItem('app:data', JSON.stringify({
        ...parsed,
        [key]: value,
      }));
    } catch (error) {
      Logger.error('Error when setting localStorage data.');
    }
  }
}

// Normal posts and backup posts can be differentiated by thread_id,
// backup post id is prefixed by "backup:{thread_id}"
function mutateThreadId(obj: KeyValuePair | KeyValuePair[] ) {
  const threadIdKey = 'thread_id';
  if (Array.isArray(obj)) {
    obj.forEach((item) => mutateThreadId(item));
  } else {
    Object.keys(obj).forEach((key) => {
      if (key === threadIdKey) {
        obj[key] = `backup:${obj[key]}`;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        mutateThreadId(obj[key]);
      }
    });
  }
}

function formatResponse<T>(response: T): Response<T> {
  return {
    success: 1,
    server_time: Date.now(),
    response
  }
}

export function injectScript(src: string) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(src);
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

export function isDarkMode() {
  const settings = JSON.parse(window.localStorage.getItem('modesettings') as string);
  const officeMode = Number(window.localStorage.getItem('officemode')) || 0;
  const isDarkMode = settings[officeMode]?.darkMode;
  return !!isDarkMode;
}

export function isMobileDevice() {
  return window.innerWidth <= 767;
}