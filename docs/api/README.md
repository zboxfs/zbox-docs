# API Reference

The Zbox API is the programming interface to interact with [ZboxFS], which runs
inside your application to store files securely and privately.

This API currently consists of 2 language bindings:

- [Javascript](javascript)
- [Rust](rust)

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
To get an URI, first sign up at [zbox.io](https://zbox.io) and create a repo.
Then goto the repo details page and copy its URI.

If you just want to have quick try, go to [try.zbox.io](https://try.zbox.io)
and create a temporary test repo, which will be valid for 48 hours.
:::

URI can also include a list of options as below, which may have different
values depends on underlying storage.

- `cache_type`

  Specify local cache storage type, acceptable values are:

  1. `mem`: Memory based local cache. This is the default value.
  2. `file`: OS file based local cache. Must also set `base` directory (see
      below) when this is specified. Not available in browser.
  3. `browser`: [IndexedDB] based local cache. Only available in browser.

- `cache_size`

  Specify the maximum size of local cache, in MB. Default is one megabyte.

- `base`

  Specify the OS directory of `file` local cache, can be relative or absolute
  path. Only valid when `cache_type` is `file`.

Some URI Examples:

```js
// URI with 1MB memory based local cache
'zbox://access_key@repo_id'

// URI with 3MB memory based local cache
'zbox://access_key@repo_id?cache_type=mem&cache_size=3mb'

// URI with 1MB file based local cache at './local_cache' directory
'zbox://access_key@repo_id?cache_type=file&base=./local_cache'

// URI with 3MB file based local cache at './local_cache' directory
'zbox://access_key@repo_id?cache_type=file&cache_size=3mb&base=./local_cache'

// URI with 1MB browser based local cache, only valid in browser
'zbox://access_key@repo_id?cache_type=browser'

// URI with 3MB browser based local cache, only valid in browser
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
