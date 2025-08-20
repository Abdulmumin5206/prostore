import React, { useMemo, useState, useCallback } from 'react'
import { buildSrcSet, defaultWidthsForBase, getTransformedImageUrl } from '../lib/images'

export type OptimizedImageProps = {
  src: string
  alt: string
  width: number
  height?: number
  fit?: 'cover' | 'contain'
  quality?: number
  format?: 'webp' | 'jpeg' | 'jpg' | 'png'
  className?: string
  sizes?: string
  priority?: boolean
  loading?: 'eager' | 'lazy'
  decoding?: 'sync' | 'async' | 'auto'
  fetchPriority?: 'high' | 'low' | 'auto'
  style?: React.CSSProperties
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fit = 'cover',
  quality = 70,
  format = 'webp',
  className,
  sizes,
  priority,
  loading,
  decoding = 'async',
  fetchPriority,
  style,
}) => {
  const [useOriginal, setUseOriginal] = useState(false)
  const aspect = height && width ? height / width : undefined

  const transformedSrc = useMemo(() => (
    getTransformedImageUrl(src, { width, height, fit, quality, format })
  ), [src, width, height, fit, quality, format])

  const widths = useMemo(() => defaultWidthsForBase(width), [width])

  const srcSet = useMemo(() => (
    buildSrcSet(src, widths, {
      fit,
      quality,
      format,
      heightForWidth: aspect ? (w) => Math.round(w * aspect) : undefined,
    })
  ), [src, widths, fit, quality, format, aspect])

  const finalLoading = loading ?? (priority ? 'eager' : 'lazy')
  const finalFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto')

  const handleError = useCallback(() => {
    if (!useOriginal) setUseOriginal(true)
  }, [useOriginal])

  const renderSrc = useOriginal ? src : transformedSrc
  const renderSrcSet = useOriginal ? undefined : srcSet
  const renderSizes = sizes ?? (useOriginal ? undefined : undefined)

  return (
    <img
      src={renderSrc}
      srcSet={renderSrcSet}
      sizes={renderSizes}
      alt={alt}
      className={className}
      loading={finalLoading}
      decoding={decoding}
      fetchPriority={finalFetchPriority}
      style={style}
      onError={handleError}
    />
  )
}

export default OptimizedImage 