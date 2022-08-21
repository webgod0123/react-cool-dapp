import { Box, BoxProps } from 'grommet'
import clsx from 'clsx'
import React from 'react'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import './HoverEffect.css'

interface HoverEffectProps extends BoxProps {
  className?: string
  children?: React.ReactNode
  defaultTheme?: Theme
  style?: object
}

const HoverEffect = ({ className, children, defaultTheme, style, ...props }: HoverEffectProps) => {
  const themes = useTheme()
  const themeMode = defaultTheme ? defaultTheme : themes.themeMode

  return (
    <Box className={clsx(className, themeMode === Theme.light ? 'hover-light' : 'hover-dark')} style={style} {...props}>
      {children}
    </Box>
  )
}

export default HoverEffect
