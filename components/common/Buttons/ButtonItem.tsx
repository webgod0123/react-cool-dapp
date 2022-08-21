import * as React from 'react'
import { Box, Button, BoxProps, TextProps, ButtonProps } from 'grommet'

export interface ButtonItemProps extends BoxProps {
  children?: React.ReactNode;
  textSize?: TextProps['size'];
  textColor?: TextProps['color'];
  hoverIndicator?: ButtonProps['hoverIndicator'];
  href?: ButtonProps['href'];
  onClick?(e: React.MouseEvent): void;
  gradient?: boolean
  disabled?: boolean
}

const ButtonItem = ({
  children,
  direction,
  justify,
  align,
  pad,
  margin,
  round,
  onClick,
  href,
  textSize,
  textColor,
  hoverIndicator,
  gradient,
  disabled,
  ...props
}: ButtonItemProps) => {
  return (
    <Button
      href={href}
      onClick={onClick}
      hoverIndicator={hoverIndicator || 'false'}
      disabled={disabled}
    >
      <Box
        justify={justify || 'center'}
        align={align || 'center'}
        pad={pad || { horizontal: 'small', vertical: 'xsmall' }}
        margin={margin || { horizontal: 'xsmall' }}
        round={round || '3px'}
        direction='row'
        {...props}
      >
        {children}
      </Box>
    </Button>
  )
}

export default ButtonItem
