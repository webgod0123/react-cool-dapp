import React, { useContext } from 'react'
import { BoxProps, Box, Text, ResponsiveContext } from 'grommet'

interface MenusProps extends BoxProps {
  title: string
  menus: {
    title: string
    link: string
  }[]
}

const Menus = ({ title, menus, ...props }: MenusProps) => {
  const size = useContext(ResponsiveContext)

  return (
    <Box {...props}>
      <Text size="small" color={'clrWhite'} className="footer-menus-title">
        {title}
      </Text>
      <Box pad={{ top: 'medium' }}>
        {menus.map((menu, index) => (
          <a href={menu.link} key={index} target="_blank" rel="noreferrer">
            <Box margin={{ top: size === 'small' ? 'medium' : 'small' }}>
              <Text size="small" className="footer-menu" color={'clrNavLinkDefault'}>
                {menu.title}
              </Text>
            </Box>
          </a>
        ))}
      </Box>
    </Box>
  )
}

export default Menus
