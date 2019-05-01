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

Returns whether the URI points to an existing repository.

Example:

```js
zbox.exists('zbox://access_key@repo_id')
```

### openRepo

#### zbox.openRepo(arg: Object): Promise\<Repo>

Opens a repository at URI with the password and specified options.

Argument `arg` is:

```js
{
  uri: string,  // URI points to the repo
  pwd: string,  // Password to decrypt the repo
  opts?: {      // Options to open the repo
    create?: boolean,       // default: false
    createNew?: boolean,    // default: false
    compress?: boolean,     // default: false
    versionLimit?: number,  // default: 10
    dedupChunk?: boolean,   // default: false
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

```js
{
  uri: string,  // URI points to the repo
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
### close
### info
### resetPassword
### pathExists
### isFile
### isDir
### createFile
### openFile
### createDir
### createDirAll
### readDir
### metadata
### history
### copy
### removeFile
### removeDir
### removeDirAll
### rename

## Class: File
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
