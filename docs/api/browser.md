# Browser

## Class: Zbox

### constructor

```js
var zbox = new Zbox.Zbox()
```

### initEnv

#### zbox.initEnv(options?: Object): Promise\<void>

Initialise Zbox environment. This function should be called once before any
other functions provided by Zbox.

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

Opens a [Repo](#class-repo) at URI with the password and specified options.

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

This method must be called when repo is not opened.

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

## Class: Repo

`Repo` is an encrypted repository contains the whole file system.

A `Repo` represents a secure collection which consists of files, directories and
their associated data. It provides POSIX-like methods to manipulate the enclosed
file system.

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
If this method failed due to IO error, super block might be damaged. If so, use [repairSuperBlock](#repairsuperblock) to restore super block before re-open
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

This function will create a file if it does not exist, and will truncate it if
it does.

See the [Repo.openFile](#openfile) function for more details.

`path` must be an absolute path.

Example:

```js
var file = repo.createFile('/foo/bar.txt')
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
  var file = repo.openFile('/foo/bar.txt')
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
  var file = repo.openFile({
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
var dirs = repo.readDir('/foo/bar')
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
var metadata = repo.metadata('/foo/bar')
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
var hist = repo.history('/foo/bar.txt')
```

### copy

#### repo.copy({ from: string, to: string }): Promise\<void>

Copies the content of one file to another. This function will overwrite the
content of `to`.

If `from` and `to` both point to the same file, then this function will do
nothing.

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

An instance of a `File` can be read and/or written depending on what options it
was opened with. Files also implement [Seek](#enum-seekfrom) to alter the
logical cursor that the file contains internally.

### close
### read
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
