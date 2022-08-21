import { Image } from 'grommet'
import * as React from 'react'

interface ITokenLogo {
  symbol?: string;
  width?: string;
  height?: string;
  src?: string;
}

const TokenLogo = ({ symbol, width, height, src }: ITokenLogo) => {
  return (
    <>
      <Image alt={symbol} src={src} width={width} height={height} />
    </>
  )
}

export default TokenLogo
