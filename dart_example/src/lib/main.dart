import "dart:convert";
import "dart:math";
import 'dart:typed_data';

import 'package:html/dom.dart';

import 'try_parse.dart';
import 'universal_formats.dart';
import 'wrapper.dart';

// For development only: set to true to enable simulated delays for all functions
const simulateDelays = false;

Future<void> init() async {
  // Simulate network latency
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

// To test share/drop any of the following links into the app:
// https://example.com/home?page=3
// https://example.com/search?query=keyword&sortingType=Relevance&page=1
// https://example.com/video?videoId=123
// https://example.com/author?authorId=123
Future<ExternalLinkParsed> parseExternalLink(String uriString) async {
  final uri = Uri.parse(uriString);
  final args = uri.queryParameters;

  switch (uri.path) {
    case "/home":
      return ExternalLinkParsed(
        type: ContentType.homePage,
        pageCount: tryParse(() => int.parse(args["page"] ?? "0")),
      );

    case "/search":
      return ExternalLinkParsed(
        type: ContentType.searchResultsPage,
        searchRequest: UniversalSearchRequest(
          searchString: args["query"],
          sortingType: args["sortingType"],
          dateRange: args["dateRange"],
          minQuality: tryParse(() => int.parse(args["minQuality"]!)),
          maxQuality: tryParse(() => int.parse(args["maxQuality"]!)),
          minDuration: tryParse(() => int.parse(args["minDuration"]!)),
          maxDuration: tryParse(() => int.parse(args["maxDuration"]!)),
          minFramesPerSecond: tryParse(
            () => int.parse(args["minFramesPerSecond"]!),
          ),
          maxFramesPerSecond: tryParse(
            () => int.parse(args["maxFramesPerSecond"]!),
          ),
          virtualReality: tryParse(() => bool.parse(args["virtualReality"]!)),
          // categories and keywords not yet fully supported
        ),
        pageCount: tryParse(() => int.parse(args["page"]!)),
      );

    case "/video":
      if (args["videoId"]?.isEmpty ?? true) {
        throw Exception("Missing videoId");
      }
      return ExternalLinkParsed(
        type: ContentType.videoPage,
        iD: args["videoId"]!,
      );

    case "/author":
      if (args["authorId"]?.isEmpty ?? true) {
        throw Exception("Missing authorId");
      }
      return ExternalLinkParsed(
        type: ContentType.authorPage,
        iD: args["authorId"]!,
      );

    default:
      return const ExternalLinkParsed(type: ContentType.unknown);
  }
}

Future<List<UniversalVideoPreview>> getHomePage(int page) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: ((page * 10 + index) * 3.1416 * 10000).toInt().toString(),
      title: "Test homepage video $index, page $page",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * 3.1416 * 1000000).toInt(),
      ratingsPositivePercent: (index * 3.1416 * 10).toInt() % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: "Tester-author $index",
      authorID: "Tester-author $index",
      verifiedAuthor: index % 2 == 0,
      unavailableFields: {},
      // Make every 4th video a fail
      scrapeFailException: index % 4 == 0
          ? ScrapingException("Test fail scrape message")
          : null,
    ),
  );
}

Future<Uint8List> downloadThumbnail(
  String uri,
  Map<String, String>? thumbnailHttpHeaders,
) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(milliseconds: 500));
  final response = await httpRequest(uri, thumbnailHttpHeaders);
  if (response.statusCode != 200) {
    consoleLog("error", "Error downloading thumbnail: ${response.statusCode}");
    throw Exception("Error downloading thumbnail: ${response.statusCode}");
  }
  return response.bodyBytes;
}

Future<List<String>> getSearchSuggestions(String searchString) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(milliseconds: 200));
  return List.generate(5, (index) => "$searchString-$index");
}

Future<List<UniversalVideoPreview>> getSearchResults(
  UniversalSearchRequest request,
  int page,
) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: ((page * 10 + index) * 3.1416 * 10000).toInt().toString(),
      title:
          "Test result video $index, page $page, request ${request.searchString}",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * 3.1416 * 1000000).toInt(),
      ratingsPositivePercent: (index * 3.1416 * 10).toInt() % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: "Tester-author $index",
      authorID: "Tester-author $index",
      verifiedAuthor: index % 2 == 0,
      unavailableFields: {},
      // Make every 4th video a fail
      scrapeFailException: index % 4 == 0
          ? ScrapingException("Test fail scrape message")
          : null,
    ),
  );
}

Future<String?> getVideoUriFromID(String videoID) async =>
    "https://example.com/video?videoId=$videoID";

Future<UniversalVideoMetadata> getVideoMetadata(
  String videoID,
  UniversalVideoPreview uvp,
) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return UniversalVideoMetadata(
    iD: videoID,
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
    unavailableFields: {},
    // Uncomment to test partial metadata scrape fail
    //scrapeFailException: ScrapingException("Test fail scrape message"),
    authorID: "tester-author-$videoID",
    authorName: "Tester-author",
    authorSubscriberCount: 335433,
    authorAvatar: "https://placehold.co/240x240.png",
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
    description: "Tester video description " * 10,
    viewsTotal: 2532823,
    tags: ["Tester-tag-1", "Tester-tag-2"],
    categories: ["Tester-category-1", "Tester-category-2"],
    uploadDate: DateTime.now(),
    ratingsPositiveTotal: 42646,
    ratingsNegativeTotal: 4738,
    ratingsTotal: 47384,
    virtualReality: false,
    chapters: {
      Duration.zero: "Chapter 1",
      const Duration(seconds: 120): "Chapter 2",
      const Duration(seconds: 240): "Chapter 3",
    },
    rawHtml: Document(),
  );
}

