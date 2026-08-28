import { Avatar, Button, Flex, IconButton, Text } from '@chakra-ui/react'
import { useLocation } from '@tanstack/react-router'
import { Menu, Search } from 'lucide-react'

const pageNames: Record<string, string> = {
  '/': 'Overview',
  '/settings': 'Settings',
  '/basic/gcd': 'GCD',
  '/diophantine/linear': 'Linear Diophantine',
  '/modular/additive-inverse': 'Additive Inverse (mod)',
  '/modular/multiplicative-inverse': 'Multiplicative Inverse (mod)',
}

interface NavbarProps {
  onSearchOpen: () => void
  onMenuOpen: () => void
}

export function Navbar({ onSearchOpen, onMenuOpen }: NavbarProps) {
  const { pathname } = useLocation()
  const pageTitle = pageNames[pathname] ?? ''

  return (
    <Flex
      as="header"
      h="64px"
      px={{ base: '8px', md: '20px' }}
      align="center"
      justify="flex-end"
      gap="4px"
    >
      <IconButton
        variant="ghost"
        size="sm"
        aria-label="Open menu"
        onClick={onMenuOpen}
        color="var(--text)"
        borderRadius="10px"
        display={{ base: 'inline-flex', md: 'none' }}
        _hover={{ bg: 'var(--accent-bg)', color: 'var(--accent)' }}
      >
        <Menu size={20} />
      </IconButton>

      {pageTitle && (
        <Text
          mr="auto"
          fontSize={{ base: 'md', md: 'lg' }}
          fontWeight="semibold"
          color="var(--accent)"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
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
