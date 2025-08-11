// simple, license-friendly placeholders for demo content

export function placeholderImage(i: number, w = 1200, h = 800) {
  // Lorem Picsum – random but stable per seed
  return `https://picsum.photos/seed/sn${i}/${w}/${h}`;
}

// two widely used CC0/demo videos (stable hosts)
const videos = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
];

export function placeholderVideo(i: number) {
  const idx = ((i % videos.length) + videos.length) % videos.length;
  return videos[idx];
}
