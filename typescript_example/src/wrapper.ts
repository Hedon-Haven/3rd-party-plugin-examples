// TS mirror of wrapper.dart. Registers all plugin functions as globals for the host.
// Only translates Universal* values across the JS boundary:
// fromMap() on the way in, toMap() on the way out.

// Every function the host calls. main.ts must implement all of them
interface PluginApi {
  init(): Promise<void>;
  parseExternalLink(uriString: string): Promise<ExternalLinkParsed>;
  getHomePage(page: number): Promise<UniversalVideoPreview[]>;
  downloadThumbnail(uri: string, thumbnailHttpHeaders: Record<string, string> | null): Promise<Uint8Array>;
  getSearchSuggestions(searchString: string): Promise<string[]>;
  getSearchResults(request: UniversalSearchRequest, page: number): Promise<UniversalVideoPreview[]>;
  getVideoUriFromID(videoID: string): Promise<string | null>;
  getVideoMetadata(videoID: string, uvp: UniversalVideoPreview): Promise<UniversalVideoMetadata>;
  getProgressThumbnails(videoID: string, rawHtml: string): Promise<Uint8Array[] | null>;
  getCommentUriFromID(commentID: string, videoID: string): Promise<string | null>;
  getComments(videoID: string, rawHtml: string, page: number): Promise<UniversalComment[]>;
  getVideoSuggestions(videoID: string, rawHtml: string, page: number): Promise<UniversalVideoPreview[]>;
  getAuthorUriFromID(authorID: string): Promise<string | null>;
  getAuthorPage(authorID: string): Promise<UniversalAuthorPage>;
  getAuthorVideos(authorID: string, rawHtml: string, page: number): Promise<UniversalVideoPreview[]>;
}

Object.assign(globalThis, {
  init: plugin.init,
  parseExternalLink: async (uri: string) => (await plugin.parseExternalLink(uri)).toMap(),
  getHomePage: async (page: number) => (await plugin.getHomePage(page)).map((e) => e.toMap()),
  downloadThumbnail: plugin.downloadThumbnail,
  getSearchSuggestions: plugin.getSearchSuggestions,
  getSearchResults: async (req: UniversalSearchRequestMap, page: number) =>
    (await plugin.getSearchResults(UniversalSearchRequest.fromMap(req), page)).map((e) => e.toMap()),
  getVideoUriFromID: plugin.getVideoUriFromID,
  getVideoMetadata: async (id: string, uvp: UniversalVideoPreviewMap) =>
    (await plugin.getVideoMetadata(id, UniversalVideoPreview.fromMap(uvp))).toMap(),
  // Uint8Array would arrive in the host as a map instead of a list
  getProgressThumbnails: async (id: string, raw: string) =>
    (await plugin.getProgressThumbnails(id, raw))?.map((e) => Array.from(e)),
  getCommentUriFromID: plugin.getCommentUriFromID,
  getComments: async (vid: string, raw: string, page: number) =>
    (await plugin.getComments(vid, raw, page)).map((e) => e.toMap()),
  getVideoSuggestions: async (vid: string, raw: string, page: number) =>
    (await plugin.getVideoSuggestions(vid, raw, page)).map((e) => e.toMap()),
  getAuthorUriFromID: plugin.getAuthorUriFromID,
  getAuthorPage: async (id: string) => (await plugin.getAuthorPage(id)).toMap(),
  getAuthorVideos: async (id: string, raw: string, page: number) =>
    (await plugin.getAuthorVideos(id, raw, page)).map((e) => e.toMap()),
} satisfies Record<keyof PluginApi, unknown>);
