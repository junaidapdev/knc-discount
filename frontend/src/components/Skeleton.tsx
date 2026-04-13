interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export default function Skeleton({ width = '100%', height = 16, borderRadius = 6 }: SkeletonProps) {
  return (
    <span style={{
      display: 'block',
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s infinite',
    }} />
  )
}
