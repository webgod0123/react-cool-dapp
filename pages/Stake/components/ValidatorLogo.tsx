import React from 'react'
import { Box, Text } from 'grommet'
import Spinner from 'components/common/Loading/Spinner'
import TokenLogo from 'components/TokenLogo'
import DefaultLogo from './DefaultLogo'

interface ValidatorLogoProps {
  title: string
  imgUrl?: string
  textSize?: string
  fontFamily?: string
  width?: string
  height?: string
  color?: string
  isList?: boolean
}

const ValidatorLogo: React.FC<ValidatorLogoProps> = ({
  title,
  imgUrl,
  textSize,
  fontFamily,
  width,
  height,
  color,
  isList,
}) => {
  return (
    <Box direction="row" align="center" justify="start" wrap>
      {imgUrl !== undefined ? (
        <Box
          style={{ borderRadius: '50%', overflow: 'hidden' }}
          width={width || '36px'}
          height={height || '36px'}
          border={{ color: 'clrBorder' }}
          margin={{ right: 'small' }}
        >
          {imgUrl ? (
            <TokenLogo symbol={title} width={'100%'} height={'100%'} src={imgUrl} />
          ) : (
            <DefaultLogo
              textSize={!isList ? 'medium1' : 'medium'}
              width={width || '36px'}
              height={height || '36px'}
              title={title.charAt(0).toUpperCase()}
            />
          )}
        </Box>
      ) : (
        <Spinner margin={{ left: 'xsmall' }} />
      )}

      <Text
        size={textSize || 'small'}
        style={{ fontFamily: fontFamily }}
        color={color || 'clrTextPrimary'}
      >
        {title}
      </Text>
    </Box>
  )
}

export default ValidatorLogo
