// Trimmed/slightly simplified JS mirror of universal_formats.dart from the main Hedon Haven repo

const pluginCodeName = "com.hedon_haven.tester_external_js";

function tryParseFromUnixTime(unixTimeInSeconds) {
  if (unixTimeInSeconds == null) return null;
  return new Date(unixTimeInSeconds * 1000);
}

function convertToUnixTime(dateTime) {
  if (dateTime == null) return null;
  return Math.floor(dateTime.getTime() / 1000);
}

class HttpResponse {
  constructor({
    statusCode,
    bodyBytes,
    body,
    headers
  }) {
    this.statusCode = statusCode;
    this.bodyBytes = bodyBytes;
    this.body = body;
    this.headers = headers;
  }
  toMap() {
    return {
      "statusCode": this.statusCode,
      "bodyBytes": Array.from(this.bodyBytes),
      "body": this.body,
      "headers": this.headers,
    };
  }
  static fromMap(map) {
    return new HttpResponse({
      statusCode: map["statusCode"],
      bodyBytes: Uint8Array.from(map["bodyBytes"]),
      body: map["body"],
      headers: map["headers"],
    });
  }
}

class ExternalLinkParsed {
  constructor({
    type,
    iD = null,
    searchRequest = null,
    pageCount = null
  }) {
    this.type = type;
    this.iD = iD;
    this.searchRequest = searchRequest;
    this.pageCount = pageCount;
  }
  toMap() {
    return {
      "type": this.type,
      "iD": this.iD,
      "searchRequest": this.searchRequest?.toMap() ?? null,
      "pageCount": this.pageCount,
    };
  }
}

class UniversalSearchRequest {
  constructor(opts = {}) {
    this.searchString = opts.searchString ?? "";
    this.sortingType = opts.sortingType ?? "Relevance";
    this.dateRange = opts.dateRange ?? "All time";
    this.minQuality = opts.minQuality ?? 0;
    this.maxQuality = opts.maxQuality ?? 2160;
    this.minDuration = opts.minDuration ?? 0;
    this.maxDuration = opts.maxDuration ?? 3600;
    this.minFramesPerSecond = opts.minFramesPerSecond ?? 0;
    this.maxFramesPerSecond = opts.maxFramesPerSecond ?? 60;
    this.virtualReality = opts.virtualReality ?? false;
    this.categoriesInclude = opts.categoriesInclude ?? [];
    this.categoriesExclude = opts.categoriesExclude ?? [];
    this.keywordsInclude = opts.keywordsInclude ?? [];
    this.keywordsExclude = opts.keywordsExclude ?? [];
    this.historySearch = opts.historySearch ?? false;
  }
  toMap() {
    return {
      "searchString": this.searchString,
      "sortingType": this.sortingType,
      "dateRange": this.dateRange,
      "minQuality": this.minQuality,
      "maxQuality": this.maxQuality,
      "minDuration": this.minDuration,
      "maxDuration": this.maxDuration,
      "minFramesPerSecond": this.minFramesPerSecond,
      "maxFramesPerSecond": this.maxFramesPerSecond,
      "virtualReality": this.virtualReality,
      "categoriesInclude": this.categoriesInclude,
      "categoriesExclude": this.categoriesExclude,
      "keywordsInclude": this.keywordsInclude,
      "keywordsExclude": this.keywordsExclude,
      "historySearch": this.historySearch,
    };
  }
  static fromMap(map) {
    return new UniversalSearchRequest({
      searchString: map["searchString"],
      sortingType: map["sortingType"],
      dateRange: map["dateRange"],
      minQuality: map["minQuality"],
      maxQuality: map["maxQuality"],
      minDuration: map["minDuration"],
      maxDuration: map["maxDuration"],
      minFramesPerSecond: map["minFramesPerSecond"],
      maxFramesPerSecond: map["maxFramesPerSecond"],
      virtualReality: map["virtualReality"],
      categoriesInclude: map["categoriesInclude"],
      categoriesExclude: map["categoriesExclude"],
      keywordsInclude: map["keywordsInclude"],
      keywordsExclude: map["keywordsExclude"],
      historySearch: map["historySearch"],
    });
  }
}

