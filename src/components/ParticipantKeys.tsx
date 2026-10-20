import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import type { ParticipantSummary } from '../lib/asymmetric'

export function ParticipantKeys({ participants }: { participants: ParticipantSummary[] }) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
      {participants.map((person) => (
        <Box as="section" aria-label={`${person.owner}'s keys and values`} key={person.owner} p="20px" borderWidth="1px" borderColor="var(--border)" borderTopWidth="3px" borderTopColor="var(--accent)" borderRadius="12px" minW="0">
          <Heading as="h3" fontSize="lg" color="var(--accent)">{person.owner}'s side</Heading>
          <Text mt="4px" fontSize="sm" color="var(--text)">{person.role}</Text>
          {person.entries.map((entry, index) => (
            <Box key={index} mt="14px" pt="12px" borderTopWidth="1px" borderColor="var(--border)">
              <Text fontSize="xs" fontWeight="semibold" color="var(--text)">{entry.label}</Text>
              <Text mt="6px" fontSize="sm" color="var(--text-h)" overflowWrap="anywhere">{entry.value}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </SimpleGrid>
  )
}
