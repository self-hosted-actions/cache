# Local Cache for Self-Hosted Runners

This action extends [actions/cache](https://github.com/actions/cache) with local filesystem cache support for self-hosted runners using PVC/NFS storage.

[![Tests](https://github.com/self-hosted-actions/cache/actions/workflows/workflow.yml/badge.svg)](https://github.com/self-hosted-actions/cache/actions/workflows/workflow.yml)

## What's New

### Local Filesystem Cache Support

- 🎉 **Local cache support** for self-hosted runners with PVC/NFS storage
- **Simple activation** via `local-cache-path` parameter
- **Fully backward compatible** with the original `actions/cache`
- **Optimized for network filesystems** using tar.gz compression

When `local-cache-path` is not specified, this action works exactly like the original `actions/cache`, using GitHub's remote cache service.

## Usage

### Local Cache (Self-Hosted Runners)

Use local filesystem cache instead of GitHub's remote cache service:

```yaml
- uses: self-hosted-actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    local-cache-path: /mnt/cache  # Path to PVC/NFS mount
```

### Remote Cache (Default Behavior)

Without `local-cache-path`, works exactly like `actions/cache`:

```yaml
- uses: self-hosted-actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## Inputs

All inputs from [actions/cache](https://github.com/actions/cache#inputs) are supported, plus:

* `local-cache-path` - Local directory path for caching. When set, uses local filesystem cache instead of remote cache. **Optional**

## Outputs

Same as [actions/cache](https://github.com/actions/cache#outputs):

* `cache-hit` - A boolean value to indicate an exact match was found for the key

## How It Works

### Local Cache Mode

When `local-cache-path` is specified:

1. Cache files are stored as `{local-cache-path}/{key}.tar.gz`
2. Uses tar.gz compression for network filesystem efficiency
3. Supports exact key matching and prefix-based restore keys
4. No data sent to GitHub's cache service

### Remote Cache Mode

When `local-cache-path` is not specified:

- Works exactly like the original `actions/cache`
- Uses GitHub's cache service
- See [actions/cache documentation](https://github.com/actions/cache) for details

## Complete Documentation

For all other features, configurations, and best practices, refer to the original [actions/cache](https://github.com/actions/cache) documentation:

- [Creating a cache key](https://github.com/actions/cache#creating-a-cache-key)
- [Cache Limits](https://github.com/actions/cache#cache-limits)
- [Implementation Examples](https://github.com/actions/cache#implementation-examples)
- [Caching Strategies](https://github.com/actions/cache/blob/main/caching-strategies.md)
- [Tips and Workarounds](https://github.com/actions/cache/blob/main/tips-and-workarounds.md)

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
