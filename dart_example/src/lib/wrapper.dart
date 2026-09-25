import "dart:js_interop";
import "dart:js_interop_unsafe";

import "main.dart";
import "universal_formats.dart";

extension type JsHttpResponse(JSObject _) implements JSObject {
  external int get statusCode;

  external JSUint8Array get bodyBytes;

  external String get body;

  external JSObject get headers;
}

// Call functions from bridge-functions.js
Future<HttpResponse> httpRequest(
  String url, [
  Map<String, String> headers = const {},
]) async {
  final result =
      await (globalContext.callMethodVarArgs("httpRequest".toJS, [
                url.toJS,
                headers.jsify(),
              ])
              as JSPromise)
          .toDart;
  final jsResponse = JsHttpResponse(result as JSObject);
  return HttpResponse(
    statusCode: jsResponse.statusCode,
    bodyBytes: jsResponse.bodyBytes.toDart,
    body: jsResponse.body,
    headers: (jsResponse.headers.dartify() as Map).cast<String, String>(),
  );
}

Future<void> writeCacheFile(String filePath, List<int> contentAsBytes) async {
  await (globalContext.callMethodVarArgs("writeCacheFile".toJS, [
            filePath.toJS,
            contentAsBytes.map((e) => e.toJS).toList().toJS,
          ])
          as JSPromise)
      .toDart;
}

Future<Map<String, dynamic>> readCacheFile(String filePath) async {
  final result =
      await (globalContext.callMethodVarArgs("readCacheFile".toJS, [
                filePath.toJS,
              ])
              as JSPromise)
          .toDart;
  return Map<String, dynamic>.from((result as JSObject).dartify() as Map);
}

void consoleLog(String level, String message) => globalContext
    .callMethodVarArgs("consoleLog".toJS, [level.toJS, message.toJS]);

void main() {
  // Shim missing browser globals for QuickJS compatibility
  globalContext["self"] = globalContext;
  globalContext["window"] = globalContext;
  globalContext["document"] = JSObject();

  // Bring dart functions into context and handle converting to and from JS.
  // Every Universal* value crossing this boundary is converted right here:
  // fromMap() on the way in, toMap() on the way out. main.dart never touches
  // a Map for anything that has a Universal* type.
  globalContext["init"] = (() => init().toJS).toJS;
  globalContext["runFunctionalityTest"] =
      (() => runFunctionalityTest().then((r) => r.toJS).toJS).toJS;
  globalContext["parseExternalLink"] = ((JSString uri) => parseExternalLink(
    uri.toDart,
  ).then((r) => r.toMap().jsify()!).toJS).toJS;
  globalContext["getHomePage"] = ((JSNumber page) => getHomePage(
    page.toDartDouble.toInt(),
  ).then((r) => r.map((e) => e.toMap()).toList().jsify()!).toJS).toJS;
  globalContext["downloadThumbnail"] =
      ((JSString uri, JSAny? headers) => downloadThumbnail(
        uri.toDart,
        (headers?.dartify() as Map<Object?, Object?>?)
                ?.cast<String, String>() ??
            const {},
      ).then((r) => r.toJS).toJS).toJS;
  globalContext["getSearchSuggestions"] = ((JSString s) => getSearchSuggestions(
    s.toDart,
  ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["getSearchResults"] =
      ((JSAny? req, JSNumber page) => getSearchResults(
        UniversalSearchRequest.fromMap(
          Map<String, dynamic>.from(req.dartify() as Map),
        ),
        page.toDartDouble.toInt(),
      ).then((r) => r.map((e) => e.toMap()).toList().jsify()!).toJS).toJS;
  globalContext["getVideoUriFromID"] = ((JSString id) => getVideoUriFromID(
    id.toDart,
  ).toJS).toJS;
  globalContext["getVideoMetadata"] =
      ((JSString id, JSAny? uvp) => getVideoMetadata(
        id.toDart,
        UniversalVideoPreview.fromMap(
          Map<String, dynamic>.from(uvp.dartify() as Map),
        ),
      ).then((r) => r.toMap().jsify()!).toJS).toJS;
  globalContext["getProgressThumbnails"] =
      ((JSString id, JSString raw) => getProgressThumbnails(
        id.toDart,
        raw.toDart,
      ).then((r) => r.jsify()!).toJS).toJS;
  globalContext["cancelGetProgressThumbnails"] =
      (() => cancelGetProgressThumbnails()).toJS;
  globalContext["getCommentUriFromID"] =
      ((JSString cid, JSString vid) => getCommentUriFromID(
        cid.toDart,
        vid.toDart,
      ).toJS).toJS;
  globalContext["getComments"] =
      ((JSString vid, JSString raw, JSNumber page) => getComments(
        vid.toDart,
        raw.toDart,
        page.toDartDouble.toInt(),
      ).then((r) => r.map((e) => e.toMap()).toList().jsify()!).toJS).toJS;
  globalContext["getVideoSuggestions"] =
      ((JSString vid, JSString raw, JSNumber page) => getVideoSuggestions(
        vid.toDart,
        raw.toDart,
        page.toDartDouble.toInt(),
      ).then((r) => r.map((e) => e.toMap()).toList().jsify()!).toJS).toJS;
  globalContext["getAuthorUriFromID"] = ((JSString id) => getAuthorUriFromID(
    id.toDart,
  ).toJS).toJS;
  globalContext["getAuthorPage"] = ((JSString id) => getAuthorPage(
    id.toDart,
  ).then((r) => r.toMap().jsify()!).toJS).toJS;
  globalContext["getAuthorVideos"] =
      ((JSString id, JSNumber page) => getAuthorVideos(
        id.toDart,
        page.toDartDouble.toInt(),
      ).then((r) => r.map((e) => e.toMap()).toList().jsify()!).toJS).toJS;
}
