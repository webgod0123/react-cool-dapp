import React, { useContext, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Box, ResponsiveContext, Text } from 'grommet'
import { bigNumberToNumber, bigNumberToString } from 'lib/number-utils'
import { useStake } from 'api/stake'
import { ProposalData, ProposalDataStatus, ProposalType, VotedType, VoteResultStatus } from 'api/stake/data'
import { InfoBarBody } from 'components'
import { PrimaryBtn } from 'components/common'
import Modal from 'components/common/Modals/Modal'
import { ProposalStatusColor, VoteResultColor } from 'api/stake/data'
import VoteChart from './VoteChart'
import VotePanel from './VotePanel'

var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

interface ProposalDetailProps {
  onClose: () => void
  proposal_id: string
  onVote: (id: string) => void
}

const ProposalDetail: React.FC<ProposalDetailProps> = ({ onClose, proposal_id, onVote }) => {
  const size = useContext(ResponsiveContext)
  const [proposal, setProposal] = useState<ProposalData>()
  const { Proposals, TotalBonded } = useStake()

  useEffect(() => {
    if (Proposals) {
      Proposals.map((proposal) => {
        if (proposal.proposal_id.toString() === proposal_id) setProposal(proposal)
      })
    }
  }, [Proposals, proposal_id])

  const turnout = useMemo(() => {
    let value = '0'
    if (proposal && proposal.total_vote) {
      if (!TotalBonded.isZero()) {
        const numTotalVote = bigNumberToNumber(proposal.total_vote, 6)
        const numTotalBonded = bigNumberToNumber(TotalBonded, 6)
        value = ((numTotalVote / numTotalBonded) * 100).toFixed(2)
      }
    }
    return value
  }, [TotalBonded, proposal])

  const urlify = (text: string) => {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
    let str = text.replace(/\/n/g, '\n').split(/\\n/).join('\n')
    str = str.replace(urlRegex, function (url) {
      return '<a target="_blank" href="' + url + '">' + url + '</a>'
    })

    return str
  }

  return proposal ? (
    <Modal onClose={onClose} className="proposal-detail-modal">
      <Box>
        <Box
          width={'100%'}
          border={{ size: '1px', color: 'clrSideNavBorder' }}
          round="5px"
          pad={size === 'small' ? 'medium' : 'small'}
          background="clrModalBackground"
        >
          <Box
            direction={size === 'medium' || size === 'small' ? 'column' : 'row'}
            justify="between"
            align={size === 'medium' || size === 'small' ? 'start' : 'center'}
          >
            <Text color="clrTextPrimary" size="24px" margin={{ right: 'large' }} style={{ fontFamily: 'Moret' }}>
              #{proposal.proposal_id} {proposal.title}
            </Text>
            <Box>
              {proposal.status === ProposalType.VOTING_PERIOD ? (
                <PrimaryBtn
                  text="Vote"
                  pad={{ vertical: 'xsmall', horizontal: 'medium' }}
                  textSize="small"
                  round="large"
                  onClick={() => onVote(proposal.proposal_id.toString())}
                  disabled={!proposal.voted}
                />
              ) : (
                <Text color="clrTextPrimary" size="xsmall" style={{ color: ProposalStatusColor[proposal.status] }}>
                  {proposal.voted && proposal.voted !== VotedType.NEVER ? 'Voted' : ProposalDataStatus[proposal.status]}
                </Text>
              )}
            </Box>
          </Box>
          <Text color="clrTextPrimary" margin={{ top: 'xsmall' }} size="xsmall">
            Submitted {dayjs(proposal.submit_time).format('MM/DD/YYYY h:mm:ss A')}
          </Text>
          <Box margin={{ top: 'medium' }} style={{ maxHeight: '45vh', overflow: 'auto' }}>
            <Text
              color="clrTextPrimary"
              size="small"
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: urlify(proposal.description) }}
            />
          </Box>
        </Box>
        <Box
          width={'100%'}
          border={{ size: '1px', color: 'clrSideNavBorder' }}
          round="5px"
          pad={size === 'small' ? 'medium' : 'small'}
          background="clrModalBackground"
          margin={{ top: size === 'small' || size === 'medium' ? 'medium' : 'small' }}
        >
          <Text color="clrTextPrimary" size="xsmall">
            VOTING
          </Text>
          <Box
            margin={{ top: 'medium' }}
            direction={size === 'small' || size === 'medium' ? 'column' : 'row'}
            flex
            wrap
          >
            <Box width={size === 'medium' || size === 'small' ? '100%' : '20%'}>
              <Text color="clrTextPrimary" size="xsmall">
                Total Votes
              </Text>
              <Text color="clrTextPrimary" size="small" margin={{ top: 'xsmall' }}>
                {bigNumberToNumber(proposal.total_vote, 6).toLocaleString()} ({turnout}%)
              </Text>
            </Box>
            <InfoBarBody
              gap={'medium'}
              margin={{ top: size === 'medium' || size === 'small' ? 'medium' : '' }}
              direction={size === 'medium' || size === 'small' ? 'column' : 'row'}
            >
              {proposal.final_tally_result.map((result, index) => (
                <VotePanel
                  key={index}
                  color={VoteResultColor[result.label]}
                  title={VoteResultStatus[result.label]}
                  value={result.value}
                />
              ))}
            </InfoBarBody>
          </Box>
          <Box margin={{ top: 'medium' }}>
            <VoteChart
              turnout={turnout}
              tally={proposal.final_tally_result}
              totalVoted={bigNumberToString(proposal.total_vote, 6)}
              totalBonded={bigNumberToString(TotalBonded, 6)}
            />
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Text size="xsmall" color="clrTextPrimary">
              Voting End {dayjs(proposal.voting_end_time).format('MM/DD/YYYY h:mm:ss A')}
            </Text>
          </Box>
        </Box>
      </Box>
    </Modal>
  ) : null
}

export default ProposalDetail
