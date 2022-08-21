import React from 'react'
import styled from '@emotion/styled'
import { Box, BoxProps, Text } from 'grommet'
import { Theme, useTheme } from 'lib/hooks/theme/context'

interface InfoTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
}

const ToolTipContent = styled.div`
  display: flex;
  position: relative;
  cursor: pointer;
  line-height: 0;

  &:hover .tooltip {
    opacity: 1;
    z-index: 1000;
    bottom: 100%;
  }
`

const ToolipContainer = styled.div`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 20px);
  transform: translateX(-50%);
  transition: 0.2s;
  opacity: 0;
  z-index: -1;
  padding-bottom: 10px;
`

const Tooltip = styled(Box)`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  padding: 24px;
  width: 280px;
`

const ToolTipText = styled(Box)`
  font-size: 13px !important;

  span {
    line-height: 150% !important;
  }
`

const TooltipArrow = styled.div<{ darkMode?: boolean }>`
  width: 20px;
  height: 10px;
  position: absolute;
  top: calc(100% - 10px);
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    ${({ darkMode = false }) => ({
    background: darkMode ? 'var(--umee-dark-grey-on-navy)' : 'var(--umee-mid-grey-on-navy)',
  })}
    transform: translateX(-50%) translateY(-50%) rotate(45deg);
    top: 0;
    left: 50%;
    box-shadow: rgb(0 0 0 / 20%) 0px 0px 2px, rgb(0 0 0 / 10%) 0px 2px 10px;
  }
`

export const TooltipTitle = ({ text }: { text: string }) => (
  <Text size="small" weight={'bold'} color="clrTextPrimary">
    {text}
  </Text>
)

export const TooltipContent = ({ text, margin }: { text: string; margin?: BoxProps['margin'] }) => (
  <Text size="13px" color="clrTextSecondary" margin={margin}>
    {text}
  </Text>
)

export const TooltipContainer = ({ title, content }: { title: string; content: string }) => (
  <>
    <TooltipTitle text={title} />
    <TooltipContent text={content} />
  </>
)

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, children }) => {
  const { themeMode } = useTheme()

  return (
    <Box direction="row">
      <ToolTipContent>
        {children}
        <ToolipContainer
          className="tooltip"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
          }}
        >
          <Tooltip background={'clrBorder'} width={{ max: '280px' }}>
            <TooltipArrow darkMode={themeMode === Theme.dark} />
            <ToolTipText>{content}</ToolTipText>
          </Tooltip>
        </ToolipContainer>
      </ToolTipContent>
    </Box>
  )
}

export default InfoTooltip
