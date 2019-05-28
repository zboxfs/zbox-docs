# Getting Started

## Create a Repo

Before start using Zbox, you need to create a repo on [zbox.io](https://zbox.io).
If you just need a quick try and don't want to sign up, you can create a
temporary test repo on [try.zbox.io](https://try.zbox.io), which will be valid
for 48 hours.

After create repo, you need to obtain its URI, which contains access key. Zbox
authenticates repo access using the access key.

The repo [URI](api/#uri) is an URL-like string, for example,

```rust
zbox://d9Ysc4PJa5sT7NKJyxDjMpZg@jRpbY2DEra6qMR
```

In this example, `d9Ysc4PJa5sT7NKJyxDjMpZg` is the access key and
`jRpbY2DEra6qMR` is the repo ID.

:::warning Note
The repo access key cannot decrypt your repo's data, it is only used for API
access authtication. But anyone who obtained the access key can potentially
delete your repo, so you still need to keep it safe.
:::

## Install Zbox

We provide official libraries for different programming languages. Use your
favourite package manager tool to install Zbox.

### Browser

Install Zbox via [npm]:

```bash
npm install @zbox/browser
```

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
zbox = "0.7.1"
```

Zbox depends on [libsodium]. If you don't want to install it by yourself,
simply specify `libsodium-bundled` feature in the dependency, which will
automatically download, verify and build libsodium.

```toml
[dependencies]
zbox = { version = "0.7.1", features = ["libsodium-bundled"] }
```

[npm]: https://www.npmjs.com
[cargo]: https://crates.io
[libsodium]: https://libsodium.org
