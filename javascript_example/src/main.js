// For development only: set to true to enable simulated delays for all functions
const simulateDelays = false;

// Matches Dart's String.fromCharCodes / charCodeAt usage in init(); fine for
// the ASCII-only random-number test string.
function bytesToString(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return str;
}

function stringToBytes(str) {
  return Array.from(str, (c) => c.charCodeAt(0));
}

async function init() {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  // read cache file to showcase functionality
  const result = await readCacheFile("testerInitFile.txt");
  // Failure -> assume file doesn't yet exist
  if (result["status"] === "failure") {
    const contents = `random number: ${Math.floor(Math.random() * 100000)}`;
    await writeCacheFile("testerInitFile.txt", stringToBytes(contents));
    consoleLog("info", `Created file with contents: ${contents}`);
  } else {
    consoleLog("info", `Read from file: ${bytesToString(result["message"])}`);
  }
  consoleLog("info", "Tester External plugin initialized");
}

// To test share/drop any of the following links into the app:
// https://example.com/home?page=3
// https://example.com/search?query=keyword&sortingType=Relevance&page=1
// https://example.com/video?videoId=123
// https://example.com/author?authorId=123
async function parseExternalLink(uriString) {
  const url = new URL(uriString);
  const args = Object.fromEntries(url.searchParams.entries());
  // Strict integer parsing: anything that isn't an integer (or is missing) -> null
  const toInt = (v) => (/^-?\d+$/.test(v) ? parseInt(v, 10) : null);

  switch (url.pathname) {
    case "/home":
      return new ExternalLinkParsed({
        type: "homePage",
        pageCount: toInt(args["page"] ?? "0"),
      });

    case "/search":
      return new ExternalLinkParsed({
        type: "searchResultsPage",
        searchRequest: UniversalSearchRequest.fromMap({
          searchString: args["query"],
          sortingType: args["sortingType"],
          dateRange: args["dateRange"],
          minQuality: toInt(args["minQuality"]),
          maxQuality: toInt(args["maxQuality"]),
          minDuration: toInt(args["minDuration"]),
          maxDuration: toInt(args["maxDuration"]),
          minFramesPerSecond: toInt(args["minFramesPerSecond"]),
          maxFramesPerSecond: toInt(args["maxFramesPerSecond"]),
          virtualReality: args["virtualReality"] === "true" ? true : args["virtualReality"] === "false" ? false : null,
          // categories and keywords not yet fully supported
        }),
        pageCount: toInt(args["page"]),
      });

    case "/video":
      if (!args["videoId"]) throw new Error("Missing videoId");
      return new ExternalLinkParsed({
        type: "videoPage",
        iD: args["videoId"],
      });

    case "/author":
      if (!args["authorId"]) throw new Error("Missing authorId");
      return new ExternalLinkParsed({
        type: "authorPage",
        iD: args["authorId"],
      });

    default:
      return new ExternalLinkParsed({
        type: "unknown"
      });
  }
}

async function getHomePage(page) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  return Array.from({
      length: 10
    }, (_, index) =>
    new UniversalVideoPreview({
      iD: String(Math.trunc((page * 10 + index) * 3.1416 * 10000)),
      title: `Test homepage video ${index}, page ${page}`,
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {
        "X-Ignore": "example-header"
      },
      previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      previewVideoHttpHeaders: {
        "X-Ignore": "example-header"
      },
      duration: 120 + index * 10, // seconds
      viewsTotal: Math.trunc(index * 3.1416 * 1000000),
      ratingsPositivePercent: Math.trunc(index * 3.1416 * 10) % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: `Tester-author ${index}`,
      authorID: `Tester-author ${index}`,
      verifiedAuthor: index % 2 === 0,
      unavailableFields: [],
      // Make every 4th video a fail
      scrapeFailException: index % 4 === 0 ? new ScrapingException("Test fail scrape message") : null,
    }),
  );
}

async function downloadThumbnail(uri, thumbnailHttpHeaders) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 500));
  const response = await httpRequest(uri, thumbnailHttpHeaders);
  if (response.statusCode !== 200) {
    consoleLog("error", `Error downloading thumbnail: ${response.statusCode}`);
    throw new Error(`Error downloading thumbnail: ${response.statusCode}`);
  }
  // bodyBytes comes back as an int array (JSON), convert for the host
  return Uint8Array.from(response.bodyBytes);
}

