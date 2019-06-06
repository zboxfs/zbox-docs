# JavaScript

## Overview

This is API reference for [ZboxFS] JavaScript bindings. It covers both browser
and Node.js environments.

The most core parts are [Repo] and [File] class, which provides most API for
file system operations and file data I/O.

- [Repo] - provides methods to manipulate ZboxFS file system
- [File] - provides POSIX-like I/O methods to read/write file content

[Zbox.initEnv](#initenv) initialises the environment and should be called once
before any other methods.

### Calling Style

All methods in this API are asynchronous and return a [Promise]. You can use
either 'Promise chaining' or 'Async/await' style to call the API.

For example,

```js
// Promise chaining
zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: { create: true }
})
.then(repo => repo.openFile('/foo/bar.txt'))
.then(file => file.readAll())
.then(data => console.log(data));

// Async/await
async function asyncFunc() {
  var repo = await zbox.openRepo({
    uri: 'zbox://access_key@repo_id',
    pwd: 'secret password',
    opts: { create: true }
  });
  var file = await repo.openFile('/foo/bar.txt');
  var data = await file.readAll();
  console.log(data);
}
```

### Error Handling

With the two calling styles, there are two ways of error handling.

For example,

```js
// Catch exception in promise chaining
zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: { create: true }
})
.then(repo => repo.openFile('/foo/bar.txt'))
.then(file => file.readAll())
.then(data => console.log(data))
.catch(err => {
  console.log(err);
});

// Catch exception in async/await
async function asyncFunc() {
  try {
    var repo = await zbox.openRepo({
      uri: 'zbox://access_key@repo_id',
      pwd: 'secret password',
      opts: { create: true }
    });
    var file = await repo.openFile('/foo/bar.txt');
    var data = await file.readAll();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}
```

## Class: Zbox

`Zbox` class is the entry point of ZboxFS.

A typical usage pattern is:

1. Initialise environment using [initEnv](#initenv)
2. Create or open a [Repo] instance using [openRepo](#openrepo)
3. Do your works using [Repo] or [File] instance
4. Close all opened [File] and [Repo] instances
4. Call [exit](#exit) to terminate ZboxFS

#### Example

```js
// create ZboxFS instance
var zbox = new Zbox();

// initialise environment
await zbox.initEnv({ debug: true });

// create or open a repo
var repo = await zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: { create: true }
});

// do your works here, for example, create a file
var file = await repo.createFile('/foo.txt');

// close file and repo
await file.close();
await repo.close();

// terminate ZboxFS
await zbox.exit();
```

### constructor

Create a ZboxFS instance.

#### Example

```js
var zbox = new Zbox();
```

### initEnv

#### zbox.initEnv(options?: Object): Promise\<void>

Initialise ZboxFS environment.

This method should be called once before any other methods provided by Zbox.

`options` can have `debug: true` to turn on debug logging in console output.

#### Example

```js
await zbox.initEnv({ debug: true });
```

### version

#### zbox.version(): Promise\<String>

Return ZboxFS version as string.

#### Example

```js
const version = await zbox.version();
```

### exists

#### zbox.exists(uri: string): Promise\<boolean>

Returns whether the [URI] points at an existing repository.

#### Example

```js
await zbox.exists('zbox://access_key@repo_id');
```

### openRepo

#### zbox.openRepo({ uri: string, pwd: string, opts?: Object }): Promise\<Repo>

Opens a [Repo] at [URI] with the password and specified options.

The `opts` options are:

```ts
{
  opsLimit?: OpsLimit,    // default: OpsLimit.Interactive
  memLimit?: MemLimit,    // default: MemLimit.Interactive
  cipher?: Cipher,        // default: (see below)
  create?: boolean,       // default: false
  createNew?: boolean,    // default: false
  compress?: boolean,     // default: false
  versionLimit?: number,  // default: 10
  dedupChunk?: boolean,   // default: true
  readOnly?: boolean      // default: false
}
```

- `opsLimit`

  Sets the password hash operation limit, one value of
  [OpsLimit](#enum-opslimit). This option is only used when creating repo.

  This option is not available in browser.

- `memLimit`

  Sets the password hash memory limit, one value of [MemLimit](#enum-memlimit).
  This option is only used when creating repo.

  This option is not available in browser.

- `cipher`

  Sets the crypto cipher encrypts the repository, one value of
  [Cipher](#enum-cipher). This option is only used when creating repo.

  [Cipher.Aes](#enum-cipher) is the default if CPU supports AES-NI instructions,
  otherwise it will fall back to [Cipher.Xchacha](#enum-cipher).

  This option is not available in browser.

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

:::tip Notes on crypto options
When opening a repo, the three crypto options `opsLimit`, `memLimit` and
`cipher` must be exactly same as the specified values when creating the repo.

Due to WebAssembly restriction, those 3 options are not available in browser.
Instead, they are defaulted to below values:

- opsLmit: OpsLimit.Interactive
- memLmit: MemLimit.Interactive
- cipher: Cipher.Xchacha

So if a repo is supposed to be used in browser, use above values when creating
it.
:::

#### Example

```js
// Create or open a repo with compression enabled
var repo = await zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: {
    create: true,
    compress: true
  }
});

// Create or open a repo with alternative crypto settings
// Note: this cannot run in browser.
var repo = await zbox.openRepo({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password',
  opts: {
    create: true,
    opsLimit: Zbox.OpsLimit.Moderate,
    memLimit: Zbox.MemLimit.Moderate,
    cipher: Zbox.Cipher.Aes
  }
});
```

### repairSuperBlock

#### zbox.repairSuperBlock(arg: Object): Promise\<void>

Repair possibly damaged super block.

This method will try to repair super block using backup. One scenario is when
[resetPassword](#resetpassword) failed due to IO error, super block might be
damaged. Using this method can restore the damaged super block from backup. If
super block is all good, this method is no-op.

:::warning Warning
This method is not useful for memory-based storage and must be called when repo
is closed.
:::

Argument `arg` is:

```ts
{
  uri: string,  // URI points at the repo
  pwd: string   // Password to decrypt the repo
}
```

#### Example

```js
await zbox.repairSuperBlock({
  uri: 'zbox://access_key@repo_id',
  pwd: 'secret password'
});
```

### exit

#### zbox.exit(): Promise\<void>

Call this method to terminate ZboxFS.

#### Example

```js
await zbox.exit();
```

## Class: Repo

`Repo` is an encrypted repository contains the whole file system.

A `Repo` represents a secure collection which consists of files, directories and
their associated data. It provides POSIX-like methods to manipulate the enclosed
file system.

A `Repo` instance can be obtained by [Zbox.openRepo](#openrepo) and must be
closed after use.

### close

#### repo.close(): Promise\<void>

Close an opened repo.

#### Example

```js
await repo.close();
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

#### Example

```js
var info = await repo.info();
```

### resetPassword

#### In Browser: repo.resetPassword({ oldPwd: string, newPwd: string }): Promise\<void>
#### In Node.js: repo.resetPassword({ oldPwd: string, newPwd: string, opsLimit: OpsLimit, memLimit: MemLimit }): Promise\<void>

Reset password for the repo.

`opsLimit` is one value of [OpsLimit](#enum-opslimit). `memLimit` is one value
of [MemLimit](#enum-memlimit).

:::warning For Node.js
If repo is to be used in both browser and Node.js, `opsLimit` and `memLimit`
must be set `Interactive` when calling this method.
:::

:::tip Reset password failure
If this method failed due to IO error, super block might be damaged. In this
case, use [repairSuperBlock](#repairsuperblock) to restore super block.
:::

#### Example

```js
// In browser
await repo.resetPassword({
  oldPwd: 'old password',
  newPwd: 'new password'
});

// In Node.js
await repo.resetPassword({
  oldPwd: 'old password',
  newPwd: 'new password',
  opsLimit: Zbox.OpsLimit.Interactive,
  memLimit: Zbox.MemLimit.Interactive
});
```

#### See Also

[repairSuperBlock](#repairsuperblock)

### pathExists

#### repo.pathExists(path: string): Promise\<boolean>

Returns whether the path points at an existing entity in repo.

`path` must be an absolute path.

#### Example

```js
await repo.pathExists('/foo/bar');
```

### isFile

#### repo.isFile(path: string): Promise\<boolean>

Returns whether the path exists in repo and is pointing at a regular file.

`path` must be an absolute path.

#### Example

```js
await repo.isFile('/foo/bar.txt');
```

### isDir

#### repo.isDir(path: string): Promise\<boolean>

Returns whether the path exists in repo and is pointing at a directory.

`path` must be an absolute path.

#### Example

```js
await repo.isDir('/foo/bar');
```

### createFile

#### repo.createFile(path: string): Promise\<File>

Create a file in read-write mode. This is a shortcut of
[Repo.openFile](#openfile).

This method will create a file if it does not exist, and will truncate it if
it does.

See [Repo.openFile](#openfile) method for more details.

`path` must be an absolute path.

#### Example

```js
var file = await repo.createFile('/foo/bar.txt');
```

#### See Also

[openFile](#openfile)

### openFile

#### repo.openFile(arg: string | Object): Promise\<File>

Open a file with specified path or options.

Argument `arg` can be either one of the below:

- `path`: string

  Open a file at `path` in read-only mode with all default options. `path` must
  be an absolute path.

  Example:

  ```js
  var file = await repo.openFile('/foo/bar.txt');
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

  The `opts` options:

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
  });
  ```

### createDir

#### repo.createDir(path: string): Promise\<void>

Creates a new, empty directory at the specified path.

`path` must be an absolute path.

#### Example

```js
await repo.createDir('/foo');
```

### createDirAll

#### repo.createDirAll(path: string): Promise\<void>

Recursively create a directory and all of its parent components if they are
missing.

`path` must be an absolute path.

#### Example

```js
await repo.createDirAll('/foo/bar/baz');
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

#### Example

```js
var dirs = await repo.readDir('/foo/bar');
```

### metadata

#### repo.metadata(path: string): Promise\<Object>

Get the metadata about a file or directory at specified path.

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

#### Example

```js
var metadata = await repo.metadata('/foo/bar');
```

### history

#### repo.history(path: string): Promise\<Array\<Object>>

Return a list of history versions of a regular file at specified path.

`path` must be an absolute path.

Return:

```ts
[
  {
    num: number,        // Version number
    contentLen: number, // Content length of this version, in bytes
    createdAt: number   // Version creation time, Unix timestamp
  }
  ...
]
```

#### Example

```js
var hist = await repo.history('/foo/bar.txt');
```

#### See Also

[VersionReader](#class-versionreader), [File.history](#history-2)

### copy

#### repo.copy({ from: string, to: string }): Promise\<void>

Copies the content of one file to another. This method will overwrite the
content of `to`.

If `from` and `to` both point to the same file, this method is no-op.

`from` and `to` must be absolute paths to regular files.

#### Example

```js
await repo.copy({
  from: '/foo/bar.txt',
  to: '/foo/baz.txt'
});
```

### removeFile

#### repo.removeFile(path: string): Promise\<void>

Removes a regular file from the repo.

`path` must be an absolute path.

#### Example

```js
await repo.removeFile('/foo/bar.txt');
```

#### See Also

[removeDir](#removedir), [removeDirAll](#removedirall)

### removeDir

#### repo.removeDir(path: string): Promise\<void>

Remove an existing empty directory.

`path` must be an absolute path.

:::warning Note
`path` must be an empty directory.
:::

#### Example

```js
await repo.removeDir('/foo/bar');
```

#### See Also

[removeFile](#removefile), [removeDirAll](#removedirall)

### removeDirAll

#### repo.removeDirAll(path: string): Promise\<void>

Removes a directory at this path, after removing all its children. Use
carefully!

`path` must be an absolute path.

#### Example

```js
await repo.removeDirAll('/foo');
```

#### See Also

[removeFile](#removefile), [removeDir](#removedir)

### rename

#### repo.rename({ from: string, to: string }): Promise\<void>

Rename a file or directory to a new name, replacing the original file if to
already exists.

`from` and `to` must be absolute paths.

#### Example

```js
await repo.rename({
  from: '/foo/bar.txt',
  to: '/foo/baz.txt'
});
```

## Class: File

`File` is a reference to an opened file in the repo.

An instance of a `File` can be [read](#read) and/or [written](#write) depending
on what options it was opened with. Files also implement [Seek](#enum-seekfrom)
to alter the logical cursor that the file contains internally.

A `File` instance can be obtained by [Repo.openFile](#openfile) or
[Repo.createFile](#createfile) and  must be closed after use.

#### Versioning

`File` contents support up to 255 revision versions. Version is immutable once
it is created.

By default, the maximum number of versions of a file is 10, which is
configurable by `versionLimit` option on both [Repo](#openrepo) and
[File](#openfile) level. File level option takes precedence.

After reaching this limit, the oldest version will be automatically deleted
after adding a new one.

Version number starts from 1 and continuously increases by 1.

#### Writing

`File` is multi-versioned, each time updating its content will create a new
permanent version. There are two ways of writing data to a file:

- **Multi-part Write**

  This is done by updating file using [write](#write) method multiple times.
  After all writing operations, [finish](#finish) must be called to create a
  new version.

  ```js
  const buf = new Uint8Array([1, 2, 3]);
  var file = await repo.createFile('/foo.txt');
  await file.write(buf.slice(0, 2));
  await file.write(buf.slice(2));
  await file.finish();   // now file content is [1, 2, 3]
  ```

- **Single-part Write**

  This can be done by calling [writeOnce](#writeonce), which will call
  [finish](#finish) internally to create a new version.

  ```js
  const buf = new Uint8Array([1, 2, 3]);
  var file = await repo.createFile('/foo.txt');
  await file.writeOnce(buf.slice()); // now file content is [1, 2, 3]
  ```

#### Reading

As `File` can contain multiple versions, read operation can be associated with
different versions. By default, reading on a file is always binded to the
latest version. To read a specific version, a
[VersionReader](#class-versionreader), which supports [read](#read-2) as well,
can be used.

#### Example

```js
// create a file and write data to it
const buf = new Uint8Array([1, 2, 3, 4, 5, 6]);
var file = await repo.createFile('/foo.txt');
await file.writeOnce(buf.slice());

// read the first 2 bytes
await file.seek({ from: Zbox.SeekFrom.Start, offset: 0 });
var dst = await file.read(new Uint8Array(2));    // now dst is [1, 2]

// create a new version, now the file content is [1, 2, 7, 8, 5, 6]
await file.writeOnce(new Uint8Array([7, 8]));

// notice that reading is on the latest version
await file.seek({ from: Zbox.SeekFrom.Current, offset: -2 });
dst = await file.read(dst);    // now dst is [7, 8]

await file.close();
```

Read multiple versions using [VersionReader](#class-versionreader).

```js
// create a file and write 2 versions
var file = await repo.createFile('/foo.txt');
await file.writeOnce('foo');
await file.writeOnce('bar');

// get latest version number
const currVer = await file.currVersion();

// create a version reader and read latest version of content
var vrdr = await file.versionReader(currVer);
var content = await vrdr.readAllString();    // now content is 'foobar'
await vrdr.close();

// create another version reader and read previous version of content
vrdr = await file.versionReader(currVer - 1);
content = await vrdr.readAllString();    // now content is 'foo'
await vrdr.close();

await file.close();
```

### close

#### file.close(): Promise\<void>

Close an opened file.

#### Example

```js
await file.close();
```

### read

#### In Browser: file.read(buf: TypedArray | ArrayBuffer ): Promise\<Uint8Array>
#### In Node.js: file.read(buf: Buffer | TypedArray | ArrayBuffer): Promise\<Buffer>

Read some bytes from file using the specified buffer, returning the buffer
containing them.

The length ***n*** of returned buffer is guaranteed that 0 <= ***n*** <= buf.length.  If ***n***
is 0, then it can indicate one of two scenarios:

- This logical cursor has reached its "end of file" and will no longer be able
  to read bytes from this file.
- The buffer specified was 0 bytes in length.

This method is zero-copy, that is, the input buffer `buf` is **modified** and used
for both input and output.

:::warning Warning
ZboxFS uses [transferable object] in browser. That means the input buffer `buf`
is transferred ownership and **not** usable after calling this method. If you
want to keep `buf` unmodified, make a copy of it before use. For example,
`file.read(buf.slice())`.
:::

Browser Example:

```js
var buf = new Uint8Array(3);
var output = await file.read(buf);   // buf is not usable after this call!

// This is OK, buf will contain the bytes read
var buf = new Uint8Array(3);
buf = await file.read(buf);

// If you want to keep buf unmodified, copy it before use
var buf = new Uint8Array(3);
var output = await file.read(buf.slice());
```

Node.js Example:

```js
var buf = Buffer.alloc(3);
var output = await file.read(buf);   // buf is modified after this call!

// TypedArray can also be used in file.read()
var buf = new Uint8Array(3);
buf = await file.read(buf);

// If you want to keep buf unmodified, copy it before use
var buf = Buffer.alloc(3);
var output = await file.read(Buffer.from(buf));
```

#### See Also

[readAll](#readall), [readAllString](#readallstring)

### readAll

#### In Browser: file.readAll(): Promise\<Uint8Array>
#### In Node.js: file.readAll(): Promise\<Buffer>

Read all bytes until end of the file, placing them into the returned buffer.

#### Example

```js
var buf = await file.readAll();
```

#### See Also

[read](#read), [readAllString](#readallstring)

### readAllString

#### file.readAllString(): Promise\<string>

Read all bytes as a string until end of the file.

#### Example

```js
var str = await file.readAllString();
```

#### See Also

[read](#read), [readAll](#readall)

### readStream

#### In Node.js: file.readStream(): Promise\<stream.Readable>

Return a [stream.Readable] stream which can read file continuously.

This method is for Node.js only.

#### Example

```js
var stream = await file.readStream();

stream.on('data', (chunk) => {
  console.log(`data read: ${chunk}`);
});

stream.on('end', async () => {
  await file.close();
  console.log('read finished');
});

stream.on('error', async (err) => {
  await file.close();
  console.log(err);
});
```

#### See Also

[read](#read), [readAll](#readall), [readAllString](#readallstring)

### write

#### In Browser: file.write(buf: TypedArray | ArrayBuffer | string): Promise\<number>
#### In Node.js: file.write(buf: Buffer | TypedArray | ArrayBuffer | string): Promise\<number>

Write a buffer into this file, returning how many bytes were written.

This method will attempt to write the entire contents of `buf`. The returned  ***n***
is guaranteed that 0 <= ***n*** <= buf.length. A return value of 0 typically means
that the file is no longer able to accept bytes, or that the buffer provided is
empty.

After all `write` calls are completed, [finish](#finish) must be called to
make a permanent version.

In browser, this method is zero-copy. That is, the specified buffer `buf`, if it
is an Uint8Array, is transferred ownership during write instead of copy.

:::warning Warning
In order to improve performance, ZboxFS uses [transferable object] in write.
That means the provided buffer `buf`, if it is an Uint8Array, is **not** usable
after calling this method. If you want to keep `buf` unmodified, make a copy of
it before use. For example, `file.write(buf.slice())`.
:::

#### Example

```js
var buf = new Uint8Array([1, 2, 3]);
var written = await file.write(buf);   // buf is not usable after this call!

// Or if you want buf to be unmodified, copy it before use
var buf = new Uint8Array([1, 2, 3]);
var written = await file.write(buf.slice());

// You can write string to file as well
var written = await file.write('foo bar');

// Don't forget to call finish() to make a version
await file.finish();
```

#### See Also

[finish](#finish), [writeOnce](#writeonce)

### finish

#### file.finish(): Promise\<void>

Complete multi-part write to file and create a new version.

#### Example

```js
await file.finish();
```

#### See Also

[write](#write), [writeOnce](#writeonce)

### writeOnce

#### file.writeOnce(buf: Uint8Array | string): Promise\<void>

Single-part write to file and create a new version.

This method provides a convenient way to combine [write](#write) and
[finish](#finish).

In browser, this method is zero-copy. That is, if the specified buffer `buf` is
an Uint8Array, it is transferred ownership during write.

:::warning Warning
In browser, to improve performance, ZboxFS uses [transferable object] in write.
That means the provided buffer `buf`, if it is an Uint8Array, is **not** usable
after calling this method. If you want to keep `buf` unmodified, make a copy of
it before use. For example, `file.write(buf.slice())`.
:::

#### Example

```js
// In browser, buf is not usable after file.writeOnce()
var buf = new Uint8Array([1, 2, 3]);
await file.writeOnce(buf);

// If you want buf to be unmodified, copy it before use
// No need to do this in Node.js
var buf = new Uint8Array([1, 2, 3]);
await file.writeOnce(buf.slice());

// You can write string to file as well
await file.writeOnce('foo bar');
```

#### See Also

[write](#write), [finish](#finish)

### seek

#### file.seek({ from: SeekFrom, offset: number }): Promise\<number>

Seek to an offset, relative to [from](#enum-seekfrom) in bytes, in this file.

This method returns the new position from the start of the content. That
position can be used later with [SeekFrom.Start](#enum-seekfrom).

A seek beyond the end of the file is allowed. In this case, subsequent write
will extend the file and have all of the intermediate data filled in with 0s.

:::tip Tips
The `offset` can also be an negative integer, which means seek backwards in the
content. But be careful don't seek before byte 0.
:::

#### Example

```js
var pos = await file.seek({ from: Zbox.SeekFrom.Start, offset: 42 });
var pos = await file.seek({ from: Zbox.SeekFrom.Current, offset: 42 });
var pos = await file.seek({ from: Zbox.SeekFrom.End, offset: -42 });
```

#### See Also

[SeekFrom](#enum-seekfrom)

### setLen

#### file.setLen(size: number): Promise\<void>

Truncates or extends the underlying file, create a new version of content which
size to become `size`.

If the `size` is less than the current content size, then the new content will
be shrunk. If it is greater than the current content size, then the content
will be extended to `size` and have all of the intermediate data filled in with
0s.

#### Example

```js
await file.setLen(42);
```

### currVersion

#### file.currVersion(): Promise\<number>

Returns the current content version number.

#### Example

```js
var versionNum = await file.currVersion();
```

### metadata

#### file.metadata(): Promise\<Object>

Queries metadata about the file.

Return:

```ts
{
  fileType: string,     // File type string, is always 'File'
  contentLen: number,   // Content length of current version, in bytes
  currVersion: number,  // Current version number
  createdAt: number,    // File creation time, Unix timestamp
  modifiedAt: number    // File modification time, Unix timestamp
}
```

#### Example

```js
var metadata = await file.metadata();
```

### history

#### file.history(): Promise\<Array\<Object>>

Return a list of history versions of the file.

Return:

```ts
[
  {
    num: number,        // Version number
    contentLen: number, // Content length of this version, in bytes
    createdAt: number   // Version creation time, Unix timestamp
  }
  ...
]
```

#### Example

```js
var hist = await file.history();
```

#### See Also

[VersionReader](#class-versionreader), [Repo.history](#history)

### versionReader

#### file.versionReader(version: number): Promise\<VersionReader>

Get a [version reader](#class-versionreader) of the specified version.

To get the version number, first call [history](#history-2) to get the list of
all versions and then choose the version number from it.

#### Example

```js
// Get file history versions
var hist = await file.history();

// Suppose the history version list is:
// [
//   { num: 42, contentLen: 123, createdAt: 1540376682 },
//   { num: 43, contentLen: 456, createdAt: 1540376683 }
// ]
// then we can choose version 42 to read from
var versionReader = await file.versionReader(42);
```

#### See Also

[VersionReader](#class-versionreader), [File.history](#history-2)

## Class: VersionReader

A reader for a specific vesion of file content.

This reader can be obtained by [File.versionReader](#versionreader) method and
must be closed after use.

A typical usage pattern is:

1. Get file history versions using [File.history](#history-2)
2. Get version reader for a sepcfic version number
   [File.versionReader](#versionreader)
3. Read content using [read](#read-2), [readAll](#readall-2) or
   [readAllString](#readallstring-2)
4. Close the version reader using [close](#close-3)

#### Example

```js
// Get file history versions
var hist = await file.history();

// Suppose the history version list is:
// [
//   { num: 42, contentLen: 123, createdAt: 1540376682 },
//   { num: 43, contentLen: 456, createdAt: 1540376683 }
// ]
// then we can choose version 42 to read from
var versionReader = await file.versionReader(42);

// Read all content of this version
var content = await versionReader.readAll();

// Close the version reader
await versionReader.close();
```

### close

#### versionReader.close(): Promise\<void>

Close an opened version reader.

#### Example

```js
versionReader.close();
```

### read

#### versionReader.read(buf: Uint8Array): Promise\<Uint8Array>

Read some bytes from the reader using the specified buffer, returning a buffer
containing them.

This method has same semantics as [File.read](#read).

The length ***n*** of returned buffer is guaranteed that 0 <= ***n*** <= buf.length.  If ***n***
is 0, then it can indicate one of two scenarios:

- This logical cursor has reached its "end of file" and will no longer be able
  to read bytes from this reader.
- The buffer specified was 0 bytes in length.

This method is zero-copy, that is, the specified buffer `buf` is used
for both input and output.

:::warning Warning
In order to improve performance, ZboxFS uses [transferable object] in read.
That means the provided buffer `buf` is **not** usable after calling this method.
If you want to keep `buf` unmodified, make a copy of it before use. For
example, `versionReader.read(buf.slice())`.
:::

#### Example

```js
var buf = new Uint8Array(3);
var output = await versionReader.read(buf); // buf is not usable after this call!

var buf = new Uint8Array(3);
buf = await versionReader.read(buf);  // This is OK, buf will contain bytes read

// Or if you want buf to be unmodified, copy it before use
var buf = new Uint8Array(3);
var output = await versionReader.read(buf.slice());
```

#### See Also

[readAll](#readall-2), [readAllString](#readallstring-2)

### readAll

#### versionReader.readAll(): Promise\<Uint8Array>

Read all bytes until end of the reader, placing them into the returned buffer.

#### Example

```js
var buf = await versionReader.readAll();
```

#### See Also

[read](#read-2), [readAllString](#readallstring-2)

### readAllString

#### versionReader.readAllString(): Promise\<string>

Read all bytes as a string until end of the reader.

#### Example

```js
var str = await versionReader.readAllString();
```

#### See Also

[read](#read-2), [readAll](#readall-2)

### seek

#### versionReader.seek({ from: SeekFrom, offset: number }): Promise\<number>

Seek to an offset, relative to [from](#enum-seekfrom) in bytes, in this reader.

This method returns the new position from the start of the content. That
position can be used later with [SeekFrom.Start](#enum-seekfrom).

A seek beyond the end of the reader is allowed, but no meaningful use because
the reader can only read from content.

:::tip Tips
The `offset` can also be an negative integer, which means seek backwards in the
content. But be careful don't seek before byte 0.
:::

#### Example

```js
var pos = await versionReader.seek({ from: Zbox.SeekFrom.Start, offset: 42 });
var pos = await versionReader.seek({ from: Zbox.SeekFrom.Current, offset: 42 });
var pos = await versionReader.seek({ from: Zbox.SeekFrom.End, offset: -42 });
```

#### See Also

[SeekFrom](#enum-seekfrom)

## Enum: OpsLimit

Password hash operation limit.

It represents a maximum amount of computations to perform. Higher level
will require more CPU cycles to compute. It is used with
[MemLimit](#enum-memlimit).

For interactive, online operations, `OpsLimit.Interactive` and
`MemLimit.Interactive` provide base line for these two parameters. This
requires 64 MB of dedicated RAM. Higher values may improve security.

Alternatively, `OpsLimit.Moderate` and `MemLimit.Moderate` can be used.
This requires 256 MB of dedicated RAM, and takes about 0.7 seconds on a
2.8 Ghz Core i7 CPU.

For highly sensitive data and non-interactive operations,
`OpsLimit.Sensitive` and `MemLimit.Sensitive` can be used. With these
parameters, deriving a key takes about 3.5 seconds on a 2.8 Ghz Core i7 CPU
and requires 1024 MB of dedicated RAM.

See <https://download.libsodium.org/doc/password_hashing/the_argon2i_function>
for more details.

This enum is not available in browser.

Enumerations:

- Interactive

- Moderate

- Sensitive

#### See Also

[MemLimit](#enum-memlimit), [openRepo](#openrepo)

## Enum: MemLimit

Password hash memory limit.

It represents a maximum amount of memory required to perform password hashing.
It is used with [OpsLimit](#enum-opslimit).

For interactive, online operations, `OpsLimit.Interactive` and
`MemLimit.Interactive` provide base line for these two parameters. This
requires 64 MB of dedicated RAM. Higher values may improve security.

Alternatively, `OpsLimit.Moderate` and `MemLimit.Moderate` can be used.
This requires 256 MB of dedicated RAM, and takes about 0.7 seconds on a
2.8 Ghz Core i7 CPU.

For highly sensitive data and non-interactive operations,
`OpsLimit.Sensitive` and `MemLimit.Sensitive` can be used. With these
parameters, deriving a key takes about 3.5 seconds on a 2.8 Ghz Core i7 CPU
and requires 1024 MB of dedicated RAM.

See <https://download.libsodium.org/doc/password_hashing/the_argon2i_function>
for more details.

This enum is not available in browser.

Enumerations:

- Interactive

  64MB memory

- Moderate

  256MB memory

- Sensitive

  1024MB memory

#### See Also

[OpsLimit](#enum-opslimit), [openRepo](#openrepo)

## Enum: Cipher

Crypto cipher primitivies.

See <https://download.libsodium.org/doc/secret-key_cryptography/aead> for more
details.

This enum is not available in browser.

Enumerations:

- Xchacha

  XChaCha20-Poly1305

- Aes

  AES256-GCM, hardware only

#### See Also

[openRepo](#openrepo)

## Enum: SeekFrom

Enumeration of possible methods to seek within a file or version reader.

It is used by the [File.seek](#seek) and [VersionReader.seek](#seek-2) methods.

Enumerations:

- Start

  Set the offset to the number of bytes from start of object.

- End

  Set the offset to the size of object plus the specified number of bytes.

- Current

  Set the offset to the current position plus the specified number of bytes.

#### See Also

[File.seek](#seek), [VersionReader.seek](#seek-2)

[URI]: #uri
[Repo]: #class-repo
[File]: #class-file
[Zbox.io]: https://zbox.io
[ZboxFS]: https://zbox.io/fs
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[IndexedDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[transferable object]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Passing_data_by_transferring_ownership_(transferable_objects)
[stream.Readable]: https://nodejs.org/api/stream.html#stream_class_stream_readable
