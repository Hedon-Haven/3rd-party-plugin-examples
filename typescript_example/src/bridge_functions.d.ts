// Types for the host bridge functions in bridge_functions.js and the other globals of the QuickJS host
// Declarations only, nothing in here ends up in the bundle

declare function setTimeout(handler: (...args: any[]) => void, ms?: number): number;
declare class URL {
  constructor(url: string);
  readonly pathname: string;
  readonly searchParams: { entries(): IterableIterator<[string, string]> };
}

type LogLevel = "trace" | "debug" | "info" | "warning" | "error" | "fatal";

type CacheResult<T> =
  | { status: "success"; message: T }
  | { status: "failure"; message: string };

declare function consoleLog(level: LogLevel, message: string): void;

declare function httpRequest(
  url: string,
  headers?: Record<string, string> | null,
): Promise<HttpResponseMap>;

// On success, message contains the file contents as bytes
declare function readCacheFile(filePath: string): Promise<CacheResult<number[]>>;

declare function writeCacheFile(
  filePath: string,
  contentAsBytes: number[],
): Promise<CacheResult<string>>;
