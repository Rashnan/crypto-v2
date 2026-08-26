import { Box, Heading, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface AppPageProps {
  title: string
  description: string
  children?: ReactNode
}

export function AppPage({ title, description, children }: AppPageProps) {
  return (
    <Box w="full" p={{ base: '24px 20px', md: '40px' }} textAlign="left">
      <Heading as="h1" m="0" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="tight">
        {title}
      </Heading>
      <Text mt="8px" color="var(--text)">
        {description}
      </Text>
      {children}
    </Box>
  )
}
