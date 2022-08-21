import React from 'react'
import { Box } from 'grommet'
import { AssetType } from '../MarketsDataList'
import { Theme, useTheme } from 'lib/hooks/theme/context'
import { TooltipTitle, TooltipContent } from 'components/common/InfoTooltip/InfoTooltip'

const SuccessIcon = () => {
  const { themeMode } = useTheme()
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="8.5" r="8.5" fill="url(#paint0_linear_4_185)" />
      <path
        d="M5 9L7.5 11.5L12 7"
        stroke={themeMode === Theme.light ? '#A0A1BA' : '#464869'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4_185"
          x1="-2.08489e-07"
          y1="2.86943"
          x2="18.6238"
          y2="7.7699"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DFB2FF" />
          <stop offset="0.447917" stopColor="#BCC5F9" />
          <stop offset="1" stopColor="#4EFFE5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const FailedIcon = () => {
  const { themeMode } = useTheme()
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="8.5" r="8.5" fill={themeMode === Theme.light ? '#464869' : '#070927'} />
      <path d="M5 5.00001L12 12" stroke="#A0A1BA" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 5L5 12" stroke="#A0A1BA" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const AssetTooltip = ({ assetType }: { assetType: AssetType }) => {
  return (
    <>
      <TooltipTitle text={assetType === 'collateral' ? 'Collateral' : 'Leverage'} />
      <TooltipContent
        text={
          assetType === 'collateral'
            ? 'Assets that can be supplied and used as collateral to borrow other assets. These can also be supplied and borrowed like all other assets.  '
            : 'Assets that can be supplied to earn APY and borrowed, but cannot be used as collateral to borrow other assets.'
        }
        margin={{ top: 'small' }}
      />
      <Box margin={{ top: 'xsmall' }} direction="row">
        <a
          className="gradient-text border-gradient-bottom border-gradient-bottom-1"
          href={assetType === 'collateral' ? 'https://umeeversity.umee.cc/users/using-the-web-app/common-terms.html#collateral-assets' : 'https://umeeversity.umee.cc/users/using-the-web-app/common-terms.html#leverage-assets'}
          target={'_blank'}
          style={{ fontWeight: 'bold' }}
        >
          Read more
        </a>
      </Box>
      <Box margin={{ top: 'small' }}>
        <TooltipTitle text="Actions Allowed" />
        <Box direction="row" align="center">
          <SuccessIcon />
          <TooltipContent text="Supply" margin={{ left: 'small', vertical: 'xxsmall' }} />
        </Box>
        <Box direction="row" align="center">
          <SuccessIcon />
          <TooltipContent text="Borrow" margin={{ left: 'small', vertical: 'xxsmall' }} />
        </Box>
        <Box direction="row" align="center">
          {assetType === 'collateral' ? <SuccessIcon /> : <FailedIcon />}
          <TooltipContent text="Collateral" margin={{ left: 'small', vertical: 'xxsmall' }} />
        </Box>
      </Box>
    </>
  )
}

export default AssetTooltip
