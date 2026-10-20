import { Box, Flex, Heading, Text, chakra } from '@chakra-ui/react'
import type { CalculationStep } from '../lib/asymmetric'

export type NumberedStep = CalculationStep & { number?: number }

function Step({ step, number }: { step: CalculationStep; number: number }) {
  return (
    <Box p="16px 20px" borderWidth="1px" borderColor="var(--border)" borderRadius="12px" minW="0">
      <Flex gap="12px" align="flex-start">
        <Flex flexShrink="0" w="28px" h="28px" align="center" justify="center" bg="var(--accent-bg)" color="var(--accent)" borderRadius="full" fontWeight="semibold" fontSize="sm">{number}</Flex>
        <Box>
          <Text fontSize="xs" color="var(--accent)" fontWeight="semibold">{step.actor}</Text>
          <Text fontWeight="semibold" color="var(--text-h)">{step.label}</Text>
        </Box>
      </Flex>
      <Text mt="12px" fontSize="sm" color="var(--text)">{step.explanation}</Text>
      {step.equations.map((equation, i) => <Text key={i} mt="8px" fontFamily="mono" fontSize="sm" color="var(--text-h)" overflowWrap="anywhere">{equation}</Text>)}
      {step.detail && (
        <chakra.details open mt="12px" borderTopWidth="1px" borderColor="var(--border)" pt="12px">
          <Box as="summary" cursor="pointer" fontSize="sm" fontWeight="medium" color="var(--accent)">{step.detail.label}</Box>
          <Box as="ol" listStyleType="none" m="0" p="0">
            {step.detail.equations.map((equation, i) => (
              <Box as="li" key={i} mt="8px" display="flex" gap="10px" alignItems="flex-start">
                <Text flexShrink="0" fontSize="xs" fontFamily="mono" color="var(--accent)">{number}.{i + 1}</Text>
                <Text fontFamily="mono" fontSize="sm" color="var(--text)" overflowWrap="anywhere" minW="0">{equation}</Text>
              </Box>
            ))}
          </Box>
        </chakra.details>
      )}
    </Box>
  )
}

export function CalculationSteps({ steps, separateActors = false }: { steps: NumberedStep[]; separateActors?: boolean }) {
  const numbered = steps.map((step, index) => ({ ...step, number: step.number ?? index + 1 }))
  const groups: { actor: CalculationStep['actor']; steps: typeof numbered }[] = []
  for (const step of numbered) {
    const last = groups.at(-1)
    if (last && last.actor === step.actor) last.steps.push(step)
    else groups.push({ actor: step.actor, steps: [step] })
  }
  if (!separateActors) return <Flex direction="column" gap="12px">{numbered.map((step) => <Step key={step.number} step={step} number={step.number} />)}</Flex>
  return (
    <Flex direction="column" gap="24px">
      {groups.map((group, index) => (
        <Box as="section" key={index} aria-label={`${group.actor} working`} p={{ base: '12px', md: '20px' }} borderWidth="1px" borderColor="var(--border)" borderLeftWidth="3px" borderLeftColor="var(--accent)" borderRadius="12px">
          <Heading as="h3" mb="14px" fontSize="md" color="var(--accent)">{group.actor === 'Alice' || group.actor === 'Bob' ? `${group.actor}'s working` : 'Public exchange between Alice and Bob'}</Heading>
          <Flex direction="column" gap="12px">{group.steps.map((step) => <Step key={step.number} step={step} number={step.number} />)}</Flex>
        </Box>
      ))}
    </Flex>
  )
}
