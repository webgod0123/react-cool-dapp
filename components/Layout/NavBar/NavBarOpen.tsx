import React, { useState } from 'react'
import MobileNav from './MobileNav'
import MenuOpen from 'components/common/MenuOpen'
import { Theme } from 'lib/hooks/theme/context'

const NavBarOpen = ({ defaultTheme }: { defaultTheme?: Theme }) => {
  const [navOpen, setNavOpen] = useState<boolean>(false)

  return (
    <>
      <MenuOpen defaultTheme={defaultTheme} onClick={() => setNavOpen(true)} />
      <MobileNav navOpen={navOpen} close={() => setNavOpen(false)} />
    </>
  )
}

export default NavBarOpen
