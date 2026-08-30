import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import {
  Box,
  Dialog,
  Flex,
  Icon,
  Input,
  Kbd,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { navigationItems, type NavigationItem } from '../lib/navigation'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const filtered = navigationItems.filter((p) =>
    p.label.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  function navigateTo(page: NavigationItem) {
    onOpenChange(false)
    navigate({ to: page.to })
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault()
      navigateTo(filtered[activeIndex])
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW="520px"
          w="90vw"
          borderRadius="14px"
          bg="var(--bg)"
          borderWidth="1px"
          borderColor="var(--border)"
          boxShadow="0 24px 64px rgb(0 0 0 / 20%)"
          overflow="hidden"
        >
          <Dialog.Header p="0" m="0" w="full" position="relative">
            <Flex align="center" w="full" px="16px">
              <Icon size="md" color="var(--text)">
                <Search size={18} />
              </Icon>
              <Input
                ref={inputRef}
                flex="1"
                variant="flushed"
                placeholder="Search pages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                px="12px"
                h="48px"
                fontSize="md"
              />
            </Flex>
            <Kbd
              position="absolute"
              top="14px"
              right="14px"
              fontSize="xs"
              color="var(--text)"
              bg="var(--accent-bg)"
              border="1px solid var(--border)"
              borderRadius="4px"
              px="6px"
              py="2px"
              lineHeight="1.4"
            >
              esc
            </Kbd>
          </Dialog.Header>

          <Dialog.Body p="0" m="0">
            <Box ref={listRef} maxH="320px" overflowY="auto" py="6px">
              {filtered.length === 0 && (
                <Text px="16px" py="16px" color="var(--text)" fontSize="sm" textAlign="center">
                  No results
                </Text>
              )}
              {filtered.map((page, i) => {
                const IconComp = page.icon
                const isActive = i === activeIndex
                return (
                  <Flex
                    key={page.to}
                    role="option"
                    aria-selected={isActive}
                    px="16px"
                    py="10px"
                    mx="8px"
                    mb="2px"
                    borderRadius="8px"
                    align="center"
                    gap="12px"
                    cursor="pointer"
                    bg={isActive ? 'var(--accent-bg)' : 'transparent'}
                    color={isActive ? 'var(--accent)' : 'var(--text)'}
                    _hover={{ bg: 'var(--accent-bg)', color: 'var(--accent)' }}
                    transition="background 80ms ease, color 80ms ease"
                    onClick={() => navigateTo(page)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <Icon size="sm">
                      <IconComp size={18} />
                    </Icon>
                    <Text fontSize="sm" fontWeight="medium">
                      {page.label}
                    </Text>
                    <Text ml="auto" fontSize="xs" color="var(--text)" opacity={0.5}>
                      {page.to}
                    </Text>
                  </Flex>
                )
              })}
            </Box>
          </Dialog.Body>

          <Dialog.CloseTrigger asChild>
            <Box position="absolute" top="12px" right="12px" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
