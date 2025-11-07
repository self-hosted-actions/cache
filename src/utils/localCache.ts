import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as path from "path";
import * as fs from "fs";

/**
 * Save cache to local filesystem using tar.gz compression
 * @param paths - Paths to cache
 * @param key - Cache key
 * @param localCachePath - Base directory for local cache storage
 * @returns Cache file path
 */
export async function saveLocalCache(
    paths: string[],
    key: string,
    localCachePath: string
): Promise<string> {
    core.info(`Saving cache to local path: ${localCachePath}`);

    // Create cache directory if it doesn't exist
    await io.mkdirP(localCachePath);

    // Sanitize key for use as filename (replace unsafe characters)
    const sanitizedKey = key.replace(/[^a-zA-Z0-9-_]/g, "_");
    const cacheFilePath = path.join(localCachePath, `${sanitizedKey}.tar.gz`);

    core.info(`Creating cache archive: ${cacheFilePath}`);

    // Create tar.gz archive
    // Note: We use absolute paths for the source files but store them with relative paths
    const tarArgs = ["-czf", cacheFilePath];

    for (const cachePath of paths) {
        // Add each path to the archive
        tarArgs.push(cachePath);
    }

    await exec.exec("tar", tarArgs, {
        cwd: process.cwd()
    });

    const stats = fs.statSync(cacheFilePath);
    core.info(`Cache saved successfully. Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

    return cacheFilePath;
}

/**
 * Restore cache from local filesystem
 * @param paths - Paths to restore (for validation, not used in restore)
 * @param primaryKey - Primary cache key
 * @param restoreKeys - Fallback keys for prefix matching
 * @param localCachePath - Base directory for local cache storage
 * @param lookupOnly - If true, only check existence without extracting
 * @returns Matched cache key if found, undefined otherwise
 */
export async function restoreLocalCache(
    paths: string[],
    primaryKey: string,
    restoreKeys: string[] | undefined,
    localCachePath: string,
    lookupOnly: boolean
): Promise<string | undefined> {
    core.info(`Restoring cache from local path: ${localCachePath}`);

    // Check if cache directory exists
    if (!fs.existsSync(localCachePath)) {
        core.info("Local cache directory does not exist");
        return undefined;
    }

    // Try exact match first
    const sanitizedPrimaryKey = primaryKey.replace(/[^a-zA-Z0-9-_]/g, "_");
    const primaryCacheFile = path.join(localCachePath, `${sanitizedPrimaryKey}.tar.gz`);

    if (fs.existsSync(primaryCacheFile)) {
        core.info(`Cache hit on primary key: ${primaryKey}`);

        if (!lookupOnly) {
            await extractTarGz(primaryCacheFile);
        } else {
            core.info(`Cache found and can be restored from key: ${primaryKey}`);
        }

        return primaryKey;
    }

    // Try restore keys with prefix matching
    if (restoreKeys && restoreKeys.length > 0) {
        core.info("No exact match found, trying restore keys with prefix matching");

        const cacheFiles = fs.readdirSync(localCachePath)
            .filter(file => file.endsWith(".tar.gz"));

        for (const restoreKey of restoreKeys) {
            const sanitizedRestoreKey = restoreKey.replace(/[^a-zA-Z0-9-_]/g, "_");

            // Find files that match the prefix
            const matchedFile = cacheFiles.find(file =>
                file.startsWith(sanitizedRestoreKey)
            );

            if (matchedFile) {
                const matchedCacheFile = path.join(localCachePath, matchedFile);
                // Extract original key from filename
                const matchedKey = matchedFile.replace(".tar.gz", "").replace(/_/g, "-");

                core.info(`Cache hit on restore key: ${restoreKey} (matched: ${matchedKey})`);

                if (!lookupOnly) {
                    await extractTarGz(matchedCacheFile);
                } else {
                    core.info(`Cache found and can be restored from key: ${matchedKey}`);
                }

                return matchedKey;
            }
        }
    }

    core.info("Cache not found in local storage");
    return undefined;
}

/**
 * Extract tar.gz archive to current working directory
 * @param tarFilePath - Path to tar.gz file
 */
async function extractTarGz(tarFilePath: string): Promise<void> {
    core.info(`Extracting cache from: ${tarFilePath}`);

    await exec.exec("tar", ["-xzf", tarFilePath], {
        cwd: process.cwd()
    });

    core.info("Cache extracted successfully");
}
