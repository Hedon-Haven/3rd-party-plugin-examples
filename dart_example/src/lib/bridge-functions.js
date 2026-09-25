/// Host bridge functions

// Mirror logs into the host (and also prefixes it correctly)
function consoleLog(level, message) {
  sendMessage("consoleLog", JSON.stringify({
    "level": level,
    "message": message
  }));
}

// Direct web requests are not allowed from the quickjs environment
async function httpRequest(url, headers) {
  const response = await sendMessage("httpRequest", JSON.stringify({
    "url": url,
    "headers": headers
  }));
  return JSON.parse(response);
}

// File access is disabled in the quickjs environment
// Keep in mind that this function is only able to read the plugins own cache files
async function readCacheFile(filePath) {
  const response = await sendMessage("readCacheFile", JSON.stringify({
    "filePath": filePath
  }));
  // Returns Map:
  // {
  //   "status": "failure/success",
  //   "message": "error message/<fileContentsAsBytes>",
  // };
  return JSON.parse(response);
}


// File access is disabled in the quickjs environment
// Keep in mind that this function is only able to write the plugins own cache files
async function writeCacheFile(filePath, contentAsBytes) {
  const response = await sendMessage("writeCacheFile", JSON.stringify({
    "filePath": filePath,
    "contentAsBytes": contentAsBytes
  }));
  // Returns Map:
  // {
  //   "status": "failure/success",
  //   "message": "error message/Contents written to <fullFilePath>",
  // };
  return JSON.parse(response);
}