class UniversalVideoPreview {
  constructor(opts = {}) {
    this.iD = opts.iD;
    this.title = opts.title;
    this.thumbnail = opts.thumbnail ?? null;
    this.thumbnailHttpHeaders = opts.thumbnailHttpHeaders ?? null;
    this.thumbnailBinary = opts.thumbnailBinary ?? new Uint8Array(0);
    this.previewVideo = opts.previewVideo ?? null; // string form of Uri
    this.previewVideoHttpHeaders = opts.previewVideoHttpHeaders ?? null;
    this.duration = opts.duration ?? null; // seconds
    this.viewsTotal = opts.viewsTotal ?? null;
    this.ratingsPositivePercent = opts.ratingsPositivePercent ?? null;
    this.maxQuality = opts.maxQuality ?? null;
    this.virtualReality = opts.virtualReality ?? false;
    this.authorName = opts.authorName ?? null;
    this.authorID = opts.authorID ?? null;
    this.verifiedAuthor = opts.verifiedAuthor ?? false;
    this.lastWatched = opts.lastWatched ?? null;
    this.addedOn = opts.addedOn ?? null;
    this.scrapeFailMessage = opts.scrapeFailMessage ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "title": this.title,
      "plugin": pluginCodeName,
      "thumbnail": this.thumbnail,
      "thumbnailHttpHeaders": this.thumbnailHttpHeaders,
      "thumbnailBinary": Array.from(this.thumbnailBinary),
      "previewVideo": this.previewVideo,
      "previewVideoHttpHeaders": this.previewVideoHttpHeaders,
      "duration": this.duration,
      "viewsTotal": this.viewsTotal,
      "ratingsPositivePercent": this.ratingsPositivePercent,
      "maxQuality": this.maxQuality,
      "virtualReality": this.virtualReality,
      "authorName": this.authorName,
      "authorID": this.authorID,
      "verifiedAuthor": this.verifiedAuthor,
      "lastWatched": convertToUnixTime(this.lastWatched),
      "addedOn": convertToUnixTime(this.addedOn),
      "scrapeFailMessage": this.scrapeFailMessage,
    };
  }
  static fromMap(map) {
    return new UniversalVideoPreview({
      iD: map["iD"],
      title: map["title"],
      thumbnail: map["thumbnail"],
      thumbnailHttpHeaders: map["thumbnailHttpHeaders"],
      thumbnailBinary: map["thumbnailBinary"] == null ?
        new Uint8Array(0) :
        Uint8Array.from(map["thumbnailBinary"]),
      previewVideo: map["previewVideo"],
      previewVideoHttpHeaders: map["previewVideoHttpHeaders"],
      duration: map["duration"],
      viewsTotal: map["viewsTotal"],
      ratingsPositivePercent: map["ratingsPositivePercent"],
      maxQuality: map["maxQuality"],
      virtualReality: map["virtualReality"],
      authorName: map["authorName"],
      authorID: map["authorID"],
      verifiedAuthor: map["verifiedAuthor"],
      lastWatched: tryParseFromUnixTime(map["lastWatched"]),
      addedOn: tryParseFromUnixTime(map["addedOn"]),
      scrapeFailMessage: map["scrapeFailMessage"],
    });
  }
}

