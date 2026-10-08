// Loaded before prismjs. Stops Prism from highlighting the whole page on DOMContentLoaded:
// that rewrites the server-rendered <code> blocks before Angular hydrates them (NG0500).
// The code viewer calls Prism.highlightElement itself.
window.Prism = { manual: true };
