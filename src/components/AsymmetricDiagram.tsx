import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, Send, UserRound } from 'lucide-react'
import type { MessageExchange } from '../lib/asymmetric'

export function AsymmetricDiagram({ algorithm, publicKey, exchange }: { algorithm: string; publicKey: string; exchange: MessageExchange }) {
  const cards = [
    { title: 'Alice · sender', icon: UserRound, lines: exchange.sender },
    { title: 'Message in transit', icon: Send, lines: exchange.channel },
    { title: 'Bob · recipient', icon: LockKeyhole, lines: exchange.receiver },
  ]
  return (
    <Box role="figure" aria-label={`${algorithm} message exchange diagram: Alice sends to Bob`} mt="16px" p={{ base: '16px', md: '20px' }} borderWidth="1px" borderColor="var(--border)" borderRadius="12px">
      <Flex gap="8px" align="center" color="var(--accent)">
        <KeyRound size={18} aria-hidden="true" />
        <Text fontWeight="semibold">First, Bob creates his key pair.</Text>
      </Flex>
      <Text mt="6px" fontSize="sm" color="var(--text)">Bob keeps his private key. He shares his public key with Alice.</Text>
      <Grid mt="16px" templateColumns="auto minmax(0, 1fr) auto" gap="12px" alignItems="center" p="12px" bg="var(--accent-bg)" borderRadius="8px">
        <Text fontSize="sm" fontWeight="semibold">Alice</Text>
        <Box textAlign="center" minW="0">
          <Text fontSize="xs" color="var(--text)">Bob’s public key</Text>
          <Text fontFamily="mono" fontSize="sm" color="var(--accent)" overflowWrap="anywhere">{publicKey}</Text>
          <Box position="relative" h="20px" mx="4px" aria-hidden="true">
            <Box position="absolute" top="9px" left="0" right="0" borderTopWidth="1px" borderColor="var(--accent)" />
            <ArrowLeft size={20} style={{ position: 'absolute', left: '-4px', top: 0, color: 'var(--accent)' }} />
          </Box>
        </Box>
        <Text fontSize="sm" fontWeight="semibold">Bob</Text>
      </Grid>
      <Grid mt="20px" templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 28px minmax(0, 0.85fr) 28px minmax(0, 1fr)' }} gap="8px" alignItems="stretch">
        {cards.flatMap((card, index) => {
          const Icon = card.icon
          const node = (
            <Box key={card.title} p="14px" borderWidth="1px" borderColor="var(--border)" borderRadius="10px" bg="var(--bg)" minW="0">
              <Flex gap="8px" align="center" color="var(--accent)" mb="10px"><Icon size={17} aria-hidden="true" /><Text fontSize="sm" fontWeight="semibold">{card.title}</Text></Flex>
              {card.lines.map((line, i) => <Text key={i} mt={i ? '8px' : '0'} fontSize="sm" color="var(--text-h)" overflowWrap="anywhere">{line}</Text>)}
            </Box>
          )
          return index === 0 ? [node] : [
            <Flex key={`arrow-${index}`} align="center" justify="center" minH="28px" color="var(--accent)" aria-hidden="true"><Box transform={{ base: 'rotate(90deg)', lg: 'none' }}><ArrowRight size={24} /></Box></Flex>, node,
          ]
        })}
      </Grid>
    </Box>
  )
}
