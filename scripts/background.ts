chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
});

chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
  // store the request header in the session storage, and use the header to make backup request.
  chrome.storage.session.set({ request: details });
}, { urls: ['https://lihkg.com/api_v2/thread/*/page/*'] }, ['requestHeaders']);