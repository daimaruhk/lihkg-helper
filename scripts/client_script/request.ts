import { FailureResponse, PostData, PostList, PostPage, SuccessResponse } from '../type';
import { Logger, Storage } from '../utils';

const OriginalXMLHttpRequest = window.XMLHttpRequest;

// Override the XHR response based on pathname / request url
class FakeXMLHttpRequest extends OriginalXMLHttpRequest {
  responseText: string;
  response: any;

  open(method: string, url: string, ...args: any[]) {
    this.addEventListener('readystatechange', () => {
      if (this.readyState !== 4) return ;
      let response = this.responseText;
      if (/^https:\/\/lihkg.com\/api_v2\/thread\/category\?cat_id=32/.test(url)) {
        // override the response for "黑洞台"
        response = JSON.stringify(FakeXMLHttpRequest.getAllPost());
      } else {
        const { threadId, page } = FakeXMLHttpRequest.parseURL(url);
        if (threadId && page) {
          // override the response when the thread id prefixed by "backup:",
          // e.g. https://lihkg.com/api_v2/thread/backup:3400920/page/1
          response = JSON.stringify(FakeXMLHttpRequest.getPost(threadId, Number(page)));
        }
      }
      // XHR properties are read-only, make them mutable.
      Object.defineProperty(this, 'responseText', { writable: true });
      Object.defineProperty(this, 'response', { writable: true });
      this.response = this.responseText = response;
    });
    const [async, username, password] = args as [boolean, string | null | undefined, string | null | undefined];
    super.open(method, url, async, username, password);
  };

  private static getPost(threadId: string, page: number) {
    const data = Storage.get<PostData>(threadId, { namespace: 'post', decompress: true });
    Logger.info(`Thread ${threadId}, page ${page}:`, data);
    if (!data) return FakeXMLHttpRequest.getErrorResponse();
    return FakeXMLHttpRequest.formatResponse<PostPage>({
      ...data.metadata,
      allow_create_child_thread: false,
      page: page.toString(),
      item_data: data.pages?.[page - 1] || [],
    });
  };

  private static getAllPost() {
    const data = Storage.getAll<PostData>({ namespace: 'post', decompress: true });
    Logger.info('備份台:', data);
    return FakeXMLHttpRequest.formatResponse<PostList>({
      category: {
        cat_id: '32', // cat_id=32 is for "黑洞台"
        name: '備份台',
        postable: false,
      },
      is_pagination: false,
      items: data.map((postData) => postData.metadata),
    });
  };

  private static getErrorResponse(): FailureResponse {
    return {
      error_code: 998,
      error_message: ':0) 遇到錯誤  (998)',
      server_time: Date.now(),
      success: 0
    };
  };
  
  private static formatResponse<T>(payload: T): SuccessResponse<T> {
    return {
      success: 1,
      server_time: Date.now(),
      response: payload
    };
  };
  
  private static parseURL(url: string) {
    const regexp = /\/thread\/backup:(?<threadId>\d+)\/page\/(?<page>\d+)/;
    return url.match(regexp)?.groups || {};
  };
}

window.XMLHttpRequest = FakeXMLHttpRequest;


