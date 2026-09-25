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
  globalContext["init"] = (() => _asJsPromise(() => init())).toJS;
  globalContext["runFunctionalityTest"] = (() => _asJsPromise(
    () => runFunctionalityTest().then((r) => r.toJS),
  )).toJS;
  globalContext["parseExternalLink"] = ((JSString uri) => _asJsPromise(
    () => parseExternalLink(uri.toDart).then((r) => r.toMap().jsify()!),
  )).toJS;
  globalContext["getHomePage"] = ((JSNumber page) => _asJsPromise(
    () => getHomePage(
      page.toDartDouble.toInt(),
    ).then((r) => r.map((e) => e.toMap()).toList().jsify()!),
  )).toJS;
  globalContext["downloadThumbnail"] =
      ((JSString uri, JSAny? headers) => _asJsPromise(
        () => downloadThumbnail(
          uri.toDart,
          (headers?.dartify() as Map<Object?, Object?>?)
                  ?.cast<String, String>() ??
              const {},
        ).then((r) => r.toJS),
      )).toJS;
  globalContext["getSearchSuggestions"] = ((JSString s) => _asJsPromise(
    () => getSearchSuggestions(s.toDart).then((r) => r.jsify()!),
  )).toJS;
  globalContext["getSearchResults"] =
      ((JSAny? req, JSNumber page) => _asJsPromise(
        () => getSearchResults(
          UniversalSearchRequest.fromMap(
            Map<String, dynamic>.from(req.dartify() as Map),
          ),
          page.toDartDouble.toInt(),
        ).then((r) => r.map((e) => e.toMap()).toList().jsify()!),
      )).toJS;
  globalContext["getVideoUriFromID"] = ((JSString id) => _asJsPromise(
    () => Future.value(getVideoUriFromID(id.toDart).toJS),
  )).toJS;
  globalContext["getVideoMetadata"] =
      ((JSString id, JSAny? uvp) => _asJsPromise(
        () => getVideoMetadata(
          id.toDart,
          UniversalVideoPreview.fromMap(
            Map<String, dynamic>.from(uvp.dartify() as Map),
          ),
        ).then((r) => r.toMap().jsify()!),
      )).toJS;
  globalContext["getProgressThumbnails"] =
      ((JSString id, JSString raw) => _asJsPromise(
        () => getProgressThumbnails(
          id.toDart,
          raw.toDart,
        ).then((r) => r.jsify()!),
      )).toJS;
  //globalContext["cancelGetProgressThumbnails"] = (() => _asJsPromise(
  //  () => Future.value(cancelGetProgressThumbnails()),
  //)).toJS;
  globalContext["getCommentUriFromID"] =
      ((JSString cid, JSString vid) => _asJsPromise(
        () => Future.value(getCommentUriFromID(cid.toDart, vid.toDart).toJS),
      )).toJS;
  globalContext["getComments"] =
      ((JSString vid, JSString raw, JSNumber page) => _asJsPromise(
        () => getComments(
          vid.toDart,
          raw.toDart,
          page.toDartDouble.toInt(),
        ).then((r) => r.map((e) => e.toMap()).toList().jsify()!),
      )).toJS;
  globalContext["getVideoSuggestions"] =
      ((JSString vid, JSString raw, JSNumber page) => _asJsPromise(
        () => getVideoSuggestions(
          vid.toDart,
          raw.toDart,
          page.toDartDouble.toInt(),
        ).then((r) => r.map((e) => e.toMap()).toList().jsify()!),
      )).toJS;
  globalContext["getAuthorUriFromID"] = ((JSString id) => _asJsPromise(
    () => Future.value(getAuthorUriFromID(id.toDart).toJS),
  )).toJS;
  globalContext["getAuthorPage"] = ((JSString id) => _asJsPromise(
    () => getAuthorPage(id.toDart).then((r) => r.toMap().jsify()!),
  )).toJS;
  globalContext["getAuthorVideos"] =
      ((JSString id, JSNumber page) => _asJsPromise(
        () => getAuthorVideos(
          id.toDart,
          page.toDartDouble.toInt(),
        ).then((r) => r.map((e) => e.toMap()).toList().jsify()!),
      )).toJS;
}

// Helper function that makes sure failed dart futures are directly surfaced
JSPromise _asJsPromise(Future Function() fn) {
  return Future(() async {
    try {
      return await fn();
    } catch (e, st) {
      final ctor = globalContext["Error"] as JSFunction;
      throw ctor.callAsConstructor<JSObject>("$e\n$st".toJS);
    }
  }).toJS;
}
