import { Avatar, Button, Flex, Text } from '@chakra-ui/react'
import { useLocation } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

const pageNames: Record<string, string> = {
  '/': 'Overview',
  '/markets': 'Markets',
  '/watchlist': 'Watchlist',
  '/settings': 'Settings',
  '/basic/gcd': 'GCD',
}

interface NavbarProps {
  onSearchOpen: () => void
}

export function Navbar({ onSearchOpen }: NavbarProps) {
  const [stuck, setStuck] = useState(false)
  const { pathname } = useLocation()
  const pageTitle = pageNames[pathname] ?? ''

  useEffect(() => {
    const update = () => setStuck(window.scrollY > 0)

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <Flex
      as="header"
      position="sticky"
      top="0"
      zIndex="10"
      h="64px"
      px={{ base: '12px', md: '20px' }}
      align="center"
      justify="flex-end"
      gap="8px"
      borderBottomWidth="1px"
      borderColor={stuck ? 'var(--border)' : 'transparent'}
      bg={stuck ? 'color-mix(in srgb, var(--bg) 82%, transparent)' : 'transparent'}
      boxShadow={stuck ? '0 8px 24px rgb(0 0 0 / 5%)' : 'none'}
      backdropFilter={stuck ? 'blur(14px)' : 'none'}
      transition="background 150ms ease, border-color 150ms ease, box-shadow 150ms ease"
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
