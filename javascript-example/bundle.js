// ==== START: ./src/base64-js.js ====
/*
The MIT License (MIT)

Copyright (c) 2014 Jameson Little

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// SOURCE: https://github.com/feross/base64-js/blob/master/index.js

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}
// ==== END: ./src/base64-js.js ====

// ==== START: ./src/bridge-functions.js ====
/// Dart bridge functions

// Direct web requests are not allowed from the js environment
async function httpRequest(url) {
  const response = await sendMessage("httpRequest", JSON.stringify({
    "url": url
  }));
  return JSON.parse(response);
}

// Mirror logs into the dart environment (and also prefixes it correctly)
function consoleLog(level, message) {
  sendMessage("consoleLog", JSON.stringify({
    "level": level,
    "message": message
  }));
}

// File access is disabled in the js environment
// Keep in mind that this function is only able to write the plugins own cache files
async function writeCacheFile(filePath, base64EncodedContents) {
  const response = await sendMessage("writeCacheFile", JSON.stringify({
    "filePath": filePath,
    "base64EncodedContents": base64EncodedContents
  }));
  // Returns error (as String) if any exception was encountered, otherwise returns true (as bool)
  return JSON.parse(response);
}

// File access is disabled in the js environment
// Keep in mind that this function is only able to read the plugins own cache files
async function readCacheFile(filePath) {
  const response = await sendMessage("readCacheFile", JSON.stringify({
    "filePath": filePath
  }));
  // Returns the file content as a base64 encoded string or an error (as String) if any exception was encountered
  return JSON.parse(response);
}

// ==== END: ./src/bridge-functions.js ====

// ==== START: ./src/main.js ====
const simulateDelays = false;

var progressThumbnailsCancelled = false;


async function initPlugin() {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  // read cache file to showcase functionality
  const result = await readCacheFile("testerInitFile.txt");
  // Failure -> assume file doesn't yet exist
  if (typeof result === "string" && result.startsWith("Error:")) {
    const contents = `random number: ${Math.floor(Math.random() * 100000)}`;
    const base64Encoded = fromByteArray(Uint8Array.from(contents, c => c.charCodeAt(0)));
    await writeCacheFile("testerInitFile.txt", base64Encoded);
    consoleLog("info", `Created file with contents: ${contents}`);
  } else {
    consoleLog("info", `Read from file: ${String.fromCharCode(...toByteArray(result))}`);
  }
  consoleLog("info", "Tester External plugin initialized");
  return true;
}

async function runFunctionalityTest() {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  consoleLog("info", "Functionality test completed");
  return true;
}

async function getHomePage(page) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  return Array.from({
    length: 10
  }, (_, index) => ({
    iD: String(Math.trunc(index * Math.PI * 10000)),
    title: `Test homepage video ${index}, page ${page}`,
    thumbnail: "https://placehold.co/1280x720.png",
    previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    duration: 120 + index * 10, // seconds
    viewsTotal: Math.trunc(index * Math.PI * 1000000),
    ratingsPositivePercent: Math.trunc(index * Math.PI * 10) % 101,
    maxQuality: 720,
    virtualReality: false,
    authorName: `Tester-author ${index}`,
    authorID: `Tester-author ${index}`,
    verifiedAuthor: index % 2 === 0,
    // Make every 4th video a fail
    scrapeFailMessage: index % 4 !== 0 ? "Test fail scrape message" : null,
  }));
}

async function downloadThumbnail(uri) {
  try {
    const response = await httpRequest(uri);
    if (response.status === 200) {
      return response.body; // base64 encoded bytes
    } else {
      consoleLog("error", `Error downloading thumbnail: ${response.status}`);
      return "";
    }
  } catch (e) {
    consoleLog("error", `Error downloading thumbnail: ${e}`);
    return "";
  }
}

async function getSearchSuggestions(searchString) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 200));
  const results = Array.from({
    length: 5
  }, (_, index) => `${searchString}-${index}`);
  return results;
}

async function getSearchResults(request, page) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  if (page === 5) return [];
  return Array.from({
    length: 10
  }, (_, index) => ({
    iD: String(Math.trunc(index * Math.PI * 10000)),
    title: `Test result video ${index}, page ${page}, request ${request["searchString"]}`,
    thumbnail: "https://placehold.co/1280x720.png",
    previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    duration: 120 + index * 10, // seconds
    viewsTotal: Math.trunc(index * Math.PI * 1000000),
    ratingsPositivePercent: parseInt((index * Math.PI * 10000)
      .toFixed(2)) || 50,
    maxQuality: 720,
    virtualReality: false,
    authorName: `Tester-author ${index}`,
    authorID: `Tester-author ${index}`,
    verifiedAuthor: index % 2 === 0,
    // Make every 4th video a fail
    scrapeFailMessage: index % 4 !== 0 ? "Test fail scrape message" : null,
  }));
}

function getVideoUriFromID(videoID) {
  return `https://example.com/${videoID}`;
}

async function getVideoMetadata(videoId, uvp) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  return {
    iD: videoId,
    m3u8Uris: {
      1080: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      720: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      480: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    },
    title: "Tester video metadata title",
    universalVideoPreview: uvp,
    // Change this to test partial metadata scrape fail
    //scrapeFailMessage: "Test fail scrape message",
    authorID: `tester-author-${videoId}`,
    authorName: "Tester-author",
    authorSubscriberCount: 335433,
    authorAvatar: "https://placehold.co/1280x720.png",
    actors: ["Tester-actor-1", "Tester-actor-2"],
    description: "Tester video description".repeat(10),
    viewsTotal: 2532823,
    tags: ["Tester-tag-1", "Tester-tag-2"],
    categories: ["Tester-category-1", "Tester-category-2"],
    uploadDate: Math.floor(Date.now() / 1000),
    ratingsPositiveTotal: 90,
    ratingsNegativeTotal: 10,
    ratingsTotal: 47384,
    virtualReality: false,
    chapters: {
      0: "Chapter 1",
      120: "Chapter 2",
      240: "Chapter 3",
    },
    rawHtml: null,
  };
}

async function getProgressThumbnails(videoID, rawHtml) {
  // reset cancellation flag
  progressThumbnailsCancelled = false;
  // Simulate heavy processing (split into chunks so cancellation can be checked)
  for (let i = 0; i < 50; i++) {
    if (progressThumbnailsCancelled) return [];
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (progressThumbnailsCancelled) return [];
  const response = await httpRequest("https://placehold.co/720x480.png");
  if (response.status !== 200) throw new Error("Failed to download/convert placeholder image");
  if (progressThumbnailsCancelled) return [];
  // Return 1000 copies of the same image (base64 encoded body)
  return Array(1000)
    .fill(response.body);
}

function cancelGetProgressThumbnails() {
  progressThumbnailsCancelled = true;
  consoleLog("warning", "Set flag to cancel getProgressThumbnails");
}

function getCommentUriFromID(commentID, videoID) {
  return `https://example.com/${videoID}/${commentID}`;
}

async function getComments(videoID, rawHtml, page) {
  if (page === 5) return [];
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  return Array.from({
    length: 10
  }, (_, index) => ({
    iD: `comment-${index}`,
    videoID,
    author: `author-${index}`,
    commentBody: Array(5)
      .fill(`test comment ${index}, page ${page} `)
      .join(""),
    hidden: index % 4 === 0,
    authorID: `author-${index}`,
    countryID: "US",
    orientation: null,
    profilePicture: "https://placehold.co/240x240.png",
    ratingsPositiveTotal: index % 4 === 0 ? 30 : null,
    ratingsNegativeTotal: index % 4 === 0 ? 2 : null,
    ratingsTotal: index % 4 === 0 ? 32 : 76,
    commentDate: Math.floor(Date.now() / 1000),
    replyComments: index % 2 === 0 ?
      Array.from({
        length: 3
      }, (_, index) => ({
        iD: `comment-reply-${index}`,
        videoID,
        author: `author-reply-${index}`,
        commentBody: Array(5)
          .fill(`test reply comment ${index} `)
          .join(""),
        hidden: index % 4 === 0,
        authorID: `author-reply-${index}`,
        countryID: "US",
        orientation: null,
        profilePicture: "https://placehold.co/240x240",
        ratingsPositiveTotal: index % 2 === 0 ? 4 : null,
        ratingsNegativeTotal: index % 2 === 0 ? 1 : null,
        ratingsTotal: index % 2 === 0 ? 5 : 6,
        commentDate: Math.floor(Date.now() / 1000),
        replyComments: [],
        // Make every 4th comment a fail
        scrapeFailMessage: index % 4 !== 0 ? "Test fail scrape message" : null,
      })) : [],
    // Make every 4th comment a fail
    scrapeFailMessage: index % 4 !== 0 ? "Test fail scrape message" : null,
  }));
}

async function getVideoSuggestions(videoID, rawHtml, page) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  if (page === 5) return [];
  return Array.from({
    length: 10
  }, (_, index) => ({
    iD: String(Math.trunc(index * Math.PI * 10000)),
    title: `Test suggestion video ${index}`,
    thumbnail: "https://placehold.co/1280x720.png",
    previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    duration: 120 + index * 10, // seconds
    viewsTotal: Math.trunc(index * Math.PI * 1000000),
    ratingsPositivePercent: parseInt((index * Math.PI * 10000)
      .toFixed(2)) || 50,
    maxQuality: 720,
    virtualReality: false,
    authorName: `Tester-suggestion-author ${index}`,
    authorID: `Tester-suggestion-author ${index}`,
    verifiedAuthor: index % 2 === 0,
    // Make every 4th video a fail
    scrapeFailMessage: index % 4 !== 0 ? "Test fail scrape message" : null,
  }));
}

function getAuthorUriFromID(authorID) {
  return `https://example.com/${authorID}`;
}

async function getAuthorPage(authorID) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  return {
    iD: authorID,
    name: "Test author name",
    avatar: "https://placehold.co/240x240.png",
    banner: "https://placehold.co/1270x400.png",
    aliases: ["Test alias 1", "Test alias 2"],
    description: "Very long description".repeat(1000),
    advancedDescription: Object.fromEntries(
      Array.from({
        length: 1000
      }, (_, i) => [`Test description key ${i + 1}`, `Test description value ${i + 1}`])
    ),
    externalLinks: {
      "external link 1": "https://example.com/link1",
      "external link 2": "https://example.com/link2",
      "external link 3": "https://example.com/link3",
    },
    viewsTotal: 23773212,
    videosTotal: 114,
    subscribers: 573529,
    rank: 3746,
    rawHtml: "",
  };
}

async function getAuthorVideos(authorID, page) {
  if (simulateDelays) await new Promise(r => setTimeout(r, 2000));
  if (page === 5) return [];
  return Array.from({
    length: 10
  }, (_, index) => ({
    iD: String(Math.trunc(index * Math.PI * 10000)),
    title: `Test author video ${index}, page ${page}`,
    thumbnail: "https://placehold.co/1280x720.png",
    previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    duration: 120 + index * 10, // seconds
    viewsTotal: Math.trunc(index * Math.PI * 1000000),
    ratingsPositivePercent: parseInt((index * Math.PI * 10000)
      .toFixed(2)) || 50,
    maxQuality: 720,
    virtualReality: false,
    authorName: `Tester-author-same ${index}`,
    authorID: `Tester-author-same ${index}`,
    verifiedAuthor: index % 2 === 0,
    // Make every 4th video a fail
    scrapeFailMessage: index % 4 !== 0 ? "Test fail scrape message" : null,
  }));
}
// ==== END: ./src/main.js ====