class UniversalVideoMetadata {
  constructor(opts = {}) {
    this.iD = opts.iD;
    this.m3u8Uris = opts.m3u8Uris; // { [quality: string]: string }
    this.playbackHttpHeaders = opts.playbackHttpHeaders ?? null;
    this.title = opts.title;
    this.universalVideoPreview = opts.universalVideoPreview;
    this.authorID = opts.authorID;
    this.authorName = opts.authorName ?? null;
    this.authorSubscriberCount = opts.authorSubscriberCount ?? null;
    this.authorAvatar = opts.authorAvatar ?? null;
    this.actors = opts.actors ?? null;
    this.description = opts.description ?? null;
    this.viewsTotal = opts.viewsTotal ?? null;
    this.tags = opts.tags ?? null;
    this.categories = opts.categories ?? null;
    this.uploadDate = opts.uploadDate ?? null;
    this.ratingsPositiveTotal = opts.ratingsPositiveTotal ?? null;
    this.ratingsNegativeTotal = opts.ratingsNegativeTotal ?? null;
    this.ratingsTotal = opts.ratingsTotal ?? null;
    this.virtualReality = opts.virtualReality ?? false;
    this.chapters = opts.chapters ?? null; // { [seconds: string]: string }
    this.rawHtml = opts.rawHtml;
    this.scrapeFailMessage = opts.scrapeFailMessage ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "m3u8Uris": this.m3u8Uris,
      "playbackHttpHeaders": this.playbackHttpHeaders,
      "title": this.title,
      "plugin": pluginCodeName,
      "universalVideoPreview": this.universalVideoPreview?.toMap() ?? null,
      "authorID": this.authorID,
      "authorName": this.authorName,
      "authorSubscriberCount": this.authorSubscriberCount,
      "authorAvatar": this.authorAvatar,
      "actors": this.actors == null ?
        null :
        this.actors.map((e) => ({
          "name": e.name,
          "authorID": e.authorID,
          "avatar": e.avatar,
        })),
      "description": this.description,
      "viewsTotal": this.viewsTotal,
      "tags": this.tags,
      "categories": this.categories,
      "uploadDate": convertToUnixTime(this.uploadDate),
      "ratingsPositiveTotal": this.ratingsPositiveTotal,
      "ratingsNegativeTotal": this.ratingsNegativeTotal,
      "ratingsTotal": this.ratingsTotal,
      "virtualReality": this.virtualReality,
      "chapters": this.chapters,
      "rawHtml": this.rawHtml,
      "scrapeFailMessage": this.scrapeFailMessage,
    };
  }
  static fromMap(map) {
    return new UniversalVideoMetadata({
      iD: map["iD"],
      m3u8Uris: map["m3u8Uris"],
      playbackHttpHeaders: map["playbackHttpHeaders"],
      title: map["title"],
      universalVideoPreview: UniversalVideoPreview.fromMap(map["universalVideoPreview"]),
      authorID: map["authorID"],
      authorName: map["authorName"],
      authorSubscriberCount: map["authorSubscriberCount"],
      authorAvatar: map["authorAvatar"],
      actors: map["actors"],
      description: map["description"],
      viewsTotal: map["viewsTotal"],
      tags: map["tags"],
      categories: map["categories"],
      uploadDate: tryParseFromUnixTime(map["uploadDate"]),
      ratingsPositiveTotal: map["ratingsPositiveTotal"],
      ratingsNegativeTotal: map["ratingsNegativeTotal"],
      ratingsTotal: map["ratingsTotal"],
      virtualReality: map["virtualReality"],
      chapters: map["chapters"],
      rawHtml: map["rawHtml"],
      scrapeFailMessage: map["scrapeFailMessage"],
    });
  }
}

