# Getting Started

## Create a Repo

Before start using Zbox, you need to create a repo on [zbox.io](https://zbox.io).
If you don't want to sign up, create a test repo on [try.zbox.io], which will be
valid for 48 hours.

Each repo is identified by [URI](/api/#uri), which is an unique URL-like string.
For example,

```
zbox://d9Ysc4PJa5sT7NKJyxDjMpZg@jRpbY2DEra6qMR
```

Here `d9Ysc4PJa5sT7NKJyxDjMpZg` is the access key and `jRpbY2DEra6qMR` is the
repo ID.

:::warning Keep access key safe
The repo access key cannot decrypt your repo's data, it is only used for API
access authtication. But anyone who obtained the access key can potentially
delete your repo, so you still need to keep it safe.
:::

## Installation

We provide official libraries for different programming languages. Use your
favourite package manager tool to install Zbox.

### Browser

1. Download `zbox-browser-0.1.0.tar.gz` from [latest release]
2. Extract it to your website's `static` or `public` folder
3. Import it using `<script>` tag

  ```html
  <script src="zbox-browser-0.1.0/index.js"></script>
  ```

:::warning Same origin
Because of [same-origin policy] restriction, use this package as a cross-origin
script won't work.
:::

### Node.js

Install Zbox via [npm]:

```bash
npm install @zbox/nodejs
```

### Rust

Install Zbox via [cargo] by adding the following dependency to your project
`Cargo.toml`:

```toml
[dependencies]
zbox = { version = "0.7.1", features = ["storage-zbox-native"] }
```

Zbox depends on [libsodium]. If you don't want to install it by yourself,
simply specify `libsodium-bundled` feature in the dependency, which will
automatically download, verify and build libsodium.

```toml
[dependencies]
zbox = { version = "0.7.1", features = ["storage-zbox-native", "libsodium-bundled"] }
```

## Hello World

### JavaScript

For Node.js, import Zbox first:

```js
const Zbox = require('@zbox/nodejs');
```

Then, replace `[your_repo_uri]` below with your repo's URI and start using Zbox.

```js
(async () => {
  // create a Zbox instance
  const zbox = new Zbox();

  // initialise environment, called once before using Zbox
  await zbox.initEnv({ debug: true });

  // open the repo
  var repo = await zbox.openRepo({
    uri: '[your_repo_uri]',
    pwd: 'secret password',
    opts: { create: true }
  });

  // create a file
  var file = await repo.createFile('/hello_world.txt');

  // write content to file
  await file.writeOnce('Hello, World!');

  // seek to the beginning of file
  await file.seek({ from: Zbox.SeekFrom.Start, offset: 0 });

  // read all content as string
  const str = await file.readAllString();
  console.log(str);

  // close file and repo
  await file.close();
  await repo.close();
})();
```

### Rust

Create a Rust app and replace `[your_repo_uri]` below with your repo's URI.

```rust
extern crate zbox;

use std::io::{Read, Write, Seek, SeekFrom};
use zbox::{init_env, RepoOpener, OpenOptions};

fn main() {
    // initialise zbox environment, called first
    init_env();

    // create and open a repository in current OS directory
    let mut repo = RepoOpener::new()
        .create(true)
        .open([your_repo_uri], "your password")
        .unwrap();

    // create and open a file in repository for writing
    let mut file = OpenOptions::new()
        .create(true)
        .open(&mut repo, "/hello_world.txt")
        .unwrap();

    // use std::io::Write trait to write data into it
    file.write_all(b"Hello, World!").unwrap();

    // finish writing to make a permanent content version
    file.finish().unwrap();

    // read file content using std::io::Read trait
    let mut content = String::new();
    file.seek(SeekFrom::Start(0)).unwrap();
    file.read_to_string(&mut content).unwrap();
    assert_eq!(content, "Hello, World!");
}
```

[npm]: https://www.npmjs.com
[cargo]: https://crates.io
[libsodium]: https://libsodium.org
[try.zbox.io]: https://try.zbox.io
[latest release]: https://github.com/zboxfs/zbox-browser/releases/latest
[Personal access tokens]: https://github.com/
[same-origin policy]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
