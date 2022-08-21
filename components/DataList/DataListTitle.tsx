import React, { useContext } from 'react'
import { Box, ResponsiveContext, Text } from 'grommet'

export interface DataListTitleProps {
  title: string
  children?: React.ReactNode
}

interface Props {
  title: DataListTitleProps
}

const DataListTitle = ({ title }: Props) => {
  const size = useContext(ResponsiveContext)

  return (
    <Box
      pad={{ vertical: 'small' }}
      {...(size === 'small' ? { margin: { bottom: 'large', top: 'xlarge' } } : {})}
      className={size === 'small' ? '' : 'border-gradient-bottom'}
      align={'center'}
      width="full"
      direction='row'
      gap='xxsmall'
    >
      <Text color="clrTextPrimary" size={'medium1'} className="font-moret">
        {title.title}
      </Text>
      {title.children}
    </Box>
  )
}

export default DataListTitle
