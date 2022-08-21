import React, { useContext } from 'react'
import { Box, Image, ResponsiveContext, Text } from 'grommet'
import UmeeLogo from '../../../public/images/umee-logo-light.svg'
import './footer.css'
import MediumIcon from '../../../public/images/social-icons/medium.svg'
import TwitterIcon from '../../../public/images/social-icons/twitter.svg'
import DiscordIcon from '../../../public/images/social-icons/discord.svg'
import GithubIcon from '../../../public/images/social-icons/github.svg'
import TelegramIcon from '../../../public/images/social-icons/telegram.svg'
import RedditIcon from '../../../public/images/social-icons/reddit.svg'
import SocialLink from './SocialLink'
import Menus from './Menus'

const socialLinks = [
  { img: MediumIcon, link: 'https://medium.com/umeeblog' },
  {
    img: TwitterIcon,
    link: 'https://twitter.com/Umee_CrossChain',
  },
  { img: DiscordIcon, link: 'https://discord.gg/umee' },
  { img: GithubIcon, link: 'https://github.com/umee-network' },
  { img: TelegramIcon, link: 'https://t.me/umeecrosschain' },
  {
    img: RedditIcon,
    link: 'https://www.reddit.com/r/UmeeCrossChain',
  },
]

const Footer = () => {
  const size = useContext(ResponsiveContext)

  return (
    <Box
      background={'clrPrimary'}
      direction="row"
      justify="center"
      border={{ side: 'top', color: 'clrSideNavBorder' }}
      pad={{
        vertical: size === 'small' ? 'xlarge' : 'large',
        horizontal: size === 'small' ? 'large' : size === 'medium' || size === 'large' ? 'medium' : 'large',
      }}
    >
      <Box className="content" direction="row" wrap>
        <Box className="footer-left" pad={{ right: 'medium' }}>
          <Box direction="row">
            <Image className="footer-logo" src={UmeeLogo} alt="umee logo" />
          </Box>
          <Text color="clrNavLinkDefault" size="small" margin={{ top: 'small' }}>
            Join us in building the future of cross chain DeFi!
          </Text>
          <Box margin={{ top: 'medium' }} direction="row">
            {socialLinks.map((link, index) => (
              <SocialLink margin={{ right: 'xsmall' }} icon={link.img} link={link.link} key={index} />
            ))}
          </Box>
        </Box>
        <Box
          margin={{ top: size === 'medium' || size === 'small' ? 'large' : '' }}
          direction={size === 'small' ? 'column' : 'row'}
          justify="between"
          className="footer-menus-content"
          pad={{ horizontal: size === 'medium' || size === 'small' ? '' : 'medium' }}
        >
          <Menus
            title="PROTOCOL"
            margin={{ top: size === 'small' ? 'large' : '' }}
            menus={[
              { title: 'Markets', link: 'https://app.umee.cc/' },
              { title: 'Governance', link: 'https://wallet.keplr.app/#/umee/governance' },
              { title: 'Umeemania', link: 'https://www.umee.cc/umeemania' },
              { title: 'Github', link: 'https://github.com/umee-network' },
            ]}
          />
          <Menus
            title="DOCUMENTATION"
            margin={{ top: size === 'small' ? 'large' : '' }}
            menus={[
              { title: 'Docs', link: 'https://docs.umee.cc/umee/' },
              { title: 'Faq', link: 'https://www.umee.cc/faqs' },
            ]}
          />
          <Menus
            title="CONNECT"
            margin={{ top: size === 'small' ? 'large' : '' }}
            menus={[
              { title: 'Careers', link: 'https://www.umee.cc/careers' },
              {
                title: 'Media Kit',
                link: 'https://drive.google.com/drive/folders/1A9G2HM5RAka4FLGyVvRC4NeazpAYBh7Z?usp=sharing',
              },
            ]}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
