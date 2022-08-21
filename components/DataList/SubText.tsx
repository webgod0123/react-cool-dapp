import { BoxProps, Text, TextProps } from 'grommet'
import * as React from 'react'

export interface SubTextProps extends BoxProps {
  children?: any | any[]
  color?: TextProps['color']
  size?: TextProps['size']
  weight?: TextProps['weight']
}

const SubText = ({ children, color, size, weight, ...props }: SubTextProps) => {
  return (
    <Text {...props} size={size || 'xsmall'} color={color || 'clrHeaderText'} weight={weight || 'normal'}>
      {children}
    </Text>
  )
}

export default SubText
