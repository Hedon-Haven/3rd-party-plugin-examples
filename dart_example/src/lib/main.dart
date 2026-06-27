import "dart:convert";
import "dart:math";

import 'wrapper.dart';

const simulateDelays = false;
bool progressThumbnailsCancelled = false;

Future<bool> init() async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  // read cache file to showcase functionality
  final result = await readCacheFile("testerInitFile.txt");
  // Failure -> assume file doesn't yet exist
  if (result.startsWith("Error:")) {
    final contents = "random number: ${Random().nextInt(100000)}";
    final base64Encoded = base64Encode(utf8.encode(contents));
    await writeCacheFile("testerInitFile.txt", base64Encoded);
    consoleLog("info", "Created file with contents: $contents");
  } else {
    consoleLog(
      "info",
      "Read from file: ${String.fromCharCodes(base64Decode(result))}",
    );
  }
  consoleLog("info", "Tester External plugin initialized");
  return true;
}

Future<bool> runFunctionalityTest() async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  consoleLog("info", "Functionality test completed");
  return true;
}

Future<Map<String, dynamic>> parseExternalLink(String uriString) async {
  final uri = Uri.parse(uriString);
  final args = uri.queryParameters;

  switch (uri.path) {
    case "/home":
      return {"type": "homePage", "pageCount": int.parse(args["page"] ?? "0")};

    case "/search":
      return {
        "type": "searchResultsPage",
        "searchRequest": {
          "searchString": Uri.decodeQueryComponent(args["query"] ?? ""),
          "sortingType": args["sortingType"],
          "dateRange": args["dateRange"],
          "minQuality": int.parse(args["minQuality"] ?? "0"),
          "maxQuality": int.parse(args["maxQuality"] ?? "0"),
          "minDuration": int.parse(args["minDuration"] ?? "0"),
          "maxDuration": int.parse(args["maxDuration"] ?? "0"),
          "minFramesPerSecond": int.parse(args["minFramesPerSecond"] ?? "0"),
          "maxFramesPerSecond": int.parse(args["maxFramesPerSecond"] ?? "0"),
          "virtualReality": args["virtualReality"] != null
              ? args["virtualReality"] == "true"
              : null,
        },
        "pageCount": int.parse(args["page"] ?? "0"),
      };

    case "/video":
      return {"type": "videoPage", "iD": args["videoId"]};

    case "/author":
      return {"type": "authorPage", "iD": args["authorId"]};

    default:
      return {"type": "unknown"};
  }
}

Future<List<Map<String, dynamic>>> getHomePage(int page) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return List.generate(
    10,
    (index) => {
      "iD": (index * pi * 10000).toInt().toString(),
      "title": "Test homepage video $index, page $page",
      "thumbnail": "https://placehold.co/1280x720.png",
      "thumbnailHttpHeaders": {"X-Ignore": "example-header"},
      "previewVideo":
          "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      "previewVideoHttpHeaders": {"X-Ignore": "example-header"},
      "duration": 120 + index * 10, // seconds
      "viewsTotal": (index * pi * 1000000).toInt(),
      "ratingsPositivePercent": (index * pi * 10).toInt() % 101,
      "maxQuality": 720,
      "virtualReality": false,
      "authorName": "Tester-author $index",
      "authorID": "Tester-author $index",
      "verifiedAuthor": index % 2 == 0,
      // Make every 4th video a fail
      "scrapeFailMessage": index % 4 != 0 ? "Test fail scrape message" : null,
    },
  );
}

Future<String> downloadThumbnail(
  String uri,
  Map<String, String>? thumbnailHttpHeaders,
) async {
  try {
    final response = await httpRequest(uri);
    if (response.status == 200) {
      return response.body; // base64 encoded bytes
    } else {
      consoleLog("error", "Error downloading thumbnail: ${response.status}");
      return "";
    }
  } catch (e) {
    consoleLog("error", "Error downloading thumbnail: $e");
    return "";
  }
}

Future<List<String>> getSearchSuggestions(String searchString) async {
  if (simulateDelays) await Future.delayed(const Duration(milliseconds: 200));
  return List.generate(5, (index) => "$searchString-$index");
}

