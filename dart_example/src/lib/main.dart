import "dart:convert";
import "dart:math";
import 'dart:typed_data';

import 'package:html/dom.dart';

import 'universal_formats.dart';
import 'wrapper.dart';

const simulateDelays = false;
bool progressThumbnailsCancelled = false;

Future<void> init() async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  // read cache file to showcase functionality
  final result = await readCacheFile("testerInitFile.txt");
  // Failure -> assume file doesn't yet exist
  if (result["status"] == "failure") {
    final contents = "random number: ${Random().nextInt(100000)}";
    await writeCacheFile("testerInitFile.txt", utf8.encode(contents).toList());
    consoleLog("info", "Created file with contents: $contents");
  } else {
    consoleLog(
      "info",
      "Read from file: ${String.fromCharCodes(List<int>.from(result["message"]))}",
    );
  }
  consoleLog("info", "Tester External plugin initialized");
}

Future<bool> runFunctionalityTest() async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  consoleLog("info", "Functionality test completed");
  return true;
}

Future<ExternalLinkParsed> parseExternalLink(String uriString) async {
  final uri = Uri.parse(uriString);
  final args = uri.queryParameters;

  switch (uri.path) {
    case "/home":
      return ExternalLinkParsed(
        type: ContentType.homePage,
        pageCount: int.parse(args["page"] ?? "0"),
      );

    case "/search":
      return ExternalLinkParsed(
        type: ContentType.searchResultsPage,
        searchRequest: UniversalSearchRequest(
          searchString: Uri.decodeQueryComponent(args["query"] ?? ""),
          sortingType: args["sortingType"],
          dateRange: args["dateRange"],
          minQuality: int.parse(args["minQuality"] ?? "0"),
          maxQuality: int.parse(args["maxQuality"] ?? "0"),
          minDuration: int.parse(args["minDuration"] ?? "0"),
          maxDuration: int.parse(args["maxDuration"] ?? "0"),
          minFramesPerSecond: int.parse(args["minFramesPerSecond"] ?? "0"),
          maxFramesPerSecond: int.parse(args["maxFramesPerSecond"] ?? "0"),
          virtualReality: args["virtualReality"] != null
              ? args["virtualReality"] == "true"
              : null,
        ),
        pageCount: int.parse(args["page"] ?? "0"),
      );

    case "/video":
      return ExternalLinkParsed(
        type: ContentType.videoPage,
        iD: args["videoId"],
      );

    case "/author":
      return ExternalLinkParsed(
        type: ContentType.authorPage,
        iD: args["authorId"],
      );

    default:
      return const ExternalLinkParsed(type: ContentType.unknown);
  }
}

Future<List<UniversalVideoPreview>> getHomePage(int page) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: (index * pi * 10000).toInt().toString(),
      title: "Test homepage video $index, page $page",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * pi * 1000000).toInt(),
      ratingsPositivePercent: (index * pi * 10).toInt() % 101,
      maxQuality: 720,
      virtualReality: false,
      authorName: "Tester-author $index",
      authorID: "Tester-author $index",
      verifiedAuthor: index % 2 == 0,
      // Make every 4th video a fail
      scrapeFailMessage: index % 4 != 0 ? "Test fail scrape message" : null,
    ),
  );
}

Future<Uint8List> downloadThumbnail(
  String uri,
  Map<String, String>? thumbnailHttpHeaders,
) async {
  try {
    final response = await httpRequest(uri);
    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      consoleLog(
        "error",
        "Error downloading thumbnail: ${response.statusCode}",
      );
      return Uint8List(0);
    }
  } catch (e) {
    consoleLog("error", "Error downloading thumbnail: $e");
    return Uint8List(0);
  }
}

Future<List<String>> getSearchSuggestions(String searchString) async {
  if (simulateDelays) await Future.delayed(const Duration(milliseconds: 200));
  return List.generate(5, (index) => "$searchString-$index");
}

