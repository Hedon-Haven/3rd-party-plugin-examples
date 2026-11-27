// Trimmed/slightly simplified TS mirror of universal_formats.dart from the main Hedon Haven repo

// Constructor options of a class: all fields are optional, except the ones listed in R
type DataOf<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };
type Options<T, R extends keyof DataOf<T> = never> = Pick<DataOf<T>, R> & Partial<DataOf<T>>;

type ContentType = "homePage" | "searchResultsPage" | "videoPage" | "authorPage" | "unknown";

interface Actor {
  name: string;
  authorID: string;
  avatar: string | null;
}

// The Map interfaces below describe the format in which values cross the host boundary

interface ScrapingExceptionMap {
  message: string;
  isCritical: boolean;
}

class ScrapingException {
  constructor(
    readonly message = "unknown scraping exception",
    readonly isCritical = false,
  ) {}

  toMap(): ScrapingExceptionMap {
    return { message: this.message, isCritical: this.isCritical };
  }

  static fromMap(map: ScrapingExceptionMap): ScrapingException {
    return new ScrapingException(map.message, map.isCritical === true);
  }
}

// Returns a critical ScrapingException naming every null or empty value
function criticalFieldsMissing(
  fields: Record<string, string | null | undefined>,
): ScrapingException | null {
  const missing = Object.keys(fields).filter((key) => fields[key] == null || fields[key] === "");
  if (missing.length === 0) return null;
  return new ScrapingException(`Failed to scrape critical variable(s): ${missing.join(", ")}`, true);
}

function tryParseFromUnixTime(unixTimeInSeconds: number | null | undefined): Date | null {
  if (unixTimeInSeconds == null) return null;
  return new Date(unixTimeInSeconds * 1000);
}

function convertToUnixTime(dateTime: Date | null | undefined): number | null {
  if (dateTime == null) return null;
  return Math.floor(dateTime.getTime() / 1000);
}

interface HttpResponseMap {
  statusCode: number;
  bodyBytes: number[];
  body: string;
  headers: Record<string, string>;
}

class HttpResponse {
  readonly statusCode: number;
  readonly bodyBytes: Uint8Array;
  readonly body: string;
  readonly headers: Record<string, string>;

  constructor(opts: DataOf<HttpResponse>) {
    this.statusCode = opts.statusCode;
    this.bodyBytes = opts.bodyBytes;
    this.body = opts.body;
    this.headers = opts.headers;
  }

  toMap(): HttpResponseMap {
    return {
      statusCode: this.statusCode,
      bodyBytes: Array.from(this.bodyBytes),
      body: this.body,
      headers: this.headers,
    };
  }

  static fromMap(map: HttpResponseMap): HttpResponse {
    return new HttpResponse({
      statusCode: map.statusCode,
      bodyBytes: Uint8Array.from(map.bodyBytes),
      body: map.body,
      headers: map.headers,
    });
  }
}

interface ExternalLinkParsedMap {
  type: ContentType;
  iD: string | null;
  searchRequest: UniversalSearchRequestMap | null;
  pageCount: number | null;
}

class ExternalLinkParsed {
  readonly type: ContentType;
  readonly iD: string | null;
  readonly searchRequest: UniversalSearchRequest | null;
  readonly pageCount: number | null;

  constructor(opts: Options<ExternalLinkParsed, "type">) {
    this.type = opts.type;
    this.iD = opts.iD ?? null;
    this.searchRequest = opts.searchRequest ?? null;
    this.pageCount = opts.pageCount ?? null;
  }

  toMap(): ExternalLinkParsedMap {
    return {
      type: this.type,
      iD: this.iD,
      searchRequest: this.searchRequest?.toMap() ?? null,
      pageCount: this.pageCount,
    };
  }
}

interface UniversalSearchRequestMap {
  searchString: string;
  sortingType: string;
  dateRange: string;
  minQuality: number;
  maxQuality: number;
  minDuration: number;
  maxDuration: number;
  minFramesPerSecond: number;
  maxFramesPerSecond: number;
  virtualReality: boolean;
  categoriesInclude: string[];
  categoriesExclude: string[];
  keywordsInclude: string[];
  keywordsExclude: string[];
  historySearch: boolean;
}

class UniversalSearchRequest {
  readonly searchString: string;
  readonly sortingType: string;
  readonly dateRange: string;
  readonly minQuality: number;
  readonly maxQuality: number;
  readonly minDuration: number;
  readonly maxDuration: number;
  readonly minFramesPerSecond: number;
  readonly maxFramesPerSecond: number;
  readonly virtualReality: boolean;
  readonly categoriesInclude: string[];
  readonly categoriesExclude: string[];
  readonly keywordsInclude: string[];
  readonly keywordsExclude: string[];
  readonly historySearch: boolean;

