export function supportsExtractionRuntime(version = process.versions.node) {
  const [major, minor] = version.split(".").map(Number);
  return major > 22 || (major === 22 && minor >= 13);
}

export function assertExtractionRuntime() {
  if (!supportsExtractionRuntime()) {
    throw new Error(
      `A CVRadar PDF-feldolgozásához Node.js 22.13+ szükséges. Jelenlegi verzió: ${process.versions.node}. Válts Node.js 24-re (nvm install && nvm use), majd indítsd újra az alkalmazást.`,
    );
  }
}
