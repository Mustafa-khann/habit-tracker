export default function DownloadPage() {
  const githubOwnerRepo = process.env.NEXT_PUBLIC_GITHUB_REPO || "USER/REPO";
  const latestBase = `https://github.com/${githubOwnerRepo}/releases/latest/download`;

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.04),transparent_35%)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Download</h1>
        <p className="mt-1 text-sm text-gray-400">Get Habit Tracker for your platform.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <a
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:bg-gray-800 supports-[backdrop-filter]:bg-gray-900/40"
            href={`${latestBase}/HabitTracker-linux-amd64.AppImage`}
          >
            <div className="text-lg font-medium">Linux (AppImage)</div>
            <div className="text-xs text-gray-400">Universal AppImage</div>
          </a>
          <a
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:bg-gray-800 supports-[backdrop-filter]:bg-gray-900/40"
            href={`${latestBase}/HabitTracker-linux-amd64.deb`}
          >
            <div className="text-lg font-medium">Linux (Debian/Ubuntu)</div>
            <div className="text-xs text-gray-400">.deb package</div>
          </a>
          <a
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:bg-gray-800 supports-[backdrop-filter]:bg-gray-900/40"
            href={`${latestBase}/HabitTracker-win-x64.exe`}
          >
            <div className="text-lg font-medium">Windows</div>
            <div className="text-xs text-gray-400">Installer (.exe)</div>
          </a>
          <a
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:bg-gray-800 supports-[backdrop-filter]:bg-gray-900/40"
            href={`${latestBase}/HabitTracker-mac-x64.dmg`}
          >
            <div className="text-lg font-medium">macOS (Intel)</div>
            <div className="text-xs text-gray-400">DMG</div>
          </a>
          <a
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:bg-gray-800 supports-[backdrop-filter]:bg-gray-900/40"
            href={`${latestBase}/HabitTracker-mac-arm64.dmg`}
          >
            <div className="text-lg font-medium">macOS (Apple Silicon)</div>
            <div className="text-xs text-gray-400">DMG</div>
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Having trouble? Visit our <a className="underline" href={`https://github.com/${githubOwnerRepo}/releases`}>Releases</a> page.
          {githubOwnerRepo === 'USER/REPO' && (
            <span className="ml-2 text-amber-400">Set NEXT_PUBLIC_GITHUB_REPO in your environment.</span>
          )}
        </p>
      </div>
    </div>
  );
}

