import React from 'react'
import clsx from 'clsx'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import './GradientBox.css'
import { Box, BoxExtendedProps } from 'grommet'
import HoverEffect from '../HoverEffect'

interface GradientBoxProps extends BoxExtendedProps {
  children?: React.ReactNode
  selected?: boolean
  noGradient?: boolean
  className?: string
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch' | undefined
  onClick?: () => void
  defaultTheme?: Theme
  filter?: boolean
}

const GradientBox = ({
  children,
  selected,
  noGradient,
  onClick,
  className,
  pad,
  margin,
  align,
  defaultTheme,
  filter,
  ...other
}: GradientBoxProps) => {
  const themes = useTheme()
  const themeMode = defaultTheme ? defaultTheme : themes.themeMode
  const Comp = onClick ? HoverEffect : Box

  return (
    <Comp
      align={align}
      onClick={onClick}
      pad={pad || '.3em'}
      margin={margin}
      className={filter ? clsx({ GradientBox: selected }, className) : clsx({ GradientBox: !noGradient }, className)}
      border={!filter && noGradient ? { color: 'clrBorderGrey' } : undefined}
      style={{ borderRadius: '5px' }}
      background={filter ? (themeMode === Theme.dark ? 'clrDarkGreyOnNavy' : 'clrOffWhiteBlue') : ''}
      focusIndicator={false}
      defaultTheme={defaultTheme}
      {...other}
    >
      {children}
    </Comp>
  )
}

GradientBox.defaultProps = {
  selected: false,
}

export default GradientBox
