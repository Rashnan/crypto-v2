import { Avatar, Flex, IconButton } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Navbar() {
  const [stuck, setStuck] = useState(false)

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
      borderBottomWidth="1px"
      borderColor={stuck ? 'var(--border)' : 'transparent'}
      bg={stuck ? 'color-mix(in srgb, var(--bg) 82%, transparent)' : 'transparent'}
      boxShadow={stuck ? '0 8px 24px rgb(0 0 0 / 5%)' : 'none'}
      backdropFilter={stuck ? 'blur(14px)' : 'none'}
      transition="background 150ms ease, border-color 150ms ease, box-shadow 150ms ease"
    >
      <Flex align="center" gap="8px">
        <IconButton variant="ghost" size="sm" color="var(--text)" aria-label="Search">
          <Search size={20} />
        </IconButton>
        <Avatar.Root size="sm" bg="var(--accent)" color="white">
          <Avatar.Fallback name="Rashnan" />
        </Avatar.Root>
      </Flex>
    </Flex>
  )
}
