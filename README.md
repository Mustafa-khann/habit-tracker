This is a Next.js + Electron app. You can develop the Next.js UI and the Electron shell concurrently, and build a Debian `.deb` package.

## Getting Started

First, run the development server with Electron:

```bash
npm run dev
```

This launches Next.js at `http://localhost:3000` and opens Electron pointing to it.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Build

```bash
npm run build
```

This exports the Next.js site to `out/` and then packages an Electron `.deb` in `dist/`.

If you only want the web export:

```bash
npm run build:web
```

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Packaging output

- Linux `.deb` packages are written to `dist/`.
- The Electron app loads the static export from `out/`.

## Desktop builds

Build Linux (Deb/AppImage/RPM):

```bash
npm run build:web
npm run build:linux
```

Build Windows (NSIS/zip):

```bash
npm run build:web
npm run build:win
```

Build macOS (DMG/zip):

```bash
npm run build:web
npm run build:mac
```

Notes:
- macOS artifacts require macOS to build. They are unsigned by default (`mac.identity: null`).
- Windows artifacts can be built on Windows runners. Building Windows on Linux requires Wine; use CI instead.
- All artifacts are written to `dist/`.
