import React from 'react'
import { Box, BoxProps, Image } from 'grommet'

interface SocialLinkProps extends BoxProps {
  icon: any
  link: string
}

const SocialLink = ({ icon, link, ...props }: SocialLinkProps) => {
  return (
    <a href={link} target="_blank" rel="noreferrer">
      <Box {...props} className="footer-social-link">
        <Image src={icon} alt="social link" />
      </Box>
    </a>
  )
}

export default SocialLink
