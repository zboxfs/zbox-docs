# Getting Started

## Create a Repo

Before start using Zbox, you need to create a repo on [zbox.io](https://zbox.io).
If you just want to quickly try Zbox, you can create a temporary repo on
[try.zbox.io](https://try.zbox.io), which is valid for 24 hours.

After repo is created, you need to obtain an access key for your repo. Zbox
authenticates repo access using your repo’s access key.

:::warning Note
The repo access key cannot decrypt your repo's data, it is only for API access
authtication. But anyone who obtained the access key can delete your repo,
so you still need to keep it safe.
:::

## Install ZboxFS

We provide official libraries for different programming languages.

#### Node.js

Install via [npm](https://www.npmjs.com/):

```bash
npm install zboxfs
```

#### Rust
```rust
use std::io;

pub struct Test {};
```