Future<List<Map<String, dynamic>>> getSearchResults(
  Map<String, dynamic> request,
  int page,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  if (page == 5) return [];
  return List.generate(
    10,
    (index) => {
      "iD": (index * pi * 10000).toInt().toString(),
      "title":
          "Test result video $index, page $page, request ${request["searchString"]}",
      "thumbnail": "https://placehold.co/1280x720.png",
      "thumbnailHttpHeaders": {"X-Ignore": "example-header"},
      "previewVideo":
          "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      "previewVideoHttpHeaders": {"X-Ignore": "example-header"},
      "duration": 120 + index * 10, // seconds
      "viewsTotal": (index * pi * 1000000).toInt(),
      "ratingsPositivePercent": (index * pi * 10000).toInt() == 0
          ? 50
          : (index * pi * 10000).toInt(),
      "maxQuality": 720,
      "virtualReality": false,
      "authorName": "Tester-author $index",
      "authorID": "Tester-author $index",
      "verifiedAuthor": index % 2 == 0,
      // Make every 4th video a fail
      "scrapeFailMessage": index % 4 != 0 ? "Test fail scrape message" : null,
    },
  );
}

String getVideoUriFromID(String videoID) => "https://example.com/$videoID";

Future<Map<String, dynamic>> getVideoMetadata(
  String videoId,
  dynamic uvp,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return {
    "iD": videoId,
    "m3u8Uris": {
      1080: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      720: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      480: "https://docs.evostream.com/sample_content/assets/bunny.mp4",
    },
    "title": "Tester video metadata title",
    "universalVideoPreview": uvp,
    // Change this to test partial metadata scrape fail
    //"scrapeFailMessage": "Test fail scrape message",
    "authorID": "tester-author-$videoId",
    "authorName": "Tester-author",
    "authorSubscriberCount": 335433,
    "authorAvatar": "https://placehold.co/1280x720.png",
    "actors": [
      {
        "name": "Tester-actor-1",
        "authorID": "Tester-author-actor-1",
        "avatar": "https://placehold.co/200x200.png",
      },
      {
        "name": "Tester-actor-2",
        "authorID": "Tester-author-actor-2",
        "avatar": "https://placehold.co/200x200.png",
      },
    ],
    "description": "Tester video description" * 10,
    "viewsTotal": 2532823,
    "tags": ["Tester-tag-1", "Tester-tag-2"],
    "categories": ["Tester-category-1", "Tester-category-2"],
    "uploadDate": DateTime.now().millisecondsSinceEpoch ~/ 1000,
    "ratingsPositiveTotal": 90,
    "ratingsNegativeTotal": 10,
    "ratingsTotal": 47384,
    "virtualReality": false,
    "chapters": {0: "Chapter 1", 120: "Chapter 2", 240: "Chapter 3"},
    "rawHtml": null,
  };
}

Future<List<String>> getProgressThumbnails(
  String videoID,
  dynamic rawHtml,
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
  if (response.status != 200)
    throw Exception("Failed to download/convert placeholder image");
  if (progressThumbnailsCancelled) return [];
  // Return 1000 copies of the same image (base64 encoded body)
  return List.filled(1000, response.body);
}

void cancelGetProgressThumbnails() {
  progressThumbnailsCancelled = true;
  consoleLog("warning", "Set flag to cancel getProgressThumbnails");
}

String getCommentUriFromID(String commentID, String videoID) =>
    "https://example.com/$videoID/$commentID";

Future<List<Map<String, dynamic>>> getComments(
  String videoID,
  dynamic rawHtml,
  int page,
) async {
  if (page == 5) return [];
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return List.generate(
    10,
    (index) => {
      "iD": "comment-$index",
      "videoID": videoID,
      "author": "author-$index",
      "commentBody": List.filled(
        5,
        "test comment $index, page $page ",
      ).join(""),
      "hidden": index % 4 == 0,
      "authorID": "author-$index",
      "countryID": "US",
      "orientation": null,
      "profilePicture": "https://placehold.co/240x240.png",
      "ratingsPositiveTotal": index % 4 == 0 ? 30 : null,
      "ratingsNegativeTotal": index % 4 == 0 ? 2 : null,
      "ratingsTotal": index % 4 == 0 ? 32 : 76,
      "commentDate": DateTime.now().millisecondsSinceEpoch ~/ 1000,
      "replyComments": index % 2 == 0
          ? List.generate(
              3,
              (index) => {
                "iD": "comment-reply-$index",
                "videoID": videoID,
                "author": "author-reply-$index",
                "commentBody": List.filled(
                  5,
                  "test reply comment $index ",
                ).join(""),
                "hidden": index % 4 == 0,
                "authorID": "author-reply-$index",
                "countryID": "US",
                "orientation": null,
                "profilePicture": "https://placehold.co/240x240",
                "ratingsPositiveTotal": index % 2 == 0 ? 4 : null,
                "ratingsNegativeTotal": index % 2 == 0 ? 1 : null,
                "ratingsTotal": index % 2 == 0 ? 5 : 6,
                "commentDate": DateTime.now().millisecondsSinceEpoch ~/ 1000,
                "replyComments": [],
                // Make every 4th comment a fail
                "scrapeFailMessage": index % 4 != 0
                    ? "Test fail scrape message"
                    : null,
              },
            )
          : [],
      // Make every 4th comment a fail
      "scrapeFailMessage": index % 4 != 0 ? "Test fail scrape message" : null,
    },
  );
}

