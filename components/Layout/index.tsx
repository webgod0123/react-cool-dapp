import React, { useContext } from 'react'
import { Box, ResponsiveContext } from 'grommet'
import Footer from './Footer'
import { Nav } from './NavBar/Nav'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const size = useContext(ResponsiveContext)
  
  return (
    <>
      <Nav />
      <Box
        background="clrBackground"
        className="markets-container"
        direction="row"
        justify="center"
        overflow="hidden"
        pad={{
          horizontal: size === 'small' ? 'large' : size === 'medium' || size === 'large' ? 'medium' : 'large',
        }}
      >
        <Box className="content">{children}</Box>
      </Box>
      <Footer />
    </>
  )
}

export default Layout