async function getSearchSuggestions(searchString) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 200));
  return Array.from({
    length: 5
  }, (_, index) => `${searchString}-${index}`);
}

async function getSearchResults(request, page) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return Array.from({
      length: 10
    }, (_, index) =>
    new UniversalVideoPreview({
      iD: String(Math.trunc((page * 10 + index) * 3.1416 * 10000)),
      title: `Test result video ${index}, page ${page}, request ${request.searchString}`,
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {
        "X-Ignore": "example-header"
      },
      previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      previewVideoHttpHeaders: {
        "X-Ignore": "example-header"
      },
      duration: 120 + index * 10, // seconds
      viewsTotal: Math.trunc(index * 3.1416 * 1000000),
      ratingsPositivePercent: Math.trunc(index * 3.1416 * 10) % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: `Tester-author ${index}`,
      authorID: `Tester-author ${index}`,
      verifiedAuthor: index % 2 === 0,
      unavailableFields: [],
      // Make every 4th video a fail
      scrapeFailException: index % 4 === 0 ? new ScrapingException("Test fail scrape message") : null,
    }),
  );
}

async function getVideoUriFromID(videoID) {
  return `https://example.com/video?videoId=${videoID}`;
}

async function getVideoMetadata(videoID, uvp) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  return new UniversalVideoMetadata({
    iD: videoID,
    m3u8Uris: {
      1080: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      720: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      480: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    },
    title: "Tester video metadata title",
    universalVideoPreview: uvp,
    unavailableFields: [],
    // Uncomment to test partial metadata scrape fail
    //scrapeFailException: new ScrapingException("Test fail scrape message"),
    authorID: `tester-author-${videoID}`,
    authorName: "Tester-author",
    authorSubscriberCount: 335433,
    authorAvatar: "https://placehold.co/240x240.png",
    actors: [{
        name: "Tester-actor-1",
        authorID: "Tester-author-actor-1",
        avatar: "https://placehold.co/200x200.png",
      },
      {
        name: "Tester-actor-2",
        authorID: "Tester-author-actor-2",
        avatar: "https://placehold.co/200x200.png",
      },
    ],
    description: "Tester video description ".repeat(10),
    viewsTotal: 2532823,
    tags: ["Tester-tag-1", "Tester-tag-2"],
    categories: ["Tester-category-1", "Tester-category-2"],
    uploadDate: new Date(),
    ratingsPositiveTotal: 42646,
    ratingsNegativeTotal: 4738,
    ratingsTotal: 47384,
    virtualReality: false,
    chapters: {
      0: "Chapter 1",
      120: "Chapter 2",
      240: "Chapter 3",
    },
    rawHtml: "",
  });
}

async function getProgressThumbnails(videoID, rawHtml) {
  // Simulate heavy processing
  const end = Date.now() + 3000;
  while (Date.now() < end) {
    // Burn CPU cycles
    Math.sqrt(Date.now());
  }
  consoleLog("debug", "Heavy processing completed");

  const response = await httpRequest("https://placehold.co/720x480.png");
  if (response.statusCode !== 200) {
    throw new Error("Failed to download placeholder image");
  }
  // Return 1000 copies of the same image
  const bytes = Uint8Array.from(response.bodyBytes);
  return Array(1000)
    .fill(bytes);
}

async function getCommentUriFromID(commentID, videoID) {
  return `https://example.com/video?videoId=${videoID}&commentId=${commentID}`;
}

