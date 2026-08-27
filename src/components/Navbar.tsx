import { Avatar, Button, Flex, Text } from '@chakra-ui/react'
import { useLocation } from '@tanstack/react-router'
import { Search } from 'lucide-react'

const pageNames: Record<string, string> = {
  '/': 'Overview',
  '/markets': 'Markets',
  '/watchlist': 'Watchlist',
  '/settings': 'Settings',
  '/basic/gcd': 'GCD',
  '/basic/diophantine': 'Diophantine',
}

interface NavbarProps {
  onSearchOpen: () => void
}

export function Navbar({ onSearchOpen }: NavbarProps) {
  const { pathname } = useLocation()
  const pageTitle = pageNames[pathname] ?? ''

  return (
    <Flex
      as="header"
      h="64px"
      px={{ base: '12px', md: '20px' }}
      align="center"
      justify="flex-end"
      gap="8px"
      borderBottomWidth="1px"
      borderColor="var(--border)"
    >
      {pageTitle && (
        <Text
          mr="auto"
          fontSize="lg"
          fontWeight="semibold"
          color="var(--accent)"
          whiteSpace="nowrap"
        >
          {pageTitle}
        </Text>
      )}

      <Button
        variant="ghost"
        size="sm"
        aria-label="Search pages"
        onClick={onSearchOpen}
        color="var(--text)"
        borderRadius="10px"
        _hover={{ bg: 'var(--accent-bg)', color: 'var(--accent)' }}
      >
        <Search size={20} />
      </Button>

      <Avatar.Root size="sm" bg="var(--accent)" color="white">
        <Avatar.Fallback name="Rashnan" />
      </Avatar.Root>
    </Flex>
  )
}
