// Loaded after prismjs. Keeps a private reference to the Prism instance: third-party scripts
// loaded later (the Kapa widget bundles its own) overwrite window.Prism with a build that has
// no highlightElement.
window.__optimusPrism = window.Prism;
