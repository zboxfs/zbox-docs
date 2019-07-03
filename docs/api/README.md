# API Overview

The Zbox API is the programming interface to interact with [ZboxFS], which is a
encrypted virtual file system runs within application.

This API currently has of 2 language bindings:

- [Javascript](javascript.md)
- [Rust](rust.md)

To learn how to use this API, please visit [Getting Started](../getting-started)
and [Tutorials](../tutorials).

## URI

Similar to HTTP URL, Zbox `URI` is a string that identifies a particular `Repo`.
Its syntax is as below:

```
zbox://access_key@repo_id[?option=value]
```

`zbox://` is the storage identifier which indicates we're using the Zbox cloud
storage.

`access_key` is a 24-character string token for API access authtication. It
is **not** the key to encrypt/decrypt repo, but still need to be kept safe.

`repo_id` is an unique 14-character string identifier of a `Repo`.

:::tip How to get URI
To get an URI, first sign up at [zbox.io](https://console.zbox.io/signup) and
create a repo. Then goto the repo details page and copy its URI.

If you don't want sign up for now, you can create a temporary test repo on
[zbox.io/try](https://zbox.io/try), it will be valid to use for 48 hours.
:::

URI can include a list of local cache configuration options, which may have
different values depends on underlying storage.

- `cache_type`

  Specify local cache storage type, acceptable values are:

  1. `mem`: Memory based local cache. This is the default value.
  2. `file`: OS file based local cache. Must also set `base` directory (see
      below) when this is specified. This is not available in browser.
  3. `browser`: [IndexedDB] based local cache. Only available in browser.

- `cache_size`

  Specify the maximum size of local cache, in MB. Default is one megabyte.

- `base`

  Specify the OS directory of `file` local cache, can be relative or absolute
  path. Only valid when `cache_type` is `file`.

Some URI Examples:

```js
// 1MB memory based local cache
'zbox://access_key@repo_id'

// 3MB memory based local cache
'zbox://access_key@repo_id?cache_type=mem&cache_size=3mb'

// 1MB file based local cache at './local_cache' directory
'zbox://access_key@repo_id?cache_type=file&base=./local_cache'

// 3MB file based local cache at './local_cache' directory
'zbox://access_key@repo_id?cache_type=file&cache_size=3mb&base=./local_cache'

// 1MB browser based local cache, only valid in browser
'zbox://access_key@repo_id?cache_type=browser'

// 3MB browser based local cache, only valid in browser
'zbox://access_key@repo_id?cache_type=browser&cache_size=3mb'
```

:::warning Local cache size in browser
Do not specify too large `cache_size` value for `browser` local cache, because
browsers have different maximum size limits for [IndexedDB] and also the local
cache is fully loaded in browser's memory when repo is opened. Set it below 5MB
for safe and always test different sizes.
:::

[ZboxFS]: https://zbox.io/fs
[IndexedDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
