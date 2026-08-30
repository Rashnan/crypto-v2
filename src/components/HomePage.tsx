import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import { Braces, ExternalLink, FunctionSquare, Grid3x3, Plus, Sigma, Variable, X } from 'lucide-react'

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
        title: 'Matrix Determinant',
        description: 'Compute det(A) modulo m and inspect every cofactor-expansion term.',
        example: 'det([[6,24,1],[13,16,10],[20,17,15]]) ≡ 25 (mod 26)',
        to: '/basic/matrix-determinant',
        icon: Grid3x3,
      },
    ],
  },
  {
    label: 'Inverses',
    pages: [
      {
        title: 'Additive Inverse',
        description: 'The unique y with (x + y) mod m = 0, for any element of ℤₘ.',
        example: 'additive inverse of 3 mod 8 = 5',
        to: '/modular/additive-inverse',
        icon: Plus,
      },
      {
        title: 'Multiplicative Inverse',
        description: 'The unique y with (x·y) mod m = 1, which exists iff gcd(x, m) = 1.',
        example: '3·5 = 15 ≡ 1 (mod 7), so 3⁻¹ mod 7 = 5',
        to: '/modular/multiplicative-inverse',
        icon: X,
      },
      {
        title: 'Matrix Inverse',
        description: 'Invert a matrix over ℤₘ via A⁻¹ = adj(A)·(det A)⁻¹, with full cofactor steps.',
        example: 'over ℤ₅,  [[3,4],[2,3]]⁻¹ = [[3,1],[3,3]]',
        to: '/modular/matrix-inverse',
        icon: Grid3x3,
      },
    ],
  },
  {
    label: 'Equations',
    pages: [
      {
        title: 'Linear Diophantine',
        description: 'Solve linear Diophantine equations ax + by = c for all integer solutions.',
        example: '240x + 46y = 10  →  x = −45 + 23k,  y = 235 − 120k',
        to: '/diophantine/linear',
        icon: Sigma,
      },
      {
        title: 'Single Variable',
        description: 'Solve a·x ≡ b (mod m), with exactly d = gcd(a, m) solutions when one exists.',
        example: '3x ≡ 1 (mod 7)  →  x ≡ 5 (mod 7)',
        to: '/diophantine/single-var',
        icon: FunctionSquare,
      },
      {
        title: 'Simultaneous',
        description: 'Solve a system x ≡ aᵢ (mod mᵢ) using the Chinese Remainder Theorem.',
        example: 'x ≡ 2 (mod 3),  x ≡ 3 (mod 5)  →  x ≡ 8 (mod 15)',
        to: '/diophantine/simultaneous',
        icon: Braces,
      },
    ],
  },
  {
    label: 'Ciphers',
    pages: [
      {
        title: 'Additive Cipher',
        description: 'Shift each letter by a fixed key modulo 26.',
        example: 'ATTACK + 7  →  HAAHJR',
        to: '/ciphers/additive',
        icon: Plus,
      },
      {
        title: 'Multiplicative Cipher',
        description: 'Multiply each letter by an invertible key modulo 26.',
        example: 'HELLO × 5  →  JUDDM',
        to: '/ciphers/multiplicative',
        icon: X,
      },
      {
        title: 'Affine Cipher',
        description: 'Combine multiplication by a with a shift by b modulo 26.',
        example: 'E(x) = (5x + 8) mod 26',
        to: '/ciphers/affine',
        icon: Braces,
      },
      {
        title: 'Substitution Cipher',
        description: 'Replace each letter through a full keyed alphabet.',
        example: 'ABC…  →  QWE…',
        to: '/ciphers/substitution',
        icon: Variable,
      },
      {
        title: 'Vigenère Cipher',
        description: 'Repeat a keyword to apply changing Caesar shifts.',
        example: 'ATTACK + LEMON  →  LXFOPV',
        to: '/ciphers/vigenere',
        icon: Sigma,
      },
      {
        title: 'Autokey Cipher',
        description: 'Extend the initial keyword with the plaintext.',
        example: 'keyword + plaintext',
        to: '/ciphers/autokey',
        icon: FunctionSquare,
      },
      {
        title: 'Playfair Cipher',
        description: 'Encrypt digraphs using a keyed 5 × 5 square.',
        example: 'HIDE THE GOLD  →  BM OD ZB',
        to: '/ciphers/playfair',
        icon: Grid3x3,
      },
      {
        title: 'Hill Cipher',
        description: 'Multiply letter pairs by an invertible key matrix.',
        example: 'HELP  →  HIAT',
        to: '/ciphers/hill',
        icon: Braces,
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
        _hover={{ boxShadow: '0 6px 18px rgb(0 0 0 / 12%)' }}
        transition="box-shadow 120ms ease"
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
