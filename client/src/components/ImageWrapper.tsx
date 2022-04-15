import { useEffect, useRef, useState } from 'react'
import { Loader } from '@/ui/Loader'

export interface ImageWrapperProps {
  src?: string
  className?: string
  fallbackClassName?: string
}

export const ImageWrapper = ({
  src,
  className,
  fallbackClassName,
}: ImageWrapperProps) => {
  const [ready, setReady] = useState<boolean>(false)
  const img = useRef(new Image())

  useEffect(() => {
    if (src)
      img.current.onload = () => {
        setReady(true)
      }
  }, [])

  useEffect(() => {
    if (src) {
      setReady(false)
      img.current.src = src // by setting an src, you trigger browser download
    }
  }, [src])

  useEffect(() => {
    img.current.className = className || ''
  }, [className])

  return ready ? (
    <img src={img.current.src} className={className} />
  ) : (
    <div className={`${className} ${fallbackClassName}`}>
      <Loader className='w-full h-full' />
    </div>
  )
}
