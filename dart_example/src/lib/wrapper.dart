import "dart:js_interop";
import "dart:js_interop_unsafe";

import "main.dart";

// Mimic native dart Response class
extension type HttpResponse(JSObject _) implements JSObject {
  external int get status;

  external String get body;
}

// Call functions from bridge-functions.js
Future<HttpResponse> httpRequest(String url) async {
  final result =
      await (globalContext.callMethodVarArgs("httpRequest".toJS, [url.toJS])
              as JSPromise)
          .toDart;
  return HttpResponse(result as JSObject);
}

Future<void> writeCacheFile(String filePath, String base64) async {
  await (globalContext.callMethodVarArgs("writeCacheFile".toJS, [
            filePath.toJS,
            base64.toJS,
          ])
          as JSPromise)
      .toDart;
}

Future<String> readCacheFile(String filePath) async {
  final result =
      await (globalContext.callMethodVarArgs("readCacheFile".toJS, [
                filePath.toJS,
              ])
              as JSPromise)
          .toDart;
  return (result as JSString).toDart;
}

void consoleLog(String level, String message) => globalContext
    .callMethodVarArgs("consoleLog".toJS, [level.toJS, message.toJS]);

void main() {
  // Shim missing browser globals for QuickJS compatibility
  globalContext["self"] = globalContext;
  globalContext["window"] = globalContext;
  globalContext["document"] = JSObject();

  // Bring dart functions into context and handle converting to and from JS
  globalContext["init"] = (() => init().then((r) => r.toJS).toJS).toJS;
  globalContext["runFunctionalityTest"] =
      (() => runFunctionalityTest().then((r) => r.toJS).toJS).toJS;
  globalContext["parseExternalLink"] = ((JSString uri) => parseExternalLink(
    uri.toDart,
  ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getHomePage"] = ((JSNumber page) => getHomePage(
    page.toDartDouble.toInt(),
  ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["downloadThumbnail"] = ((JSString uri) => downloadThumbnail(
    uri.toDart,
  ).then((r) => r.toJS).toJS).toJS;
  globalContext["getSearchSuggestions"] = ((JSString s) => getSearchSuggestions(
    s.toDart,
  ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getSearchResults"] =
      ((JSAny? req, JSNumber page) => getSearchResults(
        (req.dartify() as Map<Object?, Object?>?)?.cast<String, dynamic>() ??
            <String, dynamic>{},
        page.toDartDouble.toInt(),
      ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getVideoUriFromID"] = ((JSString id) => getVideoUriFromID(
    id.toDart,
  ).toJS).toJS;
  globalContext["getVideoMetadata"] =
      ((JSString id, JSAny? uvp) => getVideoMetadata(
        id.toDart,
        uvp.dartify(),
      ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getProgressThumbnails"] =
      ((JSString id, JSAny? raw) => getProgressThumbnails(
        id.toDart,
        raw.dartify(),
      ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["cancelGetProgressThumbnails"] =
      (() => cancelGetProgressThumbnails()).toJS;
  globalContext["getCommentUriFromID"] =
      ((JSString cid, JSString vid) => getCommentUriFromID(
        cid.toDart,
        vid.toDart,
      ).toJS).toJS;
  globalContext["getComments"] =
      ((JSString vid, JSAny? raw, JSNumber page) => getComments(
        vid.toDart,
        raw.dartify(),
        page.toDartDouble.toInt(),
      ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getVideoSuggestions"] =
      ((JSString vid, JSAny? raw, JSNumber page) => getVideoSuggestions(
        vid.toDart,
        raw.dartify(),
        page.toDartDouble.toInt(),
      ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getAuthorUriFromID"] = ((JSString id) => getAuthorUriFromID(
    id.toDart,
  ).toJS).toJS;
  globalContext["getAuthorPage"] = ((JSString id) => getAuthorPage(
    id.toDart,
  ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getAuthorVideos"] =
      ((JSString id, JSNumber page) => getAuthorVideos(
        id.toDart,
        page.toDartDouble.toInt(),
      ).then((r) => r.jsify()!).toJS).toJS;
}
