import { BackupHelper } from '../utils/BackupHelper';

const OriginalXMLHttpRequest = window.XMLHttpRequest;

// Override the XHR response based on pathname / request url
class FakeXMLHttpRequest extends OriginalXMLHttpRequest {
  responseText: string;
  response: any;

  open(method: string, url: string, ...args: any[]) {
    this.addEventListener('readystatechange', async () => {
      if (this.readyState !== 4) return;
      let response = this.responseText;
      if (/^https:\/\/lihkg.com\/api_v2\/thread\/category\?cat_id=32/.test(url)) {
        // override the response for "黑洞台"
        response = JSON.stringify(BackupHelper.getAll());
      } else {
        const { threadId, page } = BackupHelper.parseURL(url);
        if (threadId && page) {
          // override the response when the thread id prefixed by "backup:",
          // e.g. https://lihkg.com/api_v2/thread/backup:3400920/page/1
          response = JSON.stringify(BackupHelper.get(threadId, Number(page)));
        }
      }
      // XHR properties are read-only, make them mutable.
      Object.defineProperty(this, 'responseText', { writable: true });
      Object.defineProperty(this, 'response', { writable: true });
      this.response = this.responseText = response;
    });
    const [async, username, password] = args as [boolean, string | null | undefined, string | null | undefined];
    super.open(method, url, async, username, password);
  }
}

window.XMLHttpRequest = FakeXMLHttpRequest;