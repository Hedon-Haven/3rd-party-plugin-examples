const simulateDelays = false;

var progressThumbnailsCancelled = false;


async function init() {
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

async function parseExternalLink(uriString) {
  const url = new URL(uriString);
  const args = Object.fromEntries(url.searchParams.entries());

  switch (url.pathname) {
    case "/home":
      return {
        type: "homePage",
        pageCount: parseInt(args["page"] ?? "0", 10),
      };

    case "/search":
      return {
        type: "searchResultsPage",
        searchRequest: {
          searchString: decodeURIComponent(args["query"] ?? ""),
          sortingType: args["sortingType"] ?? null,
          dateRange: args["dateRange"] ?? null,
          minQuality: args["minQuality"] ? parseInt(args["minQuality"], 10) : null,
          maxQuality: args["maxQuality"] ? parseInt(args["maxQuality"], 10) : null,
          minDuration: args["minDuration"] ? parseInt(args["minDuration"], 10) : null,
          maxDuration: args["maxDuration"] ? parseInt(args["maxDuration"], 10) : null,
          minFramesPerSecond: args["minFramesPerSecond"] ? parseInt(args["minFramesPerSecond"], 10) : null,
          maxFramesPerSecond: args["maxFramesPerSecond"] ? parseInt(args["maxFramesPerSecond"], 10) : null,
          virtualReality: args["virtualReality"] ? args["virtualReality"] === "true" : null,
          // categories and keywords not yet fully supported
        },
        pageCount: parseInt(args["page"] ?? "0", 10),
      };

    case "/video":
      return {
        type: "videoPage",
        iD: args["videoId"],
      };

    case "/author":
      return {
        type: "authorPage",
        iD: args["authorId"],
      };

    default:
      return { type: "unknown" };
  }
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

async function downloadThumbnail(uri, thumbnailHttpHeaders) {
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