Future<List<UniversalVideoPreview>> getSearchResults(
  UniversalSearchRequest request,
  int page,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  if (page == 5) return [];

  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: (index * pi * 10000).toInt().toString(),
      title:
          "Test result video $index, page $page, request ${request.searchString}",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * pi * 1000000).toInt(),
      ratingsPositivePercent: (index * pi * 10000).toInt() == 0
          ? 50
          : (index * pi * 10000).toInt(),
      maxQuality: 720,
      virtualReality: false,
      authorName: "Tester-author $index",
      authorID: "Tester-author $index",
      verifiedAuthor: index % 2 == 0,
      // Make every 4th video a fail
      scrapeFailMessage: index % 4 != 0 ? "Test fail scrape message" : null,
    ),
  );
}

String getVideoUriFromID(String videoID) => "https://example.com/$videoID";

Future<UniversalVideoMetadata> getVideoMetadata(
  String videoId,
  UniversalVideoPreview uvp,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return UniversalVideoMetadata(
    iD: videoId,
    m3u8Uris: {
      1080: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      720: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      480: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
    },
    title: "Tester video metadata title",
    universalVideoPreview: uvp,
    // Change this to test partial metadata scrape fail
    //scrapeFailMessage: "Test fail scrape message",
    authorID: "tester-author-$videoId",
    authorName: "Tester-author",
    authorSubscriberCount: 335433,
    authorAvatar: "https://placehold.co/1280x720.png",
    actors: [
      (
        name: "Tester-actor-1",
        authorID: "Tester-author-actor-1",
        avatar: "https://placehold.co/200x200.png",
      ),
      (
        name: "Tester-actor-2",
        authorID: "Tester-author-actor-2",
        avatar: "https://placehold.co/200x200.png",
      ),
    ],
    description: "Tester video description" * 10,
    viewsTotal: 2532823,
    tags: ["Tester-tag-1", "Tester-tag-2"],
    categories: ["Tester-category-1", "Tester-category-2"],
    uploadDate: DateTime.now(),
    ratingsPositiveTotal: 90,
    ratingsNegativeTotal: 10,
    ratingsTotal: 47384,
    virtualReality: false,
    chapters: {
      Duration.zero: "Chapter 1",
      const Duration(seconds: 120): "Chapter 2",
      const Duration(seconds: 240): "Chapter 3",
    },
  );
}

Future<List<Uint8List>> getProgressThumbnails(
  String videoID,
  String rawHtml,
) async {
  // reset cancellation flag
  progressThumbnailsCancelled = false;
  // Simulate heavy processing (split into chunks so cancellation can be checked)
  for (int i = 0; i < 50; i++) {
    if (progressThumbnailsCancelled) return [];
    await Future.delayed(const Duration(milliseconds: 100));
  }
  if (progressThumbnailsCancelled) return [];
  final response = await httpRequest("https://placehold.co/720x480.png");
  if (response.statusCode != 200) {
    throw Exception("Failed to download/convert placeholder image");
  }
  if (progressThumbnailsCancelled) return [];
  // Return 1000 copies of the same image
  return List.filled(1000, response.bodyBytes);
}

void cancelGetProgressThumbnails() {
  progressThumbnailsCancelled = true;
  consoleLog("warning", "Set flag to cancel getProgressThumbnails");
}

String getCommentUriFromID(String commentID, String videoID) =>
    "https://example.com/$videoID/$commentID";

