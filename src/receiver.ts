// TODO: Add receiver code here
function makeRequest (method: string, url: string | URL) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

playerManager.setMessageInterceptor(
    cast.framework.messages.MessageType.LOAD,
    request => {
      return new Promise((resolve, reject) => {
        // Fetch content repository by requested contentId
        makeRequest('GET', 'https://storage.googleapis.com/cpe-sample-media/content.json').then(function (data: any) {
          let item = data[request.media.contentId];
          if(!item) {
            // Content could not be found in repository
            reject();
          } else {
            // Add metadata
            let metadata = new
               cast.framework.messages.GenericMediaMetadata();
            metadata.title = item.title;
            metadata.subtitle = item.author;

            request.media.metadata = metadata;
            request.media.contentUrl = item.stream.dash;
            request.media.contentType = 'application/dash+xml';
            request.media.hlsSegmentFormat = cast.framework.messages.HlsSegmentFormat.FMP4;
            request.media.hlsVideoSegmentFormat = cast.framework.messages.HlsVideoSegmentFormat.FMP4;

            // Resolve request
            resolve(request);
          }
        });
      });
    });

export { context }
