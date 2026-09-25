// JS mirror of wrapper.dart. Only translates Universal* values
// across the JS boundary: fromMap() on the way in, toMap() on the way out.

// Capture local references first because assigning to globalThis.X would
// otherwise shadow the top-level function declaration of the same name.
const _parseExternalLink = parseExternalLink;
const _getHomePage = getHomePage;
const _getSearchResults = getSearchResults;
const _getVideoMetadata = getVideoMetadata;
const _getComments = getComments;
const _getVideoSuggestions = getVideoSuggestions;
const _getAuthorPage = getAuthorPage;
const _getAuthorVideos = getAuthorVideos;

globalThis.parseExternalLink = async (uri) =>
  (await _parseExternalLink(uri))
  .toMap();

globalThis.getHomePage = async (page) =>
  (await _getHomePage(page))
  .map((e) => e.toMap());

globalThis.getSearchResults = async (req, page) =>
  (await _getSearchResults(UniversalSearchRequest.fromMap(req), page))
  .map((e) => e.toMap());

globalThis.getVideoMetadata = async (id, uvp) =>
  (await _getVideoMetadata(id, UniversalVideoPreview.fromMap(uvp)))
  .toMap();

globalThis.getComments = async (vid, raw, page) =>
  (await _getComments(vid, raw, page))
  .map((e) => e.toMap());

globalThis.getVideoSuggestions = async (vid, raw, page) =>
  (await _getVideoSuggestions(vid, raw, page))
  .map((e) => e.toMap());

globalThis.getAuthorPage = async (id) =>
  (await _getAuthorPage(id))
  .toMap();

globalThis.getAuthorVideos = async (id, page) =>
  (await _getAuthorVideos(id, page))
  .map((e) => e.toMap());
