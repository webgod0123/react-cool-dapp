import React from 'react'
import { Box, BoxProps, Text, TextProps } from 'grommet'

interface DefaultLogoProps extends BoxProps {
  title: string
  textSize?: TextProps['size']
}

const DefaultLogo = ({ title, textSize, ...props }: DefaultLogoProps) => {
  return (
    <Box background={'clrBoxGradient'} round="large" {...props} direction="row" justify="center" align="center">
      <Text size={'small'} color={'clrPrimary'}>
        {title}
      </Text>
    </Box>
  )
}

export default DefaultLogo