  constructor(opts: Options<UniversalSearchRequest> = {}) {
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

  toMap(): UniversalSearchRequestMap {
    return {
      searchString: this.searchString,
      sortingType: this.sortingType,
      dateRange: this.dateRange,
      minQuality: this.minQuality,
      maxQuality: this.maxQuality,
      minDuration: this.minDuration,
      maxDuration: this.maxDuration,
      minFramesPerSecond: this.minFramesPerSecond,
      maxFramesPerSecond: this.maxFramesPerSecond,
      virtualReality: this.virtualReality,
      categoriesInclude: this.categoriesInclude,
      categoriesExclude: this.categoriesExclude,
      keywordsInclude: this.keywordsInclude,
      keywordsExclude: this.keywordsExclude,
      historySearch: this.historySearch,
    };
  }

  static fromMap(map: UniversalSearchRequestMap): UniversalSearchRequest {
    return new UniversalSearchRequest(map);
  }
}

interface UniversalVideoPreviewMap {
  iD: string;
  title: string;
  thumbnail: string | null;
  thumbnailHttpHeaders: Record<string, string> | null;
  thumbnailBinary: number[] | null;
  previewVideo: string | null;
  previewVideoHttpHeaders: Record<string, string> | null;
  duration: number | null;
  viewsTotal: number | null;
  ratingsPositivePercent: number | null;
  maxQuality: number | null;
  virtualReality: boolean;
  authorName: string | null;
  authorID: string | null;
  verifiedAuthor: boolean;
  lastWatched: number | null;
  addedOn: number | null;
  unavailableFields: string[];
  scrapeFailException: ScrapingExceptionMap | null;
}

class UniversalVideoPreview {
  readonly iD: string;
  readonly title: string;
  readonly thumbnail: string | null;
  readonly thumbnailHttpHeaders: Record<string, string> | null;
  readonly thumbnailBinary: Uint8Array;
  readonly previewVideo: string | null; // string form of Uri
  readonly previewVideoHttpHeaders: Record<string, string> | null;
  readonly duration: number | null; // seconds
  readonly viewsTotal: number | null;
  readonly ratingsPositivePercent: number | null;
  readonly maxQuality: number | null;
  readonly virtualReality: boolean;
  readonly authorName: string | null;
  readonly authorID: string | null;
  readonly verifiedAuthor: boolean;
  readonly lastWatched: Date | null;
  readonly addedOn: Date | null;
  readonly unavailableFields: string[];
  scrapeFailException: ScrapingException | null;

  constructor(opts: Options<UniversalVideoPreview, "unavailableFields">) {
    this.iD = opts.iD ?? "";
    this.title = opts.title ?? "";
    this.thumbnail = opts.thumbnail ?? null;
    this.thumbnailHttpHeaders = opts.thumbnailHttpHeaders ?? null;
    this.thumbnailBinary = opts.thumbnailBinary ?? new Uint8Array(0);
    this.previewVideo = opts.previewVideo ?? null;
    this.previewVideoHttpHeaders = opts.previewVideoHttpHeaders ?? null;
    this.duration = opts.duration ?? null;
    this.viewsTotal = opts.viewsTotal ?? null;
    this.ratingsPositivePercent = opts.ratingsPositivePercent ?? null;
    this.maxQuality = opts.maxQuality ?? null;
    this.virtualReality = opts.virtualReality ?? false;
    this.authorName = opts.authorName ?? null;
    this.authorID = opts.authorID ?? null;
    this.verifiedAuthor = opts.verifiedAuthor ?? false;
    this.lastWatched = opts.lastWatched ?? null;
    this.addedOn = opts.addedOn ?? null;
    this.unavailableFields = opts.unavailableFields;
    this.scrapeFailException =
      opts.scrapeFailException ?? criticalFieldsMissing({ iD: opts.iD, title: opts.title });
  }