async function getComments(videoID, rawHtml, page) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return Array.from({
      length: 10
    }, (_, index) =>
    new UniversalComment({
      iD: `comment-${page}-${index}`,
      videoID,
      author: `author-${index}`,
      commentBody: Array(5)
        .fill(`test comment ${index}, page ${page} `)
        .join(""),
      // Make every 4th comment hidden
      hidden: index % 4 === 0,
      authorID: `author-${index}`,
      countryID: "US",
      orientation: null,
      profilePicture: "https://placehold.co/240x240.png",
      ratingsPositiveTotal: index % 4 === 0 ? 30 : null,
      ratingsNegativeTotal: index % 4 === 0 ? 2 : null,
      ratingsTotal: index % 4 === 0 ? 32 : 76,
      commentDate: new Date(Date.now() - index * 86400000),
      replyComments: index % 2 === 0 ?
        Array.from({
            length: 3
          }, (_, j) =>
          new UniversalComment({
            iD: `comment-reply-${page}-${index}-${j}`,
            videoID,
            author: `author-reply-${j}`,
            commentBody: Array(5)
              .fill(`test reply comment ${j} `)
              .join(""),
            // Make every 4th reply hidden
            hidden: j % 4 === 0,
            authorID: `author-reply-${j}`,
            countryID: "US",
            orientation: null,
            profilePicture: "https://placehold.co/240x240.png",
            ratingsPositiveTotal: j % 2 === 0 ? 4 : null,
            ratingsNegativeTotal: j % 2 === 0 ? 1 : null,
            ratingsTotal: j % 2 === 0 ? 5 : 6,
            commentDate: new Date(Date.now() - j * 86400000),
            replyComments: [],
            unavailableFields: [],
            // Make every 2nd reply a fail
            scrapeFailException: j % 2 === 1 ? new ScrapingException("Test fail scrape message") : null,
          }),
        ) : [],
      unavailableFields: [],
      // Make every 3rd comment a fail
      scrapeFailException: index % 3 === 0 ? new ScrapingException("Test fail scrape message") : null,
    }),
  );
}

async function getVideoSuggestions(videoID, rawHtml, page) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return Array.from({
      length: 10
    }, (_, index) =>
    new UniversalVideoPreview({
      iD: String(Math.trunc((page * 10 + index) * 3.1416 * 10000)),
      title: `Test suggestion video ${index}`,
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {
        "X-Ignore": "example-header"
      },
      previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      previewVideoHttpHeaders: {
        "X-Ignore": "example-header"
      },
      duration: 120 + index * 10, // seconds
      viewsTotal: Math.trunc(index * 3.1416 * 1000000),
      ratingsPositivePercent: Math.trunc(index * 3.1416 * 10) % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: `Tester-suggestion-author ${index}`,
      authorID: `Tester-suggestion-author ${index}`,
      verifiedAuthor: index % 2 === 0,
      unavailableFields: [],
      // Make every 4th video a fail
      scrapeFailException: index % 4 === 0 ? new ScrapingException("Test fail scrape message") : null,
    }),
  );
}

async function getAuthorUriFromID(authorID) {
  return `https://example.com/author?authorId=${authorID}`;
}

async function getAuthorPage(authorID) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  return new UniversalAuthorPage({
    iD: authorID,
    name: "Test author name",
    avatar: "https://placehold.co/240x240.png",
    banner: "https://placehold.co/1270x400.png",
    aliases: ["Test alias 1", "Test alias 2"],
    description: "Very long description ".repeat(1000),
    advancedDescription: Object.fromEntries(
      Array.from({
        length: 1000
      }, (_, i) => [
        `Test description key ${i + 1}`,
        `Test description value ${i + 1}`,
      ]),
    ),
    externalLinks: {
      "external link 1": "https://example.com/link1",
      "external link 2": "https://example.com/link2",
      "external link 3": "https://example.com/link3",
    },
    viewsTotal: 23773212,
    videosTotal: 50,
    unavailableFields: [],
    subscribers: 573529,
    rank: 3746,
    rawHtml: "",
  });
}

async function getAuthorVideos(authorID, rawHtml, page) {
  // Simulate network latency
  if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return Array.from({
      length: 10
    }, (_, index) =>
    new UniversalVideoPreview({
      iD: String(Math.trunc((page * 10 + index) * 3.1416 * 10000)),
      title: `Test author video ${index}, page ${page}`,
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {
        "X-Ignore": "example-header"
      },
      previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      previewVideoHttpHeaders: {
        "X-Ignore": "example-header"
      },
      duration: 120 + index * 10, // seconds
      viewsTotal: Math.trunc(index * 3.1416 * 1000000),
      ratingsPositivePercent: Math.trunc(index * 3.1416 * 10) % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: "Test author name",
      authorID: authorID,
      unavailableFields: [],
      // Make every 4th video a fail
      scrapeFailException: index % 4 === 0 ? new ScrapingException("Test fail scrape message") : null,
    }),
  );
}