Future<List<UniversalComment>> getComments(
  String videoID,
  String rawHtml,
  int page,
) async {
  if (page == 5) return [];
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return List.generate(
    10,
    (index) => UniversalComment(
      iD: "comment-$index",
      videoID: videoID,
      author: "author-$index",
      commentBody: List.filled(5, "test comment $index, page $page ").join(""),
      hidden: index % 4 == 0,
      authorID: "author-$index",
      countryID: "US",
      orientation: null,
      profilePicture: "https://placehold.co/240x240.png",
      ratingsPositiveTotal: index % 4 == 0 ? 30 : null,
      ratingsNegativeTotal: index % 4 == 0 ? 2 : null,
      ratingsTotal: index % 4 == 0 ? 32 : 76,
      commentDate: DateTime.now(),
      replyComments: index % 2 == 0
          ? List.generate(
              3,
              (index) => UniversalComment(
                iD: "comment-reply-$index",
                videoID: videoID,
                author: "author-reply-$index",
                commentBody: List.filled(
                  5,
                  "test reply comment $index ",
                ).join(""),
                hidden: index % 4 == 0,
                authorID: "author-reply-$index",
                countryID: "US",
                orientation: null,
                profilePicture: "https://placehold.co/240x240",
                ratingsPositiveTotal: index % 2 == 0 ? 4 : null,
                ratingsNegativeTotal: index % 2 == 0 ? 1 : null,
                ratingsTotal: index % 2 == 0 ? 5 : 6,
                commentDate: DateTime.now(),
                replyComments: [],
                // Make every 4th comment a fail
                scrapeFailMessage: index % 4 != 0
                    ? "Test fail scrape message"
                    : null,
              ),
            )
          : <UniversalComment>[],
      // Make every 4th comment a fail
      scrapeFailMessage: index % 4 != 0 ? "Test fail scrape message" : null,
    ),
  );
}

Future<List<UniversalVideoPreview>> getVideoSuggestions(
  String videoID,
  String rawHtml,
  int page,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  if (page == 5) return [];
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: (index * pi * 10000).toInt().toString(),
      title: "Test suggestion video $index",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * pi * 1000000).toInt(),
      ratingsPositivePercent: (index * pi * 10000).toInt() == 0
          ? 50
          : (index * pi * 10000).toInt(),
      maxQuality: 720,
      virtualReality: false,
      authorName: "Tester-suggestion-author $index",
      authorID: "Tester-suggestion-author $index",
      verifiedAuthor: index % 2 == 0,
      // Make every 4th video a fail
      scrapeFailMessage: index % 4 != 0 ? "Test fail scrape message" : null,
    ),
  );
}

String getAuthorUriFromID(String authorID) => "https://example.com/$authorID";

Future<UniversalAuthorPage> getAuthorPage(String authorID) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return UniversalAuthorPage(
    iD: authorID,
    name: "Test author name",
    avatar: "https://placehold.co/240x240.png",
    banner: "https://placehold.co/1270x400.png",
    aliases: ["Test alias 1", "Test alias 2"],
    description: "Very long description" * 1000,
    advancedDescription: Map.fromEntries(
      List.generate(
        1000,
        (i) => MapEntry(
          "Test description key ${i + 1}",
          "Test description value ${i + 1}",
        ),
      ),
    ),
    externalLinks: {
      "external link 1": Uri.parse("https://example.com/link1"),
      "external link 2": Uri.parse("https://example.com/link2"),
      "external link 3": Uri.parse("https://example.com/link3"),
    },
    viewsTotal: 23773212,
    videosTotal: 114,
    subscribers: 573529,
    rank: 3746,
    rawHtml: Document(),
  );
}

Future<List<UniversalVideoPreview>> getAuthorVideos(
  String authorID,
  int page,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  if (page == 5) return [];
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: (index * pi * 10000).toInt().toString(),
      title: "Test author video $index, page $page",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * pi * 1000000).toInt(),
      ratingsPositivePercent: (index * pi * 10000).toInt() == 0
          ? 50
          : (index * pi * 10000).toInt(),
      maxQuality: 720,
      virtualReality: false,
      authorName: "Tester-author-same $index",
      authorID: "Tester-author-same $index",
      verifiedAuthor: index % 2 == 0,
      // Make every 4th video a fail
      scrapeFailMessage: index % 4 != 0 ? "Test fail scrape message" : null,
    ),
  );
}
