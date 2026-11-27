const simulateDelays = false;

let progressThumbnailsCancelled = false;

// Matches Dart's String.fromCharCodes / charCodeAt usage in init(); fine for
// the ASCII-only random-number test string.
function bytesToString(bytes: number[]): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]!);
  return str;
}

function stringToBytes(str: string): number[] {
  return Array.from(str, (c) => c.charCodeAt(0));
}

const plugin: PluginApi = {
  init: async () => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    // read cache file to showcase functionality
    const result = await readCacheFile("testerInitFile.txt");
    // Failure -> assume file doesn't yet exist
    if (result.status === "failure") {
      const contents = `random number: ${Math.floor(Math.random() * 100000)}`;
      await writeCacheFile("testerInitFile.txt", stringToBytes(contents));
      consoleLog("info", `Created file with contents: ${contents}`);
    } else {
      consoleLog("info", `Read from file: ${bytesToString(result.message)}`);
    }
    consoleLog("info", "Tester External plugin initialized");
  },

  runFunctionalityTest: async () => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    consoleLog("info", "Functionality test completed");
    return true;
  },

  parseExternalLink: async (uriString) => {
    const url = new URL(uriString);
    const args = Object.fromEntries(url.searchParams.entries());

    switch (url.pathname) {
      case "/home":
        return new ExternalLinkParsed({
          type: "homePage",
          pageCount: parseInt(args["page"] ?? "0", 10),
        });

      case "/search":
        return new ExternalLinkParsed({
          type: "searchResultsPage",
          searchRequest: new UniversalSearchRequest({
            searchString: decodeURIComponent(args["query"] ?? ""),
            sortingType: args["sortingType"],
            dateRange: args["dateRange"],
            minQuality: args["minQuality"] ? parseInt(args["minQuality"], 10) : undefined,
            maxQuality: args["maxQuality"] ? parseInt(args["maxQuality"], 10) : undefined,
            minDuration: args["minDuration"] ? parseInt(args["minDuration"], 10) : undefined,
            maxDuration: args["maxDuration"] ? parseInt(args["maxDuration"], 10) : undefined,
            minFramesPerSecond: args["minFramesPerSecond"]
              ? parseInt(args["minFramesPerSecond"], 10)
              : undefined,
            maxFramesPerSecond: args["maxFramesPerSecond"]
              ? parseInt(args["maxFramesPerSecond"], 10)
              : undefined,
            virtualReality: args["virtualReality"] ? args["virtualReality"] === "true" : undefined,
            // categories and keywords not yet fully supported
          }),
          pageCount: parseInt(args["page"] ?? "0", 10),
        });

      case "/video":
        return new ExternalLinkParsed({
          type: "videoPage",
          iD: args["videoId"],
        });

      case "/author":
        return new ExternalLinkParsed({
          type: "authorPage",
          iD: args["authorId"],
        });

      default:
        return new ExternalLinkParsed({
          type: "unknown",
        });
    }
  },

  getHomePage: async (page) => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    return Array.from(
      { length: 10 },
      (_, index) =>
        new UniversalVideoPreview({
          iD: String(Math.trunc(index * Math.PI * 10000)),
          title: `Test homepage video ${index}, page ${page}`,
          thumbnail: "https://placehold.co/1280x720.png",
          thumbnailHttpHeaders: { "X-Ignore": "example-header" },
          previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
          previewVideoHttpHeaders: { "X-Ignore": "example-header" },
          duration: 120 + index * 10, // seconds
          viewsTotal: Math.trunc(index * Math.PI * 1000000),
          ratingsPositivePercent: Math.trunc(index * Math.PI * 10) % 101,
          maxQuality: 720,
          virtualReality: false,
          authorName: `Tester-author ${index}`,
          authorID: `Tester-author ${index}`,
          verifiedAuthor: index % 2 === 0,
          unavailableFields: [],
          // Make every 4th video a fail
          scrapeFailException:
            index % 4 !== 0 ? new ScrapingException("Test fail scrape message") : null,
        }),
    );
  },

  downloadThumbnail: async (uri, thumbnailHttpHeaders) => {
    const response = await httpRequest(uri, thumbnailHttpHeaders);
    if (response.statusCode !== 200) {
      consoleLog("error", `Error downloading thumbnail: ${response.statusCode}`);
      throw new Error(`Error downloading thumbnail: ${response.statusCode}`);
    }
    // bodyBytes comes back as an int array (JSON), convert for the host
    return Uint8Array.from(response.bodyBytes);
  },

  getSearchSuggestions: async (searchString) => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 200));
    return Array.from({ length: 5 }, (_, index) => `${searchString}-${index}`);
  },

  getSearchResults: async (request, page) => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    if (page === 5) return [];
    return Array.from(
      { length: 10 },
      (_, index) =>
        new UniversalVideoPreview({
          iD: String(Math.trunc(index * Math.PI * 10000)),
          title: `Test result video ${index}, page ${page}, request ${request.searchString}`,
          thumbnail: "https://placehold.co/1280x720.png",
          thumbnailHttpHeaders: { "X-Ignore": "example-header" },
          previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
          previewVideoHttpHeaders: { "X-Ignore": "example-header" },
          duration: 120 + index * 10, // seconds
          viewsTotal: Math.trunc(index * Math.PI * 1000000),
          ratingsPositivePercent: parseInt((index * Math.PI * 10000).toFixed(2), 10) || 50,
          maxQuality: 720,
          virtualReality: false,
          authorName: `Tester-author ${index}`,
          authorID: `Tester-author ${index}`,
          verifiedAuthor: index % 2 === 0,
          unavailableFields: [],
          // Make every 4th video a fail
          scrapeFailException:
            index % 4 !== 0 ? new ScrapingException("Test fail scrape message") : null,
        }),
    );
  },

  getVideoUriFromID: (videoID) => `https://example.com/${videoID}`,

  getVideoMetadata: async (videoID, uvp) => {
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
      // Change this to test partial metadata scrape fail
      //scrapeFailException: new ScrapingException("Test fail scrape message"),
      authorID: `tester-author-${videoID}`,
      authorName: "Tester-author",
      authorSubscriberCount: 335433,
      authorAvatar: "https://placehold.co/1280x720.png",
      actors: [
        {
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
      description: "Tester video description".repeat(10),
      viewsTotal: 2532823,
      tags: ["Tester-tag-1", "Tester-tag-2"],
      categories: ["Tester-category-1", "Tester-category-2"],
      uploadDate: new Date(),
      ratingsPositiveTotal: 90,
      ratingsNegativeTotal: 10,
      ratingsTotal: 47384,
      virtualReality: false,
      chapters: {
        0: "Chapter 1",
        120: "Chapter 2",
        240: "Chapter 3",
      },
      rawHtml: "",
    });
  },

  getProgressThumbnails: async (videoID, rawHtml) => {
    // reset cancellation flag
    progressThumbnailsCancelled = false;
    // Simulate heavy processing (split into chunks so cancellation can be checked)
    for (let i = 0; i < 50; i++) {
      if (progressThumbnailsCancelled) return [];
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (progressThumbnailsCancelled) return [];
    const response = await httpRequest("https://placehold.co/720x480.png");
    if (response.statusCode !== 200) {
      throw new Error("Failed to download/convert placeholder image");
    }
    if (progressThumbnailsCancelled) return [];
    // Return 1000 copies of the same image
    return new Array<Uint8Array>(1000).fill(Uint8Array.from(response.bodyBytes));
  },

  cancelGetProgressThumbnails: () => {
    progressThumbnailsCancelled = true;
    consoleLog("warning", "Set flag to cancel getProgressThumbnails");
  },

  getCommentUriFromID: (commentID, videoID) => `https://example.com/${videoID}/${commentID}`,

  getComments: async (videoID, rawHtml, page) => {
    if (page === 5) return [];
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    return Array.from(
      { length: 10 },
      (_, index) =>
        new UniversalComment({
          iD: `comment-${index}`,
          videoID,
          author: `author-${index}`,
          commentBody: Array(5).fill(`test comment ${index}, page ${page} `).join(""),
          hidden: index % 4 === 0,
          authorID: `author-${index}`,
          countryID: "US",
          orientation: null,
          profilePicture: "https://placehold.co/240x240.png",
          ratingsPositiveTotal: index % 4 === 0 ? 30 : null,
          ratingsNegativeTotal: index % 4 === 0 ? 2 : null,
          ratingsTotal: index % 4 === 0 ? 32 : 76,
          commentDate: new Date(),
          replyComments:
            index % 2 === 0
              ? Array.from(
                  { length: 3 },
                  (_, j) =>
                    new UniversalComment({
                      iD: `comment-reply-${j}`,
                      videoID,
                      author: `author-reply-${j}`,
                      commentBody: Array(5).fill(`test reply comment ${j} `).join(""),
                      hidden: j % 4 === 0,
                      authorID: `author-reply-${j}`,
                      countryID: "US",
                      orientation: null,
                      profilePicture: "https://placehold.co/240x240",
                      ratingsPositiveTotal: j % 2 === 0 ? 4 : null,
                      ratingsNegativeTotal: j % 2 === 0 ? 1 : null,
                      ratingsTotal: j % 2 === 0 ? 5 : 6,
                      commentDate: new Date(),
                      replyComments: [],
                      unavailableFields: [],
                      // Make every 4th reply a fail
                      scrapeFailException:
                        j % 4 !== 0 ? new ScrapingException("Test fail scrape message") : null,
                    }),
                )
              : [],
          unavailableFields: [],
          // Make every 4th comment a fail
          scrapeFailException:
            index % 4 !== 0 ? new ScrapingException("Test fail scrape message") : null,
        }),
    );
  },

  getVideoSuggestions: async (videoID, rawHtml, page) => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    if (page === 5) return [];
    return Array.from(
      { length: 10 },
      (_, index) =>
        new UniversalVideoPreview({
          iD: String(Math.trunc(index * Math.PI * 10000)),
          title: `Test suggestion video ${index}`,
          thumbnail: "https://placehold.co/1280x720.png",
          thumbnailHttpHeaders: { "X-Ignore": "example-header" },
          previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
          previewVideoHttpHeaders: { "X-Ignore": "example-header" },
          duration: 120 + index * 10, // seconds
          viewsTotal: Math.trunc(index * Math.PI * 1000000),
          ratingsPositivePercent: parseInt((index * Math.PI * 10000).toFixed(2), 10) || 50,
          maxQuality: 720,
          virtualReality: false,
          authorName: `Tester-suggestion-author ${index}`,
          authorID: `Tester-suggestion-author ${index}`,
          verifiedAuthor: index % 2 === 0,
          unavailableFields: [],
          // Make every 4th video a fail
          scrapeFailException:
            index % 4 !== 0 ? new ScrapingException("Test fail scrape message") : null,
        }),
    );
  },

  getAuthorUriFromID: (authorID) => `https://example.com/${authorID}`,

  getAuthorPage: async (authorID) => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    return new UniversalAuthorPage({
      iD: authorID,
      name: "Test author name",
      avatar: "https://placehold.co/240x240.png",
      banner: "https://placehold.co/1270x400.png",
      aliases: ["Test alias 1", "Test alias 2"],
      description: "Very long description".repeat(1000),
      advancedDescription: Object.fromEntries(
        Array.from({ length: 1000 }, (_, i): [string, string] => [
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
      videosTotal: 114,
      unavailableFields: [],
      subscribers: 573529,
      rank: 3746,
      rawHtml: "",
    });
  },

  getAuthorVideos: async (authorID, rawHtml, page) => {
    if (simulateDelays) await new Promise((r) => setTimeout(r, 2000));
    if (page === 5) return [];
    return Array.from(
      { length: 10 },
      (_, index) =>
        new UniversalVideoPreview({
          iD: String(Math.trunc(index * Math.PI * 10000)),
          title: `Test author video ${index}, page ${page}`,
          thumbnail: "https://placehold.co/1280x720.png",
          thumbnailHttpHeaders: { "X-Ignore": "example-header" },
          previewVideo: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
          previewVideoHttpHeaders: { "X-Ignore": "example-header" },
          duration: 120 + index * 10, // seconds
          viewsTotal: Math.trunc(index * Math.PI * 1000000),
          ratingsPositivePercent: parseInt((index * Math.PI * 10000).toFixed(2), 10) || 50,
          maxQuality: 720,
          virtualReality: false,
          authorName: `Tester-author-same ${index}`,
          authorID: `Tester-author-same ${index}`,
          verifiedAuthor: index % 2 === 0,
          unavailableFields: [],
          // Make every 4th video a fail
          scrapeFailException:
            index % 4 !== 0 ? new ScrapingException("Test fail scrape message") : null,
        }),
    );
  },
};