Future<List<Map<String, dynamic>>> getVideoSuggestions(
  String videoID,
  dynamic rawHtml,
  int page,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  if (page == 5) return [];
  return List.generate(
    10,
    (index) => {
      "iD": (index * pi * 10000).toInt().toString(),
      "title": "Test suggestion video $index",
      "thumbnail": "https://placehold.co/1280x720.png",
      "thumbnailHttpHeaders": {"X-Ignore": "example-header"},
      "previewVideo":
          "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      "previewVideoHttpHeaders": {"X-Ignore": "example-header"},
      "duration": 120 + index * 10, // seconds
      "viewsTotal": (index * pi * 1000000).toInt(),
      "ratingsPositivePercent": (index * pi * 10000).toInt() == 0
          ? 50
          : (index * pi * 10000).toInt(),
      "maxQuality": 720,
      "virtualReality": false,
      "authorName": "Tester-suggestion-author $index",
      "authorID": "Tester-suggestion-author $index",
      "verifiedAuthor": index % 2 == 0,
      // Make every 4th video a fail
      "scrapeFailMessage": index % 4 != 0 ? "Test fail scrape message" : null,
    },
  );
}

String getAuthorUriFromID(String authorID) => "https://example.com/$authorID";

Future<Map<String, dynamic>> getAuthorPage(String authorID) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  return {
    "iD": authorID,
    "name": "Test author name",
    "avatar": "https://placehold.co/240x240.png",
    "banner": "https://placehold.co/1270x400.png",
    "aliases": ["Test alias 1", "Test alias 2"],
    "description": "Very long description" * 1000,
    "advancedDescription": Map.fromEntries(
      List.generate(
        1000,
        (i) => MapEntry(
          "Test description key ${i + 1}",
          "Test description value ${i + 1}",
        ),
      ),
    ),
    "externalLinks": {
      "external link 1": "https://example.com/link1",
      "external link 2": "https://example.com/link2",
      "external link 3": "https://example.com/link3",
    },
    "viewsTotal": 23773212,
    "videosTotal": 114,
    "subscribers": 573529,
    "rank": 3746,
    "rawHtml": "",
  };
}

Future<List<Map<String, dynamic>>> getAuthorVideos(
  String authorID,
  int page,
) async {
  if (simulateDelays) await Future.delayed(const Duration(seconds: 2));
  if (page == 5) return [];
  return List.generate(
    10,
    (index) => {
      "iD": (index * pi * 10000).toInt().toString(),
      "title": "Test author video $index, page $page",
      "thumbnail": "https://placehold.co/1280x720.png",
      "thumbnailHttpHeaders": {"X-Ignore": "example-header"},
      "previewVideo":
          "https://docs.evostream.com/sample_content/assets/bunny.mp4",
      "previewVideoHttpHeaders": {"X-Ignore": "example-header"},
      "duration": 120 + index * 10, // seconds
      "viewsTotal": (index * pi * 1000000).toInt(),
      "ratingsPositivePercent": (index * pi * 10000).toInt() == 0
          ? 50
          : (index * pi * 10000).toInt(),
      "maxQuality": 720,
      "virtualReality": false,
      "authorName": "Tester-author-same $index",
      "authorID": "Tester-author-same $index",
      "verifiedAuthor": index % 2 == 0,
      // Make every 4th video a fail
      "scrapeFailMessage": index % 4 != 0 ? "Test fail scrape message" : null,
    },
  );
}
