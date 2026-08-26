import { Box, Button, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { AppPage } from './AppPage'
import {
  accentThemes,
  useAccentTheme,
  type AccentTheme,
} from '../theme/accent-theme'

const themeColors: Record<AccentTheme, string> = {
  teal: '#0d9488',
  blue: '#2563eb',
  violet: '#7c3aed',
  amber: '#d97706',
}

export function SettingsPage() {
  const { accent, saveAccent } = useAccentTheme()
  const [selectedAccent, setSelectedAccent] = useState(accent)
  const hasChanges = selectedAccent !== accent

  return (
    <AppPage title="Settings" description="Manage your account and display preferences.">
      <Box mt="36px" maxW="680px">
        <Heading as="h2" fontSize="lg" m="0">
          Accent color
        </Heading>
        <Text mt="6px" color="var(--text)" fontSize="sm">
          Choose the color used for selections, focus states, and highlights.
        </Text>

        <SimpleGrid columns={{ base: 2, md: 4 }} gap="12px" mt="20px">
          {accentThemes.map((theme) => {
            const selected = selectedAccent === theme

            return (
              <Button
                key={theme}
                variant="outline"
                h="88px"
                p="12px"
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
                borderColor={selected ? themeColors[theme] : 'var(--border)'}
                bg={selected ? `${themeColors[theme]}14` : 'transparent'}
                onClick={() => setSelectedAccent(theme)}
                aria-pressed={selected}
              >
                <Flex w="full" align="center" justify="space-between">
                  <Box w="24px" h="24px" borderRadius="full" bg={themeColors[theme]} />
                  {selected && <Check size={18} color={themeColors[theme]} />}
                </Flex>
                <Text mt="auto" textTransform="capitalize">
                  {theme}
                </Text>
              </Button>
            )
          })}
        </SimpleGrid>

        <Button
          mt="24px"
          bg="var(--accent)"
          color="white"
          _hover={{ opacity: 0.9 }}
          disabled={!hasChanges}
          onClick={() => saveAccent(selectedAccent)}
        >
          Save theme
        </Button>
      </Box>
    </AppPage>
  )
}