  toMap(): UniversalVideoPreviewMap {
    return {
      iD: this.iD,
      title: this.title,
      thumbnail: this.thumbnail,
      thumbnailHttpHeaders: this.thumbnailHttpHeaders,
      thumbnailBinary: Array.from(this.thumbnailBinary),
      previewVideo: this.previewVideo,
      previewVideoHttpHeaders: this.previewVideoHttpHeaders,
      duration: this.duration,
      viewsTotal: this.viewsTotal,
      ratingsPositivePercent: this.ratingsPositivePercent,
      maxQuality: this.maxQuality,
      virtualReality: this.virtualReality,
      authorName: this.authorName,
      authorID: this.authorID,
      verifiedAuthor: this.verifiedAuthor,
      lastWatched: convertToUnixTime(this.lastWatched),
      addedOn: convertToUnixTime(this.addedOn),
      unavailableFields: this.unavailableFields,
      scrapeFailException: this.scrapeFailException?.toMap() ?? null,
    };
  }

  static fromMap(map: UniversalVideoPreviewMap): UniversalVideoPreview {
    return new UniversalVideoPreview({
      iD: map.iD,
      title: map.title,
      thumbnail: map.thumbnail,
      thumbnailHttpHeaders: map.thumbnailHttpHeaders,
      thumbnailBinary: map.thumbnailBinary == null ? new Uint8Array(0) : Uint8Array.from(map.thumbnailBinary),
      previewVideo: map.previewVideo,
      previewVideoHttpHeaders: map.previewVideoHttpHeaders,
      duration: map.duration,
      viewsTotal: map.viewsTotal,
      ratingsPositivePercent: map.ratingsPositivePercent,
      maxQuality: map.maxQuality,
      virtualReality: map.virtualReality,
      authorName: map.authorName,
      authorID: map.authorID,
      verifiedAuthor: map.verifiedAuthor,
      lastWatched: tryParseFromUnixTime(map.lastWatched),
      addedOn: tryParseFromUnixTime(map.addedOn),
      unavailableFields: map.unavailableFields,
      scrapeFailException:
        map.scrapeFailException == null ? null : ScrapingException.fromMap(map.scrapeFailException),
    });
  }
}

interface UniversalVideoMetadataMap {
  iD: string;
  m3u8Uris: Record<string, string>;
  playbackHttpHeaders: Record<string, string> | null;
  title: string;
  universalVideoPreview: UniversalVideoPreviewMap;
  authorID: string;
  authorName: string | null;
  authorSubscriberCount: number | null;
  authorAvatar: string | null;
  actors: Actor[] | null;
  description: string | null;
  viewsTotal: number | null;
  tags: string[] | null;
  categories: string[] | null;
  uploadDate: number | null;
  ratingsPositiveTotal: number | null;
  ratingsNegativeTotal: number | null;
  ratingsTotal: number | null;
  virtualReality: boolean;
  chapters: Record<string, string> | null;
  rawHtml: string;
  unavailableFields: string[];
  scrapeFailException: ScrapingExceptionMap | null;
}

class UniversalVideoMetadata {
  readonly iD: string;
  readonly m3u8Uris: Record<number, string>; // { [quality]: uri }
  readonly playbackHttpHeaders: Record<string, string> | null;
  readonly title: string;
  readonly universalVideoPreview: UniversalVideoPreview;
  readonly authorID: string;
  readonly authorName: string | null;
  readonly authorSubscriberCount: number | null;
  readonly authorAvatar: string | null;
  readonly actors: Actor[] | null;
  readonly description: string | null;
  readonly viewsTotal: number | null;
  readonly tags: string[] | null;
  readonly categories: string[] | null;
  readonly uploadDate: Date | null;
  readonly ratingsPositiveTotal: number | null;
  readonly ratingsNegativeTotal: number | null;
  readonly ratingsTotal: number | null;
  readonly virtualReality: boolean;
  readonly chapters: Record<number, string> | null; // { [seconds]: title }
  readonly rawHtml: string;
  readonly unavailableFields: string[]; // names of fields that can't be scraped from the provider
  scrapeFailException: ScrapingException | null;

  constructor(
    opts: Options<
      UniversalVideoMetadata,
      "iD" | "m3u8Uris" | "title" | "universalVideoPreview" | "authorID" | "rawHtml" | "unavailableFields"
    >,
  ) {
    this.iD = opts.iD;
    this.m3u8Uris = opts.m3u8Uris;
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
    this.chapters = opts.chapters ?? null;
    this.rawHtml = opts.rawHtml;
    this.unavailableFields = opts.unavailableFields;
    this.scrapeFailException = opts.scrapeFailException ?? null;
  }

