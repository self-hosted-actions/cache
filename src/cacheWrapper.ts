import * as core from "@actions/core";
import * as cache from "@actions/cache";
import { DownloadOptions, UploadOptions } from "@actions/cache/lib/options";
import { Inputs } from "./constants";
import { saveLocalCache, restoreLocalCache } from "./utils/localCache";

/**
 * Wrapper for cache.restoreCache that supports local filesystem caching
 * Automatically routes to local cache if local-cache-path is set, otherwise uses remote cache
 */
export async function restoreCacheWrapper(
    paths: string[],
    primaryKey: string,
    restoreKeys?: string[],
    options?: DownloadOptions,
    enableCrossOsArchive?: boolean
): Promise<string | undefined> {
    const localCachePath = core.getInput(Inputs.LocalCachePath);

    if (localCachePath) {
        // Local cache mode
        core.info("Using local filesystem cache");
        const lookupOnly = options?.lookupOnly || false;
        return await restoreLocalCache(
            paths,
            primaryKey,
            restoreKeys,
            localCachePath,
            lookupOnly
        );
    } else {
        // Remote cache mode (original behavior)
        return await cache.restoreCache(
            paths,
            primaryKey,
            restoreKeys,
            options,
            enableCrossOsArchive
        );
    }
}

/**
 * Wrapper for cache.saveCache that supports local filesystem caching
 * Automatically routes to local cache if local-cache-path is set, otherwise uses remote cache
 */
export async function saveCacheWrapper(
    paths: string[],
    key: string,
    options?: UploadOptions,
    enableCrossOsArchive?: boolean
): Promise<number> {
    const localCachePath = core.getInput(Inputs.LocalCachePath);

    if (localCachePath) {
        // Local cache mode
        core.info("Using local filesystem cache");
        await saveLocalCache(paths, key, localCachePath);
        // Return 0 as a dummy cache ID (local cache doesn't have IDs)
        return 0;
    } else {
        // Remote cache mode (original behavior)
        return await cache.saveCache(
            paths,
            key,
            options,
            enableCrossOsArchive
        );
    }
}
