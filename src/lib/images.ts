export type ImageFit = 'cover' | 'contain'

export type TransformOptions = {
  width?: number
  height?: number
  quality?: number
  fit?: ImageFit
  format?: 'webp' | 'jpeg' | 'jpg' | 'png'
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top_left'
    | 'top_right'
    | 'bottom_left'
    | 'bottom_right'
}

function parseSupabasePublicObject(urlString: string): { origin: string; bucket: string; objectPath: string } | null {
  try {
    const url = new URL(urlString)
    const isObject = url.pathname.includes('/storage/v1/object/public/')
    const isRender = url.pathname.includes('/storage/v1/render/image/public/')
    if (!isObject && !isRender) return null
    const marker = isObject ? '/storage/v1/object/public/' : '/storage/v1/render/image/public/'
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    const after = url.pathname.substring(idx + marker.length) // bucket/path/to/file
    const [bucket, ...rest] = after.split('/')
    const objectPath = rest.join('/')
    if (!bucket || !objectPath) return null
    return { origin: url.origin, bucket, objectPath }
  } catch {
    return null
  }
}

export function getTransformedImageUrl(src: string, opts: TransformOptions = {}): string {
  if (!src) return src
  const parsed = parseSupabasePublicObject(src)
  if (!parsed) return src

  const { origin, bucket, objectPath } = parsed
  const safeSegments = objectPath
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
  const base = `${origin}/storage/v1/render/image/public/${encodeURIComponent(bucket)}/${safeSegments.join('/')}`

  const params = new URLSearchParams()
  if (opts.width && Number.isFinite(opts.width)) params.set('width', String(Math.round(opts.width)))
  if (opts.height && Number.isFinite(opts.height)) params.set('height', String(Math.round(opts.height)))
  if (opts.quality && Number.isFinite(opts.quality)) params.set('quality', String(Math.round(opts.quality)))
  if (opts.fit) params.set('resize', opts.fit === 'contain' ? 'contain' : 'cover')
  if (opts.format) params.set('format', opts.format)
  if (opts.position) params.set('position', opts.position)

  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export function buildSrcSet(
  src: string,
  widths: number[],
  options: Omit<TransformOptions, 'width' | 'height'> & { heightForWidth?: (w: number) => number } = {}
): string {
  const uniq = Array.from(new Set(widths.map((w) => Math.max(1, Math.round(w))))).sort((a, b) => a - b)
  return uniq
    .map((w) => {
      const h = options.heightForWidth ? options.heightForWidth(w) : undefined
      const u = getTransformedImageUrl(src, { ...options, width: w, height: h })
      return `${u} ${w}w`
    })
    .join(', ')
}

export function defaultWidthsForBase(baseWidth: number): number[] {
  const w = Math.max(1, Math.round(baseWidth))
  return [Math.round(w / 2), w, Math.round(w * 1.5), w * 2]
} 