  toMap(): UniversalVideoMetadataMap {
    return {
      iD: this.iD,
      m3u8Uris: this.m3u8Uris,
      playbackHttpHeaders: this.playbackHttpHeaders,
      title: this.title,
      universalVideoPreview: this.universalVideoPreview.toMap(),
      authorID: this.authorID,
      authorName: this.authorName,
      authorSubscriberCount: this.authorSubscriberCount,
      authorAvatar: this.authorAvatar,
      actors: this.actors?.map((e) => ({ name: e.name, authorID: e.authorID, avatar: e.avatar })) ?? null,
      description: this.description,
      viewsTotal: this.viewsTotal,
      tags: this.tags,
      categories: this.categories,
      uploadDate: convertToUnixTime(this.uploadDate),
      ratingsPositiveTotal: this.ratingsPositiveTotal,
      ratingsNegativeTotal: this.ratingsNegativeTotal,
      ratingsTotal: this.ratingsTotal,
      virtualReality: this.virtualReality,
      chapters: this.chapters,
      rawHtml: this.rawHtml,
      unavailableFields: this.unavailableFields,
      scrapeFailException: this.scrapeFailException?.toMap() ?? null,
    };
  }

  static fromMap(map: UniversalVideoMetadataMap): UniversalVideoMetadata {
    return new UniversalVideoMetadata({
      iD: map.iD,
      m3u8Uris: map.m3u8Uris,
      playbackHttpHeaders: map.playbackHttpHeaders,
      title: map.title,
      universalVideoPreview: UniversalVideoPreview.fromMap(map.universalVideoPreview),
      authorID: map.authorID,
      authorName: map.authorName,
      authorSubscriberCount: map.authorSubscriberCount,
      authorAvatar: map.authorAvatar,
      actors: map.actors,
      description: map.description,
      viewsTotal: map.viewsTotal,
      tags: map.tags,
      categories: map.categories,
      uploadDate: tryParseFromUnixTime(map.uploadDate),
      ratingsPositiveTotal: map.ratingsPositiveTotal,
      ratingsNegativeTotal: map.ratingsNegativeTotal,
      ratingsTotal: map.ratingsTotal,
      virtualReality: map.virtualReality,
      chapters: map.chapters,
      rawHtml: map.rawHtml,
      unavailableFields: map.unavailableFields,
      scrapeFailException:
        map.scrapeFailException == null ? null : ScrapingException.fromMap(map.scrapeFailException),
    });
  }
}

interface UniversalAuthorPageMap {
  iD: string;
  name: string;
  avatar: string | null;
  banner: string | null;
  aliases: string[] | null;
  description: string | null;
  advancedDescription: Record<string, string> | null;
  externalLinks: Record<string, string> | null;
  viewsTotal: number | null;
  videosTotal: number | null;
  subscribers: number | null;
  rank: number | null;
  rawHtml: string;
  unavailableFields: string[];
  scrapeFailException: ScrapingExceptionMap | null;
}

class UniversalAuthorPage {
  readonly iD: string;
  readonly name: string;
  readonly avatar: string | null;
  readonly banner: string | null;
  readonly aliases: string[] | null;
  readonly description: string | null;
  readonly advancedDescription: Record<string, string> | null;
  readonly externalLinks: Record<string, string> | null; // { [label]: uri }
  readonly viewsTotal: number | null;
  readonly videosTotal: number | null;
  readonly subscribers: number | null;
  readonly rank: number | null;
  readonly rawHtml: string;
  readonly unavailableFields: string[]; // names of fields that can't be scraped from the provider
  scrapeFailException: ScrapingException | null;

  constructor(opts: Options<UniversalAuthorPage, "iD" | "name" | "rawHtml" | "unavailableFields">) {
    this.iD = opts.iD;
    this.name = opts.name;
    this.avatar = opts.avatar ?? null;
    this.banner = opts.banner ?? null;
    this.aliases = opts.aliases ?? null;
    this.description = opts.description ?? null;
    this.advancedDescription = opts.advancedDescription ?? null;
    this.externalLinks = opts.externalLinks ?? null;
    this.viewsTotal = opts.viewsTotal ?? null;
    this.videosTotal = opts.videosTotal ?? null;
    this.subscribers = opts.subscribers ?? null;
    this.rank = opts.rank ?? null;
    this.rawHtml = opts.rawHtml;
    this.unavailableFields = opts.unavailableFields;
    this.scrapeFailException = opts.scrapeFailException ?? null;
  }

