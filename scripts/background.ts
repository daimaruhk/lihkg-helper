import { MessageType } from './utils';

chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
  // send the request header to the content script, save it in window.sessionStorage, and use the it to make backup request.
  chrome.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
    chrome.tabs.sendMessage(tabs[0].id!, {
      type: MessageType.RequestHeader,
      payload: details
    });
  });
}, { urls: ['https://lihkg.com/api_v2/thread/*/page/*'] }, ['requestHeaders']);