class UniversalAuthorPage {
  constructor(opts = {}) {
    this.iD = opts.iD;
    this.name = opts.name;
    this.avatar = opts.avatar ?? null;
    this.banner = opts.banner ?? null;
    this.aliases = opts.aliases ?? null;
    this.description = opts.description ?? null;
    this.advancedDescription = opts.advancedDescription ?? null;
    this.externalLinks = opts.externalLinks ?? null; // { [label: string]: string }
    this.viewsTotal = opts.viewsTotal ?? null;
    this.videosTotal = opts.videosTotal ?? null;
    this.subscribers = opts.subscribers ?? null;
    this.rank = opts.rank ?? null;
    this.rawHtml = opts.rawHtml;
    this.scrapeFailMessage = opts.scrapeFailMessage ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "name": this.name,
      "plugin": pluginCodeName,
      "avatar": this.avatar,
      "banner": this.banner,
      "aliases": this.aliases,
      "description": this.description,
      "advancedDescription": this.advancedDescription,
      "externalLinks": this.externalLinks,
      "viewsTotal": this.viewsTotal,
      "videosTotal": this.videosTotal,
      "subscribers": this.subscribers,
      "rank": this.rank,
      "rawHtml": this.rawHtml,
      "scrapeFailMessage": this.scrapeFailMessage,
    };
  }
  static fromMap(map) {
    return new UniversalAuthorPage({
      iD: map["iD"],
      name: map["name"],
      avatar: map["avatar"],
      banner: map["banner"],
      aliases: map["aliases"],
      description: map["description"],
      advancedDescription: map["advancedDescription"],
      externalLinks: map["externalLinks"],
      viewsTotal: map["viewsTotal"],
      videosTotal: map["videosTotal"],
      subscribers: map["subscribers"],
      rank: map["rank"],
      rawHtml: map["rawHtml"],
      scrapeFailMessage: map["scrapeFailMessage"],
    });
  }
}

class UniversalComment {
  constructor(opts = {}) {
    this.iD = opts.iD;
    this.videoID = opts.videoID;
    this.author = opts.author;
    this.commentBody = opts.commentBody;
    this.hidden = opts.hidden ?? false;
    this.authorID = opts.authorID ?? null;
    this.countryID = opts.countryID ?? null;
    this.orientation = opts.orientation ?? null;
    this.profilePicture = opts.profilePicture ?? null;
    this.ratingsPositiveTotal = opts.ratingsPositiveTotal ?? null;
    this.ratingsNegativeTotal = opts.ratingsNegativeTotal ?? null;
    this.ratingsTotal = opts.ratingsTotal ?? null;
    this.commentDate = opts.commentDate ?? null;
    this.replyComments = opts.replyComments ?? null;
    this.scrapeFailMessage = opts.scrapeFailMessage ?? null;
  }
  toMap() {
    return {
      "iD": this.iD,
      "videoID": this.videoID,
      "author": this.author,
      "commentBody": this.commentBody,
      "hidden": this.hidden,
      "plugin": pluginCodeName,
      "authorID": this.authorID,
      "countryID": this.countryID,
      "orientation": this.orientation,
      "profilePicture": this.profilePicture,
      "ratingsPositiveTotal": this.ratingsPositiveTotal,
      "ratingsNegativeTotal": this.ratingsNegativeTotal,
      "ratingsTotal": this.ratingsTotal,
      "commentDate": convertToUnixTime(this.commentDate),
      "replyComments": this.replyComments == null ?
        null :
        this.replyComments.map((c) => c.toMap()),
      "scrapeFailMessage": this.scrapeFailMessage,
    };
  }
  static fromMap(map) {
    return new UniversalComment({
      iD: map["iD"],
      videoID: map["videoID"],
      author: map["author"],
      commentBody: map["commentBody"],
      hidden: map["hidden"],
      authorID: map["authorID"],
      countryID: map["countryID"],
      orientation: map["orientation"],
      profilePicture: map["profilePicture"],
      ratingsPositiveTotal: map["ratingsPositiveTotal"],
      ratingsNegativeTotal: map["ratingsNegativeTotal"],
      ratingsTotal: map["ratingsTotal"],
      commentDate: tryParseFromUnixTime(map["commentDate"]),
      replyComments: map["replyComments"] == null ?
        null :
        map["replyComments"].map((c) => UniversalComment.fromMap(c)),
      scrapeFailMessage: map["scrapeFailMessage"],
    });
  }
}