  toMap(): UniversalAuthorPageMap {
    return {
      iD: this.iD,
      name: this.name,
      avatar: this.avatar,
      banner: this.banner,
      aliases: this.aliases,
      description: this.description,
      advancedDescription: this.advancedDescription,
      externalLinks: this.externalLinks,
      viewsTotal: this.viewsTotal,
      videosTotal: this.videosTotal,
      subscribers: this.subscribers,
      rank: this.rank,
      rawHtml: this.rawHtml,
      unavailableFields: this.unavailableFields,
      scrapeFailException: this.scrapeFailException?.toMap() ?? null,
    };
  }

  static fromMap(map: UniversalAuthorPageMap): UniversalAuthorPage {
    return new UniversalAuthorPage({
      iD: map.iD,
      name: map.name,
      avatar: map.avatar,
      banner: map.banner,
      aliases: map.aliases,
      description: map.description,
      advancedDescription: map.advancedDescription,
      externalLinks: map.externalLinks,
      viewsTotal: map.viewsTotal,
      videosTotal: map.videosTotal,
      subscribers: map.subscribers,
      rank: map.rank,
      rawHtml: map.rawHtml,
      unavailableFields: map.unavailableFields,
      scrapeFailException:
        map.scrapeFailException == null ? null : ScrapingException.fromMap(map.scrapeFailException),
    });
  }
}

interface UniversalCommentMap {
  iD: string;
  videoID: string;
  author: string;
  commentBody: string;
  hidden: boolean;
  authorID: string | null;
  countryID: string | null;
  orientation: string | null;
  profilePicture: string | null;
  ratingsPositiveTotal: number | null;
  ratingsNegativeTotal: number | null;
  ratingsTotal: number | null;
  commentDate: number | null;
  replyComments: UniversalCommentMap[] | null;
  unavailableFields: string[];
  scrapeFailException: ScrapingExceptionMap | null;
}

class UniversalComment {
  readonly iD: string;
  readonly videoID: string;
  readonly author: string;
  readonly commentBody: string;
  readonly hidden: boolean;
  readonly authorID: string | null;
  readonly countryID: string | null; // two letter country code
  readonly orientation: string | null;
  readonly profilePicture: string | null;
  readonly ratingsPositiveTotal: number | null;
  readonly ratingsNegativeTotal: number | null;
  readonly ratingsTotal: number | null;
  readonly commentDate: Date | null;
  replyComments: UniversalComment[] | null;
  readonly unavailableFields: string[]; // names of fields that can't be scraped from the provider
  scrapeFailException: ScrapingException | null;

  constructor(opts: Options<UniversalComment, "videoID" | "unavailableFields">) {
    this.iD = opts.iD ?? "";
    this.videoID = opts.videoID;
    this.author = opts.author ?? "";
    this.commentBody = opts.commentBody ?? "";
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
    this.unavailableFields = opts.unavailableFields;
    this.scrapeFailException =
      opts.scrapeFailException ??
      criticalFieldsMissing({ iD: opts.iD, author: opts.author, commentBody: opts.commentBody });
  }

  toMap(): UniversalCommentMap {
    return {
      iD: this.iD,
      videoID: this.videoID,
      author: this.author,
      commentBody: this.commentBody,
      hidden: this.hidden,
      authorID: this.authorID,
      countryID: this.countryID,
      orientation: this.orientation,
      profilePicture: this.profilePicture,
      ratingsPositiveTotal: this.ratingsPositiveTotal,
      ratingsNegativeTotal: this.ratingsNegativeTotal,
      ratingsTotal: this.ratingsTotal,
      commentDate: convertToUnixTime(this.commentDate),
      replyComments: this.replyComments?.map((c) => c.toMap()) ?? null,
      unavailableFields: this.unavailableFields,
      scrapeFailException: this.scrapeFailException?.toMap() ?? null,
    };
  }

  static fromMap(map: UniversalCommentMap): UniversalComment {
    return new UniversalComment({
      iD: map.iD,
      videoID: map.videoID,
      author: map.author,
      commentBody: map.commentBody,
      hidden: map.hidden,
      authorID: map.authorID,
      countryID: map.countryID,
      orientation: map.orientation,
      profilePicture: map.profilePicture,
      ratingsPositiveTotal: map.ratingsPositiveTotal,
      ratingsNegativeTotal: map.ratingsNegativeTotal,
      ratingsTotal: map.ratingsTotal,
      commentDate: tryParseFromUnixTime(map.commentDate),
      replyComments: map.replyComments?.map((c) => UniversalComment.fromMap(c)) ?? null,
      unavailableFields: map.unavailableFields,
      scrapeFailException:
        map.scrapeFailException == null ? null : ScrapingException.fromMap(map.scrapeFailException),
    });
  }
}
