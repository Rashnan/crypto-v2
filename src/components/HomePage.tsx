import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { Calculator, ExternalLink, Variable } from 'lucide-react'

interface PageCard {
  title: string
  description: string
  example: string
  to: string
  icon: typeof Variable
  accentBg?: string
}

interface Section {
  label: string
  pages: PageCard[]
}

const sections: Section[] = [
  {
    label: 'Basic',
    pages: [
      {
        title: 'GCD',
        description: 'Extended Euclidean algorithm — compute gcd(a, b) with full Bézout coefficients.',
        example: 'gcd(240, 46) = 2,  s = −9,  t = 47',
        to: '/basic/gcd',
        icon: Variable,
      },
      {
        title: 'Diophantine',
        description: 'Solve linear Diophantine equations ax + by = c for all integer solutions.',
        example: '240x + 46y = 10  →  x = −45 + 23k,  y = 235 − 120k',
        to: '/basic/diophantine',
        icon: Calculator,
      },
    ],
  },
]

function Card({ page }: { page: PageCard }) {
  const Icon = page.icon
  return (
    <Link to={page.to} style={{ textDecoration: 'none' }}>
      <Box
        p="20px 24px"
        borderWidth="1px"
        borderColor="var(--border)"
        borderRadius="14px"
        bg="var(--bg)"
        _hover={{ boxShadow: '0 0 0 1px var(--accent)', borderColor: 'var(--accent)' }}
        transition="box-shadow 120ms ease, border-color 120ms ease"
        cursor="pointer"
        h="full"
        display="flex"
        flexDirection="column"
        position="relative"
      >
        <Box position="absolute" top="16px" right="16px" color="var(--accent)" opacity={0.5}>
          <ExternalLink size={14} />
        </Box>
        <Flex align="center" gap="10px" mb="8px">
          <Flex
            w="32px"
            h="32px"
            align="center"
            justify="center"
            borderRadius="8px"
            bg="var(--accent-bg)"
            color="var(--accent)"
          >
            <Icon size={18} />
          </Flex>
          <Heading as="h3" fontSize="md" fontWeight="semibold" color="var(--text-h)">
            {page.title}
          </Heading>
        </Flex>
        <Text fontSize="sm" color="var(--text)" mb="12px" flex="1">
          {page.description}
        </Text>
        <Box
          p="10px 14px"
          fontFamily="mono"
          fontSize="xs"
          color="var(--accent)"
          bg="var(--accent-bg)"
          borderRadius="8px"
          whiteSpace="pre-wrap"
        >
          {page.example}
        </Box>
      </Box>
    </Link>
  )
}

export function HomePage() {
  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        Crypto
      </Heading>
      <Text mt="8px" color="var(--text)">
        Tools for number theory and cryptography.
      </Text>

      {sections.map((section) => (
        <Box key={section.label} mt="32px">
          <Heading as="h2" fontSize="lg" m="0" mb="16px" color="var(--text-h)">
            {section.label}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
            {section.pages.map((page) => (
              <Card key={page.to} page={page} />
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Box>
  )
}
