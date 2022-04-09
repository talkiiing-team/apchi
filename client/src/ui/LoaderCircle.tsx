import { ReactComponent as Icon } from '@/assets/loader.svg'

export const LoaderCircle = ({ className }: { className?: string }) => (
  <Icon className={`${className} animate-spin`} />
)
