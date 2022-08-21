import React, { useContext, useEffect, useRef, useState } from 'react'
import { Box, Text, Image, ResponsiveContext } from 'grommet'
import { NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'
import ToggleTheme from './ToggleTheme'
import ConnectWallet from 'components/ConnectWallet/ConnectWallet'
import LogoLight from '../../../public/images/umee-logo-light.svg'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import NavBarOpen from './NavBarOpen'

export interface INavItem {
  title: string
  url?: string
  link?: string
}

export const Nav = () => {
  const navItems: INavItem[] = [
    {
      title: 'Markets',
      url: '/markets',
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
    },
    {
      title: 'Stake',
      url: '/stake',
    },
    {
      title: 'Vote',
      url: '/governance',
    },
  ]

  const location = useLocation()
  const size = useContext(ResponsiveContext)
  const { themeMode } = useTheme()
  const nav = useRef<HTMLDivElement>(null)
  const [tabPos, setTabPos] = useState<number>(0)

  useEffect(() => {
    navItems.forEach((item, index) => {
      if (item.url == location.pathname) setTabPos(index)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    let lastScrollY = 0
    const navNode = nav.current

    const scrolled = () => {
      if (navNode) {
        let sy = window.pageYOffset
        const navHeight = navNode.offsetHeight
        const delta = navHeight
        if (Math.abs(lastScrollY - sy) > delta) {
          if (sy > lastScrollY && sy > navHeight) {
            navNode.classList.add('up')
          } else if (sy < lastScrollY) {
            navNode.classList.remove('up')
          }
          lastScrollY = sy
        }
      }
    }

    window.addEventListener('scroll', scrolled, true)

    return () => window.removeEventListener('scroll', scrolled, true)
  }, [])

  return (
    <Box
      ref={nav}
      className={`navbar ${themeMode === Theme.light && 'light'}`}
      background="clrPrimary"
      direction="row"
      justify="center"
      pad={{
        vertical: size === 'small' ? 'medium' : 'small',
        horizontal: size === 'small' ? 'large' : size === 'medium' || size === 'large' ? 'medium' : 'large',
      }}
    >
      <Box className="content" justify="between" direction="row" align="center">
        <NavLink to="/" className="umee-logo">
          <Image className="umee-logo-img" src={LogoLight} alt="Umee Logo" />
        </NavLink>
        <Box direction="row" align="center">
          {size !== 'small' && size !== 'medium' && (
            <Box direction="row">
              <Box className="menu-tab" style={{ top: `calc(100% / 6 * ${tabPos})` }} />
              {navItems &&
                navItems.map((navItem, i) => (
                  <Box key={i}>
                    {navItem.url && (
                      <NavLink exact to={navItem.url ? navItem.url : '#'}>
                        <Text
                          size="small"
                          className="nav-link"
                          color={location.pathname === navItem.url ? 'clrWhite' : 'clrMidGreyOnNavy'}
                        >
                          {navItem.title}
                        </Text>
                      </NavLink>
                    )}
                    {navItem.link && (
                      <a href={navItem.link} target="_blank" rel="noreferrer">
                        <Text
                          size="small"
                          className="nav-link"
                          color={location.pathname === navItem.url ? 'clrWhite' : 'clrMidGreyOnNavy'}
                        >
                          {navItem.title}
                        </Text>
                      </a>
                    )}
                  </Box>
                ))}
            </Box>
          )}
          {size !== 'small' && size !== 'medium' && (
            <Box margin={{ left: 'small' }}>
              <ConnectWallet />
            </Box>
          )}
          <Box margin={{ left: 'medium' }}>
            <ToggleTheme />
          </Box>
          {(size === 'small' || size === 'medium') && (
            <Box margin={{ left: 'medium' }}>
              <NavBarOpen defaultTheme={Theme.dark} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
