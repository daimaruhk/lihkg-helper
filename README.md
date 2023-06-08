# LIHKG Helper
A chrome extension that makes LIHKG.com better.

![Step 1](https://i.imgur.com/wy1v4zL.png)

![Step 2](https://i.imgur.com/TBiQvfc_d.webp?maxwidth=1520&fidelity=grand)

![Step 3](https://i.imgur.com/hjYEojR.png)

![Step 4](https://i.imgur.com/b7Oeplb.png)

## Features
This extension allows user to:
1. back up posts in one click.
2. scroll automatically inside a post.

## Installation
1. Download the extension:
	- Clone this repository, run `npm run install & npm run build`. It creates a production build of the extension in `./dist` direcotry.
	- Or, download the pre-build extension [here](https://github.com/hkbocchi/lihkg-helper/releases/tag/v1.0.0).
2. Go to [chrome://extensions](chrome://extensions).
3. Toggle on the **Developer mode** at the top-right corner.
4. Click **Load unpacked** button at the top-left corner, select the directory of the extension.
5. Enjoy.

## Changelog

### v1.1.0 (Jun 3, 2023)
Features:
- [f37442e](https://github.com/daimaruhk/lihkg-helper/commit/f37442eb25a3821afbf4a5a9fcbd5b9638cb5316): Display confirmation dialog when user attempts to delete a backup post.

### v1.2.0 (Jun 8, 2023)
Features:
- [42be9f2](https://github.com/daimaruhk/lihkg-helper/commit/42be9f2b3336bec3a02faa129f08250dcb46a036): Add auto scroll button.