# Getting Started

## Installation

Zbox supports different programming languages, choose your favourite and follow
the steps below to install Zbox.

### Browser

Simply download and include with a script tag. `Zbox` class will be globally
available.

1. Download `zbox-browser-0.2.0.tar.gz` from the [latest release]

2. Extract and copy the whole `zbox-browser-0.2.0` folder to your website's
   `static` or `public` folder

   The folder should like below:

   ```sh
    zbox-browser-0.2.0
    ├── 1.worker.js
    ├── 1.worker.js.map
    ├── 39fe4d07f367480d98de.module.wasm
    ├── index.js
    ├── index.js.map
    ├── release.txt
    ├── worker.js
    └── worker.js.map
   ```

3. Import using `<script>` tag

  ```html
  <script src="zbox-browser-0.2.0/index.js"></script>
  ```

:::warning Same origin
Because of [same-origin policy] restriction, use this package as a cross-origin
script, such as CDN,  won't work.
:::

### Node.js

Install Zbox via [npm]:

```bash
npm install @zbox/nodejs
```

This will automatically install platform-specific library, which currently
supports Linux, Windows and macOS. If your platform is not supported, please
[raise an issue](https://github.com/zboxfs/zbox-nodejs/issues).

### Rust

Install Zbox via [Cargo] by adding the following dependency to your project
`Cargo.toml`:

```toml
[dependencies]
zbox = { version = "0.8.2", features = ["storage-zbox-native"] }
```

Zbox depends on [libsodium]. If you don't want to install it by yourself,
simply specify `libsodium-bundled` feature in the dependency, which will
automatically download, verify and build libsodium.

```toml
[dependencies]
zbox = { version = "0.8.2", features = ["storage-zbox-native", "libsodium-bundled"] }
```

## Create a Repo

Before start using Zbox, you need to create a repo on [zbox.io](https://zbox.io).
If you don't want to sign up, create a test repo on [try.zbox.io], which will be
valid for 48 hours.

After create repo, you will get an [URI](/api/#uri) which is an unique URL-like
identifier of a repo. For example,

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

## Start Using Zbox

Using Zbox is simple and straightforward. First make sure you have read through
[installation steps](#installation) above, and [created a repo](#create-a-repo)
on zbox.io.

Now let's create our first app.

### Browser

1. First, create an empty [Express] project `zbox-app`:

   ```sh
   mkdir zbox-app
   cd zbox-app
   npm init -y
   npm install express --save
   ```

2. Then create `app.js` file in `zbox-app` folder:

   ```js
   const express = require('express');
   const app = express();
   const port = 3000;

   app.use(express.static(__dirname + '/'));
   app.listen(port, () => console.log(`My Zbox app listening on port ${port}!`));
   ```

3. Download [zbox-browser-0.2.0.tar.gz] and extract it to `zbox-app` folder.

4. Create another file `index.html` in the same folder, replace `[your_repo_uri]`
   with your repo's URI.

   ```html
   <html>
     <head>
       <title>My First Zbox App</title>
       <meta charset="utf-8"/>
       <script src="zbox-browser-0.2.0/index.js"></script>
       <script>
         (async () => {
           // create a Zbox instance
           const zbox = new Zbox();

           // initialise Zbox environment and turn on debug logs
           await zbox.initEnv({ debug: true });

           // open the repo
           var repo = await zbox.openRepo({
             uri: '[your_repo_uri]',
             pwd: 'secret password',
             opts: { create: true }
           });

           // close repo and exit Zbox
           await repo.close();
           await zbox.exit();
         })();
       </script>
     </head>
     <body>
       <h1>Welcome to Zbox!</h1>
       <p>Open "Developer Tools" to watch the logs.</p>
     </body>
   </html>
   ```

5. Save all the files and start the web server:

   ```sh
   node app.js
   ```

6. Open http://localhost:3000/ in browser, remember to open developer tools to
   watch the logs.

   If you can see logs like below, you're all done.

   ```
   ZboxFS 0.8.2 - Zero-details, privacy-focused in-app file system
   ...[logs omitted]
   ZboxFS exited
   ```

That's it, now you have a private Zbox file system running in browser!

### Node.js

1. First, create an empty project `zbox-app` and install Zbox package:

   ```sh
   mkdir zbox-app
   cd zbox-app
   npm init -y
   npm install @zbox/nodejs --save
   ```

2. Create `zbox-test.js` file in `zbox-app` folder, replace `[your_repo_uri]`
   with your repo's URI.

   ```js
   // zbox-test.js
   const Zbox = require('@zbox/nodejs');

   (async () => {
     // create a Zbox instance
     const zbox = new Zbox();

     // initialise Zbox environment and turn on debug logs
     await zbox.initEnv({ debug: true });

     // open the repo
     var repo = await zbox.openRepo({
       uri: '[your_repo_uri]',
       pwd: 'secret password',
       opts: { create: true }
     });

     // close repo and exit Zbox
     await repo.close();
     await zbox.exit();
   })();
   ```

3. Now run the `zbox-test.js` file:

   ```sh
   node zbox-test.js
   ```

That's it, now you have a private Zbox file system running in Node.js!

### Rust

1. Create an empty Rust project `zbox-app`:

   ```sh
   cargo new --bin zbox-app
   cd zbox-app
   ```

2. Add Zbox as dependency in `Cargo.toml`:

   ```toml
   [dependencies]
   zbox = { version = "0.8.2", features = ["storage-zbox-native", "libsodium-bundled"] }
   ```

3. Write `src/main.rs` with code below and replace `[your_repo_uri]` with
   your repo's URI.

   ```rust
   extern crate zbox;

   use zbox::{init_env, RepoOpener};

   fn main() {
       // initialise zbox environment, called first
       init_env();

       // create and open a repository
       let mut _repo = RepoOpener::new()
           .create(true)
           .open("[your_repo_uri]", "your password")
           .unwrap();
   }
   ```

4. Turn on debug logs and run the app:

   ```sh
   export RUST_LOG=zbox=debug
   cargo run
   ```

That's it, now you have a private Zbox file system running in Rust!

## What's Next

Next, you can check out more on [tutorials](/tutorials/) or
[API reference](/api/).

If you have any issues, please raise it on our GitHub repos:

- [ZboxFS](https://github.com/zboxfs/zbox)
- [ZboxFS browser JavaScript binding](https://github.com/zboxfs/zbox-browser)
- [ZboxFS Node.js binding](https://github.com/zboxfs/zbox-nodejs)

[npm]: https://www.npmjs.com
[Cargo]: https://crates.io
[libsodium]: https://libsodium.org
[try.zbox.io]: https://try.zbox.io
[zbox-browser-0.2.0.tar.gz]: https://github.com/zboxfs/zbox-browser/releases/latest
[latest release]: https://github.com/zboxfs/zbox-browser/releases/latest
[Personal access tokens]: https://github.com/
[same-origin policy]: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
[Express]: https://expressjs.com
