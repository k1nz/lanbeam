import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [version, installerUrl, installerSha256, outputDirectory] = process.argv.slice(2);

if (!version || !installerUrl || !installerSha256 || !outputDirectory) {
  throw new Error(
    'Usage: node scripts/generate-winget-manifest.mjs <version> <installer-url> <sha256> <output-directory>',
  );
}

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid package version: ${version}`);
}

if (!/^https:\/\//.test(installerUrl)) {
  throw new Error('Installer URL must use HTTPS.');
}

if (!/^[A-Fa-f0-9]{64}$/.test(installerSha256)) {
  throw new Error('Installer SHA-256 must be a 64-character hexadecimal value.');
}

const packageIdentifier = 'k1nz.LanBeam';
const manifestVersion = '1.9.0';
const directory = resolve(
  outputDirectory,
  'manifests',
  'k',
  'k1nz',
  'LanBeam',
  version,
);
const filePrefix = `${packageIdentifier}.`;

mkdirSync(directory, { recursive: true });

writeFileSync(
  resolve(directory, `${filePrefix}yaml`),
  `# yaml-language-server: $schema=https://aka.ms/winget-manifest.version.${manifestVersion}.schema.json
PackageIdentifier: ${packageIdentifier}
PackageVersion: ${version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: ${manifestVersion}
`,
);

writeFileSync(
  resolve(directory, `${filePrefix}locale.en-US.yaml`),
  `# yaml-language-server: $schema=https://aka.ms/winget-manifest.defaultLocale.${manifestVersion}.schema.json
PackageIdentifier: ${packageIdentifier}
PackageVersion: ${version}
PackageLocale: en-US
Publisher: k1nz
PublisherUrl: https://github.com/k1nz
PublisherSupportUrl: https://github.com/k1nz/lanbeam/issues
PackageName: LanBeam
PackageUrl: https://github.com/k1nz/lanbeam
License: MIT
LicenseUrl: https://github.com/k1nz/lanbeam/blob/main/LICENSE
ShortDescription: Local-first LAN file transfer and real-time sharing tool.
Moniker: lanbeam
Tags:
  - lan
  - file-transfer
  - sharing
ManifestType: defaultLocale
ManifestVersion: ${manifestVersion}
`,
);

writeFileSync(
  resolve(directory, `${filePrefix}installer.yaml`),
  `# yaml-language-server: $schema=https://aka.ms/winget-manifest.installer.${manifestVersion}.schema.json
PackageIdentifier: ${packageIdentifier}
PackageVersion: ${version}
InstallerType: portable
Commands:
  - lanbeam
Installers:
  - Architecture: x64
    InstallerUrl: ${installerUrl}
    InstallerSha256: ${installerSha256.toUpperCase()}
ManifestType: installer
ManifestVersion: ${manifestVersion}
`,
);
