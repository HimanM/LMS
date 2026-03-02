"use client";

import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface VideoPlayerProps {
  youtubeUrl: string;
  title: string;
}

export function VideoPlayer({ youtubeUrl, title }: VideoPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        Invalid video URL
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
