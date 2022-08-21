import { Box, Text } from 'grommet'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import React from 'react'

interface VotePenalProps {
  color: string
  title: string
  value: string
}

const VotePanel: React.FC<VotePenalProps> = ({ color, title, value }) => {
  const { themeMode } = useTheme()

  return (
    <Box round="5px" border={{ size: themeMode === Theme.light ? '2px' : '1px', color: color }} pad="small" flex>
      <Text color="clrTextPrimary" weight={'bold'} size="xsmall">
        {title}
      </Text>
      <Text margin={{ top: 'xsmall' }} color="clrTextPrimary" size="small">
        {value}%
      </Text>
    </Box>
  )
}

export default VotePanel
