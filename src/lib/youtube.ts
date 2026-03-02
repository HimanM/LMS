/**
 * Safely extracts a YouTube video ID from various URL formats.
 * Returns null if extraction fails.
 */
export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    // youtube.com/watch?v=VIDEO_ID or youtube.com/embed/VIDEO_ID
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
      }
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns a safe embed URL using youtube-nocookie.com.
 */
export function getYouTubeEmbedUrl(videoUrl: string): string | null {
  const id = extractYouTubeId(videoUrl);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
