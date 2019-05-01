# Introduction

Zbox is a no-knowledge, privacy-focused cloud flie storage for apps. It is based
on the zero-details, private in-app file system [ZboxFS].

Its goal is to help applications to store files securely, privately and reliably.

Unlike other cloud storages, Zbox takes privacy as the top priority. By using
state-of-the-art cryptos, everything stored in Zbox is encrypted locally,
including file contents, metadata, directories and etc. Unencrypted data never
leaves app local memory.

In addition to advanced encryption, Zbox unifies data to same-sized blocks to
eliminate metadata leakage. Nobody, except you, knows what the file contents are
and how many files are stored. Zbox also knows nothing about your files, except
the total bytes used.

Zbox is a transactional file storage. Any modification on your files and
directories are guarded by ACID transaction. Data integrity is guaranteed by
authenticated encryption primitives
[AEAD encryption](https://en.wikipedia.org/wiki/Authenticated_encryption).

Zbox is not a traditional file system, it cannot be mounted to operating system
and shared access by many processes. Only the app runs it has the exclusive
access to Zbox. Zbox is also not like Dropbox, OneDrive and etc. It is built
for developers, not for consumers.

## How It Works

![Zbox Overview](../assets/overview.svg)

As an module, ZboxFS runs within the same memory of your application. It
encapsulates a virtual file system in a secure repository (Repo) and provides
file IO API to application.

All data stored in the repo is encrypted using user-specified key. Optionally,
data can be de-duplicated and compressed. When a file is saved to the repo, it
is chunked into same-sized blocks and encrypted before transmitted to cloud
through HTTPS.

A local cache, which is also encrypted, is used to boost IO performance. It
can use different storages too, such as memory,
[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
or local files ystem.

Once the encrypted data blocks are saved to the globally-distrubuted Zbox
Cloud Storage, it is guaranteed to be secure, private and reliable. Nobody,
including us, can hold the encryption key and obtain any knowledge about your
data.

## Features

- Everything is encrypted locally :lock:, including metadata and directory
  structure, no knowledge can be leaked to underlying storage
- State-of-the-art cryptography: AES-256-GCM (hardware), XChaCha20-Poly1305,
  Argon2 password hashing and etc., empowered by [libsodium](https://libsodium.org/)
- Support multiple storages, including memory, OS file system, RDBMS, Key-value
  object store and more
- File and directories are chunked into same-sized blocks to eliminate metadata
  leakage
- Content-based data chunk deduplication and file-based deduplication
- Data compression using [LZ4](http://www.lz4.org/) in fast mode, optional
- File contents versioning
- ACID transactional operations
- Easy-to-use file IO API
- Cross platforms, supports 64-bit Linux, MacOS and Windows
- Cross devices, runs on desktop, tablet and mobile
- Multiple programming language bindings, C/C++, Rust, Browser, Node.js and
  Android Java and more are coming
- Globally-distrubuted CDN-powered secure cloud storage
- Built in [Rust](https://www.rust-lang.org/) :hearts: with safety and
  performance
- ZboxFS is Open sourced on [GitHub](https://github.com/zboxfs/zbox) with
  Apache-2.0 license

## FAQ

### What is Zbox and ZboxFS?

**Zbox** is a no-knowledge, privacy-focused cloud flie storage for apps.

**[ZboxFS]** is a zero-details, privacy-focused in-app file system.

ZboxFS is the client of Zbox and it runs locally in your application's memory.
The remote is the **Zbox Cloud Storage**, which is located globally and powered
by CDN. Your data is encrypted by ZboxFS locally before saved to Zbox Cloud
Storage.

### Why do I need to use Zbox?

As data privacy is increasingly becoming a major concern for all of us, we need
to use modern technology to protect and regain ownership of our precious data.

That's why we built Zbox.

Its #1 goal is to give you back full control of your data, and keep it as much
private and secure as possible. By using state-of-the-art encryption and many
other advanced technology, Zbox can provide an solid defence against data
breach and privacy leakage.

### How Zbox secured my files?

When your files are saving to Zbox, they are chunked to same-sized data blocks
by [ZboxFS]. Those data blocks are then encrypted locally by the user-specified
key. After that, data blocks are transmitted using HTTPS and saved to Zbox
Cloud Storage, a secure globally-distrubuted cloud storage.

Encryption key and any unencrypted data are never leave local app memory, and
only your app can access them.

[ZboxFS]: https://zbox.io/fs
