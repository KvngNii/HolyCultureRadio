/**
 * fixSpotifyRemote.js
 *
 * Applies the minimum changes needed to make react-native-spotify-remote
 * build with Gradle 7+ / AGP 8+.  Runs as part of the postinstall step.
 *
 * Why a script instead of a patch file?
 * patch-package uses context-line matching which is sensitive to line endings
 * (LF vs CRLF). On Windows, npm writes CRLF files, so a patch created on
 * Linux fails to apply. String replacement is platform-agnostic.
 *
 * What this does NOT need to fix:
 *   - The `implementation files(...)` AAR dependency is already overridden
 *     at build time by the `afterProject` hook in android/settings.gradle,
 *     so we don't need to touch dependencies here.
 */

const fs = require('fs');
const path = require('path');

const gradlePath = path.resolve(
  __dirname,
  '..',
  'node_modules',
  'react-native-spotify-remote',
  'android',
  'build.gradle'
);

if (!fs.existsSync(gradlePath)) {
  console.log('[fixSpotifyRemote] build.gradle not found – skipping');
  process.exit(0);
}

let src = fs.readFileSync(gradlePath, 'utf8');

// Already patched on a previous install?
if (!src.includes("apply plugin: 'maven'") && !src.includes('apply plugin: "maven"')) {
  console.log('[fixSpotifyRemote] Already patched – skipping');
  process.exit(0);
}

// 1. Remove every `apply plugin: 'maven'` line (appears twice in the file).
//    The /m flag makes ^ and $ match line boundaries; \r? handles CRLF.
src = src.replace(/^apply plugin: ['"]maven['"]\r?\n/gm, '');

// 2. Remove the `buildscript { ... }` block that references removed plugins.
//    Use a non-greedy match; the closing brace is at the start of its line.
src = src.replace(/^buildscript \{[\s\S]*?^}\r?\n/m, '');

// 3. Remove the duplicate `apply plugin: 'com.android.library'` line.
//    The library applies it twice; keep only the first occurrence.
let libraryPluginCount = 0;
src = src.replace(/^apply plugin: ['"]com\.android\.library['"]\r?\n/gm, (match) => {
  libraryPluginCount++;
  return libraryPluginCount === 1 ? match : '';
});

// 4. Remove the afterEvaluate / installArchives block (uses removed `maven`
//    plugin APIs — configureReactNativePom, mavenDeployer, etc.).
src = src.replace(/^afterEvaluate \{ project ->[\s\S]*?^}\r?\n/m, '');

fs.writeFileSync(gradlePath, src, 'utf8');
console.log('[fixSpotifyRemote] Patched react-native-spotify-remote/android/build.gradle');
