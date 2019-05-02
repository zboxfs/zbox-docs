# Browser

## Class: Zbox

`Zbox` class is the entry point of ZboxFS. A typical usage pattern is

1. Initialise environment using [initEnv](#initenv)
2. Create or open a [Repo] instance using [openRepo](#openrepo)
3. Do your works using [Repo] instance or [File] instance
4. Close all opened [File] and [Repo] instances
4. Call [exit](#exit) to terminate ZboxFS

Example:

```js
// create Zbox instance
var zbox = new Zbox.Zbox()

// initialise environment
await zbox.initEnv({ debug: true })

// create a repo
var repo = await zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: { create: true }
})

// do your works here, for example, create a file
var file = await repo.createFile('/foo.txt')

// close file and repo
await file.close()
await repo.close()

// terminate ZboxFS
await zbox.exit()
```

### constructor

```js
var zbox = new Zbox.Zbox()
```

### initEnv

#### zbox.initEnv(options?: Object): Promise\<void>

Initialise Zbox environment. This method should be called once before any
other methods provided by Zbox.

`options` can have `debug: true` to turn on debug logging in console output.

Example:

```js
zbox.initEnv({ debug: true })
```

### exists

#### zbox.exists(uri: string): Promise\<boolean>

Returns whether the URI points at an existing repository.

Example:

```js
zbox.exists('zbox://access_key@repo_id')
```

### openRepo

#### zbox.openRepo(arg: Object): Promise\<Repo>

Opens a [Repo] at URI with the password and specified options.

Argument `arg` is:

```ts
{
  uri: string,  // URI points at the repo
  pwd: string,  // Password to decrypt the repo
  opts?: {      // Options to open the repo
    create?: boolean,       // default: false
    createNew?: boolean,    // default: false
    compress?: boolean,     // default: false
    versionLimit?: number,  // default: 10
    dedupChunk?: boolean,   // default: true
    readOnly?: boolean      // default: false
  }
}
```

In the `opts` options:

- `create`

  Sets the option for creating a new repo.

  This option indicates whether a new repo will be created if the repo does not
  yet already exist.

- `createNew`

  Sets the option to always create a new repo.

  This option indicates whether a new repo will be created. No repo is allowed
  to exist at the target location.

- `compress`

  Sets the option for data compression.

  This options indicates whether the [LZ4](http://www.lz4.org/) compression
  should be used in the repo.

- `versionLimit`

  Sets the default maximum number of file version.

  The version_limit must be within [1, 255], default is 10. This setting is a
  repo-wise setting, indivisual file can overwrite it by setting `versionLimit`
  in [repo.openFile](#openfile).

- `dedupChunk`

  Sets the default option for file data chunk deduplication.

  This option indicates whether data chunk should be deduped when writing data
  to a file. This setting is a repo-wise setting, indivisual file can overwrite
  it by setting `dedupChunk` in [repo.openFile](#openfile).

- `readOnly`

  Sets the option for read-only mode.

  This option cannot be true with either `create` or `createNew` is true.

Example:

```js
var repo = await zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: {
    create: true,
    compress: false
  }
})
```

### repairSuperBlock

#### zbox.repairSuperBlock(arg: Object): Promise\<void>

Repair possibly damaged super block.

This method will try to repair super block using backup. One scenario is when
[resetPassword](#resetpassword) failed due to IO error, super block might be
damaged. Using this method can restore the damaged super block from backup. If
super block is all good, this method is no-op.

This method must be called when repo is closed.

Argument `arg` is:

```ts
{
  uri: string,  // URI points at the repo
  pwd: string   // Password to decrypt the repo
}
```

Example:

```js
zbox.repairSuperBlock({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password'
})
```

### deleteLocalCache

#### zbox.deleteLocalCache(uri: string): Promise\<void>

Call this method to delete ZboxFS local cache.

Example:

```js
zbox.deleteLocalCache('zbox://access_key@repo_id')
```

### exit

#### zbox.exit(): Promise\<void>

Call this method to terminate ZboxFS.

Example:

```js
zbox.exit()
```

## Class: Repo

`Repo` is an encrypted repository contains the whole file system.

A `Repo` represents a secure collection which consists of files, directories and
their associated data. It provides POSIX-like methods to manipulate the enclosed
file system.

A `Repo` instance can be obtained by [Zbox.openRepo](#openrepo) and must be
[closed](#close) after use.

### close

#### repo.close(): Promise\<void>

Close an opened repo.

Example:

```js
repo.close()
```

### info

#### repo.info(): Promise\<Object>

Get repo metadata infomation.

Return:

```ts
{
  volumeId: string,     // Unique volume id
  version: string,      // Repo version as string. for example, '0.6.0'
  uri: string,          // URI of this repo
  compress: boolean,    // Compression flag
  versionLimit: number, // Repo-wise version limit
  dedupChunk: boolean,  // Repo-wise dedup flag
  isReadOnly: boolean,  // Repo read-only flag
  createdAt: number     // Repo creation time, Unix timestamp
}
```

Example:

```js
var info = await repo.info()
```

### resetPassword

#### repo.resetPassword({ oldPwd: string, newPwd: string }): Promise\<void>

Reset password for the repo.

:::warning Note
If this method failed due to IO error, super block might be damaged. If so,
use [repairSuperBlock](#repairsuperblock) to restore super block before re-open
the repo.
:::

Example:

```js
repo.resetPassword({
  oldPwd: 'old password',
  newPwd: 'new password'
})
```

### pathExists

#### repo.pathExists(path: string): Promise\<boolean>

Returns whether the path points at an existing entity in repo.

`path` must be an absolute path.

Example:

```js
repo.pathExists('/foo/bar')
```

### isFile

#### repo.isFile(path: string): Promise\<boolean>

Returns whether the path exists in repo and is pointing at a regular file.

`path` must be an absolute path.

Example:

```js
repo.isFile('/foo/bar.txt')
```

### isDir

#### repo.isDir(path: string): Promise\<boolean>

Returns whether the path exists in repo and is pointing at a directory.

`path` must be an absolute path.

Example:

```js
repo.isDir('/foo/bar')
```

### createFile

#### repo.createFile(path: string): Promise\<File>

Create a file in read-write mode. This is a shortcut of
[Repo.openFile](#openfile).

This method will create a file if it does not exist, and will truncate it if
it does.

See the [Repo.openFile](#openfile) method for more details.

`path` must be an absolute path.

Example:

```js
var file = await repo.createFile('/foo/bar.txt')
```

### openFile

#### repo.openFile(arg: string | Object): Promise\<File>

Open a file with specified path or options.

Argument `arg` can be either one of the below:

- `path`: string

  Open a file at `path` in read-only mode with all default options. `path` must
  be an absolute path.

  Example:

  ```js
  var file = await repo.openFile('/foo/bar.txt')
  ```

- `options`: Object

  Open a file using `options` as below:

  ```ts
  {
    path: string, // File absolute path
    opts?: {      // Options to open the file
      read?: boolean,           // default: true
      write?: boolean,          // default: false
      append?: boolean,         // default: false
      truncate?: boolean,       // default: false
      create?: boolean,         // default: false
      createNew?: boolean,      // default: false
      versionLimit?: number,    // default: repo's versionLimit option
      dedupChunk?: boolean      // default: repo's dedupChunk option
    }
  }
  ```

  The `opts` contains:

  - `read`: boolean

    Open file for read access.

  - `write`: boolean

    Open file for write access.

  - `append`: boolean

    Open file for append mode. This option, when true, means that writes will
    append to a file instead of overwriting previous content.

    :::warning Note
    Setting both `write: true` and `append: true` has the same effect as
    setting only `append: true`.
    :::

  - `truncate`: boolean

    Sets the option for truncating a previous file.

    :::warning Note
    Setting both `write: true` and `truncate: true` has the same effect as
    setting only `truncate: true`.
    :::

  - `create`: boolean

    Sets the option for creating a new file. This option indicates whether a
    new file will be created if the file does not yet already exist.

  - `createNew`: boolean

    Sets the option for creating a new file. This option indicates whether a
    new file will be created. No file is allowed to exist at the target path.

  - `versionLimit`: number

    Sets the maximum number of file versions allowed. It must be within
    [1, 255]. It will fall back to repo's `versionLimit` if it is not set.

  - `dedupChunk`: boolean

    Sets the option for file data chunk deduplication. This option indicates
    whether data chunk should be deduped when writing data to a file. It will
    fall back to repo's `dedupChunk` if it is not set.

  Example:

  ```js
  var file = await repo.openFile({
    path: '/foo/bar.txt',
    opts: {
      write: true,
      append: true
    }
  })
  ```

### createDir

#### repo.createDir(path: string): Promise\<void>

Creates a new, empty directory at the specified path.

`path` must be an absolute path.

Example:

```js
repo.createDir('/foo')
```

### createDirAll

#### repo.createDirAll(path: string): Promise\<void>

Recursively create a directory and all of its parent components if they are
missing.

`path` must be an absolute path.

Example:

```js
repo.createDirAll('/foo/bar/baz')
```

### readDir

#### repo.readDir(path: string): Promise\<Array\<Object>>

Returns a list of all the entries within a directory.

`path` must be an absolute path.

Return:

```ts
[
  {
    path: string,           // Absolute path
    fileName: string,       // Basename of the path
    metadata: {
      fileType: string,     // File type string, 'File' or 'Dir'
      contentLen: number,   // Content length of current version, in bytes
      currVersion: number,  // Current version number
      createdAt: number,    // File creation time, Unix timestamp
      modifiedAt: number    // File modification time, Unix timestamp
    }
  }
  ...
]
```

Example:

```js
var dirs = await repo.readDir('/foo/bar')
```

### metadata

#### repo.metadata(path: string): Promise\<Object>

Get the information about a file or directory at specified path.

`path` must be an absolute path.

Return:

```ts
{
  fileType: string,     // File type string, 'File' or 'Dir'
  contentLen: number,   // Content length of current version, in bytes
  currVersion: number,  // Current version number
  createdAt: number,    // File creation time, Unix timestamp
  modifiedAt: number    // File modification time, Unix timestamp
}
```

Example:

```js
var metadata = await repo.metadata('/foo/bar')
```

### history

#### repo.history(path: string): Promise\<Array\<Object>>

Return a list of history versions of a regular file.

`path` must be an absolute path.

Return:

```ts
[
  {
    num: number,        // version number
    contentLen: number, // Content length of the version, in bytes
    createdAt: number   // Version creation time, Unix timestamp
  }
  ...
]
```

Example:

```js
var hist = await repo.history('/foo/bar.txt')
```

### copy

#### repo.copy({ from: string, to: string }): Promise\<void>

Copies the content of one file to another. This method will overwrite the
content of `to`.

If `from` and `to` both point to the same file, this method is no-op.

`from` and `to` must be absolute paths to regular files.

Example:

```js
repo.copy({
  from: '/foo/bar.txt',
  to: '/foo/baz.txt'
})
```

### removeFile

#### repo.removeFile(path: string): Promise\<void>

Removes a regular file from the repo.

`path` must be an absolute path.

Example:

```js
repo.removeFile('/foo/bar.txt')
```

### removeDir

#### repo.removeDir(path: string): Promise\<void>

Remove an existing empty directory.

`path` must be an absolute path.

:::warning Note
`path` must be an empty directory.
:::

Example:

```js
repo.removeDir('/foo/bar')
```

### removeDirAll

#### repo.removeDirAll(path: string): Promise\<void>

Removes a directory at this path, after removing all its children. Use
carefully!

`path` must be an absolute path.

Example:

```js
repo.removeDirAll('/foo')
```

### rename

#### repo.rename({ from: string, to: string }): Promise\<void>

Rename a file or directory to a new name, replacing the original file if to
already exists.

`from` and `to` must be absolute paths.

Example:

```js
repo.rename({
  from: '/foo/bar.txt',
  to: '/foo/baz.txt'
})
```

## Class: File

`File` is a reference to an opened file in the repo.

An instance of a `File` can be [read](#read) and/or [written](#write) depending
on what options it was opened with. Files also implement [Seek](#enum-seekfrom)
to alter the logical cursor that the file contains internally.

A `File` instance can be obtained by [Repo.openFile](#openfile) or
[Repo.createFile](#createfile) and  must be [closed](#close-2) after use.

#### Versioning

`File` contents support up to 255 revision versions. Version is immutable once
it is created.

By default, the maximum number of versions of a File is 10, which is
configurable by [versionLimit](#openfile). After reaching this limit, the
oldest version will be automatically deleted after adding a new one.

Version number starts from 1 and continuously increases by 1.

#### Writing

`File` is multi-versioned, each time updating its content will create a new
permanent version. There are two ways of writing data to a file:

- Multi-part Write

  This is done by updating file using [write](#write) method. After all writing
  operations, [finish](#finish) must be called to create a new version.

  ```js
  const buf = new Uint8Array([1, 2, 3])
  var file = await repo.createFile('/foo.txt')
  await file.write(buf.slice(0, 2))
  await file.write(buf.slice(2))
  await file.finish()   // now file content is [1, 2, 3]
  ```

- Single-part Write

  This can be done by calling [writeOnce](#writeonce), which will call
  [finish](#finish) internally to create a new version.

  ```js
  const buf = new Uint8Array([1, 2, 3])
  var file = await repo.createFile('/foo.txt')
  await file.writeOnce(buf.slice())  // now file content is [1, 2, 3]
  ```

#### Reading

As `File` can contain multiple versions, read operation can be associated with
different versions. By default, reading on a file is always binded to the
latest version. To read a specific version, a [VersionReader](#versionreader),
which supports [read](#read-2) as well, can be used.

Example:

```js
// create file and write data to it
const buf = new Uint8Array([1, 2, 3, 4, 5, 6])
var file = await repo.createFile('/foo.txt')
await file.writeOnce(buf.slice())

// read the first 2 bytes
await file.seek({ from: Zbox.SeekFrom.START, offset: 0 })
var dst = await file.read(new Uint8Array(2))    // now dst is [1, 2]

// create a new version, now the file content is [1, 2, 7, 8, 5, 6]
await file.writeOnce(new Uint8Array([7, 8]))

// notice that reading is on the latest version
await file.seek({ from: Zbox.SeekFrom.CURRENT, offset: -2 })
dst = await file.read(dst)    // now dst is [7, 8]

await file.close()
```

Read multiple versions using [VersionReader](#class-versionreader).

```js
// create file and write 2 versions
var file = await repo.createFile('/foo.txt')
await file.writeOnce('foo')
await file.writeOnce('bar')

// get latest version number
const currVer = await file.currVersion()

// create a version reader and read latest version of content
var vrdr = await file.versionReader(currVer)
var content = await vrdr.readAllString()    // now content is 'foobar'
await vrdr.close()

// create another version reader and read previous version of content
vrdr = await file.versionReader(currVer - 1)
content = await vrdr.readAllString()    // now content is 'foo'
await vrdr.close()

await file.close()
```

### close

#### file.close(): Promise\<void>

Close an opened file.

Example:

```js
file.close()
```

### read

#### file.read(buf: Uint8Array): Promise\<Uint8Array>

Read some bytes from file using the specified buffer, returning a buffer
containing them.

The length ***n*** of returned buffer is guaranteed that 0 <= ***n*** <= buf.length. A
nonzero ***n*** value indicates that the buffer returned has been filled in with ***n***
bytes of data from the file. If ***n*** is 0, then it can indicate one of two
scenarios:

- This logical cursor has reached its "end of file" and will longer be able to
  read bytes from this file.
- The buffer specified was 0 bytes in length.

This method uses zero-copy manner, that is, the specified buffer `buf` is used
to store the bytes read from file and then returned back to application.

:::warning Warning
In order to improve performance, ZboxFs uses [transferable object] in read.
That means the specified buffer `buf` is **not** usable after calling this
method. If you want to keep `buf` untouched, make a copy of it before use. For
example, `file.read(buf.slice())`.
:::

Example:

```js
var buf = new Uint8Array(3)
var result = await file.read(buf)   // buf is not usable after this call!

var buf = new Uint8Array(3)
buf = await file.read(buf)  // This is OK, buf will contain bytes read

// Or if you want buf to be untouched, copy it before use
var buf = new Uint8Array(3)
var result = await file.read(buf.slice())
```

### readAll
### readAllString
### write
### finish
### writeOnce
### seek
### setLen
### currVersion
### metadata
### history
### versionReader

## Class: VersionReader
### close
### read
### readAll
### readAllString
### seek

## Enum: SeekFrom

[Repo]: #class-repo
[File]: #class-file
[transferable object]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects)
