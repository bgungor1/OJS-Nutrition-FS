import { type ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface ViewTransitionWrapperProps {
  children: ReactNode
}
export default function ViewTransitionWrapper({ children }: ViewTransitionWrapperProps) {
  const location = useLocation()

  useEffect(() => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
      })
    }
  }, [location.pathname])

  return <>{children}</>
}

