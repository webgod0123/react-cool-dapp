import React from 'react'
import HamburgerIcon from '../../public/images/Hamburger.svg'
import { Image } from 'grommet'
import HoverEffect from './HoverEffect'
import { Theme } from 'lib/hooks/theme/context'

const MenuOpen = ({ width, onClick, defaultTheme }: { width?: string; onClick?: () => void; defaultTheme?: Theme }) => {
  return (
    <HoverEffect defaultTheme={defaultTheme} focusIndicator={false} onClick={onClick} pad="12px" round="small">
      <Image src={HamburgerIcon} width={width} alt="menu open" />
    </HoverEffect>
  )
}

export default MenuOpen
