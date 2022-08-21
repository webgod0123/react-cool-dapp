import React from 'react'
import { Box, Image } from 'grommet'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import DarkSwitch from '../../../public/images/sidebar/dark-mode.svg'
import LightSwitch from '../../../public/images/sidebar/light-mode.svg'
import './ToggleTheme.css'

const ToggleTheme = () => {
  const { themeMode, setTheme } = useTheme()

  return (
    <Box onClick={() => setTheme(themeMode === Theme.light ? Theme.dark : Theme.light)}>
      <Box className={`toggle ${themeMode === Theme.light ? 'light' : ''}`} />
    </Box>
  )
}

export default ToggleTheme