Future<List<Uint8List>?> getProgressThumbnails(
  String videoID,
  String rawHtml,
) async {
  // Simulate heavy processing
  final end = DateTime.now().add(const Duration(seconds: 3));
  while (DateTime.now().isBefore(end)) {
    // Burn CPU cycles
    sqrt(DateTime.now().microsecondsSinceEpoch.toDouble());
  }
  consoleLog("debug", "Heavy processing completed");

  final response = await httpRequest("https://placehold.co/720x480.png");
  if (response.statusCode != 200) {
    throw Exception("Failed to download placeholder image");
  }
  // Return 1000 copies of the same image
  return List.filled(1000, response.bodyBytes);
}

Future<String?> getCommentUriFromID(String commentID, String videoID) async =>
    "https://example.com/video?videoId=$videoID&commentId=$commentID";

Future<List<UniversalComment>> getComments(
  String videoID,
  String rawHtml,
  int page,
) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return List.generate(
    10,
    (index) => UniversalComment(
      iD: "comment-$page-$index",
      videoID: videoID,
      author: "author-$index",
      commentBody: List.filled(5, "test comment $index, page $page ").join(""),
      // Make every 4th comment hidden
      hidden: index % 4 == 0,
      authorID: "author-$index",
      countryID: "US",
      orientation: null,
      profilePicture: "https://placehold.co/240x240.png",
      ratingsPositiveTotal: index % 4 == 0 ? 30 : null,
      ratingsNegativeTotal: index % 4 == 0 ? 2 : null,
      ratingsTotal: index % 4 == 0 ? 32 : 76,
      commentDate: DateTime.now().subtract(Duration(days: index)),
      replyComments: index % 2 == 0
          ? List.generate(
              3,
              (replyIndex) => UniversalComment(
                iD: "comment-reply-$page-$index-$replyIndex",
                videoID: videoID,
                author: "author-reply-$replyIndex",
                commentBody: List.filled(
                  5,
                  "test reply comment $replyIndex ",
                ).join(""),
                // Make every 4th reply hidden
                hidden: replyIndex % 4 == 0,
                authorID: "author-reply-$replyIndex",
                countryID: "US",
                orientation: null,
                profilePicture: "https://placehold.co/240x240.png",
                ratingsPositiveTotal: replyIndex % 2 == 0 ? 4 : null,
                ratingsNegativeTotal: replyIndex % 2 == 0 ? 1 : null,
                ratingsTotal: replyIndex % 2 == 0 ? 5 : 6,
                commentDate: DateTime.now().subtract(
                  Duration(days: replyIndex),
                ),
                replyComments: [],
                unavailableFields: {},
                // Make every 2nd reply a fail
                scrapeFailException: replyIndex % 2 == 1
                    ? ScrapingException("Test fail scrape message")
                    : null,
              ),
            )
          : <UniversalComment>[],
      unavailableFields: {},
      // Make every 3rd comment a fail
      scrapeFailException: index % 3 == 0
          ? ScrapingException("Test fail scrape message")
          : null,
    ),
  );
}

Future<List<UniversalVideoPreview>> getVideoSuggestions(
  String videoID,
  String rawHtml,
  int page,
) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: ((page * 10 + index) * 3.1416 * 10000).toInt().toString(),
      title: "Test suggestion video $index",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * 3.1416 * 1000000).toInt(),
      ratingsPositivePercent: (index * 3.1416 * 10).toInt() % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: "Tester-suggestion-author $index",
      authorID: "Tester-suggestion-author $index",
      verifiedAuthor: index % 2 == 0,
      unavailableFields: {},
      // Make every 4th video a fail
      scrapeFailException: index % 4 == 0
          ? ScrapingException("Test fail scrape message")
          : null,
    ),
  );
}

Future<String?> getAuthorUriFromID(String authorID) async =>
    "https://example.com/author?authorId=$authorID";

Future<UniversalAuthorPage> getAuthorPage(String authorID) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return UniversalAuthorPage(
    iD: authorID,
    name: "Test author name",
    avatar: "https://placehold.co/240x240.png",
    banner: "https://placehold.co/1270x400.png",
    aliases: ["Test alias 1", "Test alias 2"],
    description: "Very long description " * 1000,
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
    videosTotal: 50,
    unavailableFields: {},
    subscribers: 573529,
    rank: 3746,
    rawHtml: Document(),
  );
}

Future<List<UniversalVideoPreview>> getAuthorVideos(
  String authorID,
  String rawHtml,
  int page,
) async {
  // Simulate network latency
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  // Past the last page, return an empty list
  if (page >= 5) return [];
  return List.generate(
    10,
    (index) => UniversalVideoPreview(
      iD: ((page * 10 + index) * 3.1416 * 10000).toInt().toString(),
      title: "Test author video $index, page $page",
      thumbnail: "https://placehold.co/1280x720.png",
      thumbnailHttpHeaders: {"X-Ignore": "example-header"},
      previewVideo: Uri.parse(
        "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      ),
      previewVideoHttpHeaders: {"X-Ignore": "example-header"},
      duration: Duration(seconds: 120 + index * 10),
      viewsTotal: (index * 3.1416 * 1000000).toInt(),
      ratingsPositivePercent: (index * 3.1416 * 10).toInt() % 101,
      maxQuality: 1080,
      virtualReality: false,
      authorName: "Test author name",
      authorID: authorID,
      unavailableFields: {},
      // Make every 4th video a fail
      scrapeFailException: index % 4 == 0
          ? ScrapingException("Test fail scrape message")
          : null,
    ),
  );
}
