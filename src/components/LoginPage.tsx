import { Box, Button, Field, Flex, Heading, Input, Text } from '@chakra-ui/react'
import { Navigate, useNavigate } from '@tanstack/react-router'
import { LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { loginDisabled, useAuth } from '../auth/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginError, setLoginError] = useState('')

  if (loginDisabled) {
    return <Navigate to="/" />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const authenticated = login(
      String(formData.get('email')),
      String(formData.get('password')),
    )

    if (!authenticated) {
      setLoginError('Email or password is incorrect.')
      return
    }

    setLoginError('')
    void navigate({ to: '/' })
  }

  return (
    <Flex
      minH="100svh"
      align="center"
      justify="center"
      bg="var(--bg)"
      p="20px"
    >
      <Box
        as="main"
        w="full"
        maxW="420px"
        p={{ base: '28px 24px', md: '36px' }}
        borderWidth="1px"
        borderColor="var(--border)"
        borderRadius="20px"
        boxShadow="var(--shadow)"
      >
        <Flex
          w="44px"
          h="44px"
          mx="auto"
          align="center"
          justify="center"
          borderRadius="14px"
          color="white"
          bg="var(--accent)"
        >
          <LockKeyhole size={21} />
        </Flex>

        <Heading
          as="h1"
          mt="24px"
          mb="0"
          fontSize="2xl"
          letterSpacing="tight"
          textAlign="center"
        >
          Welcome back
        </Heading>
        <Text mt="8px" color="var(--text)" fontSize="sm" textAlign="center">
          Sign in to continue to Crypto.
        </Text>

        <form onSubmit={handleSubmit}>
          <Box mt="28px">
            <Field.Root invalid={Boolean(loginError)}>
              <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium">
                Email
              </Field.Label>
              <Input
                id="email"
                name="email"
                type="email"
                mt="8px"
                placeholder="you@example.com"
                borderColor="var(--border)"
                _focusVisible={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' }}
                required
              />
            </Field.Root>

            <Field.Root mt="18px">
              <Field.Label color="var(--text-h)" fontSize="sm" fontWeight="medium">
                Password
              </Field.Label>
              <Input
                id="password"
                name="password"
                type="password"
                mt="8px"
                placeholder="Enter your password"
                borderColor="var(--border)"
                _focusVisible={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent)' }}
                required
              />
              <Field.ErrorText>{loginError}</Field.ErrorText>
            </Field.Root>

            <Button
              type="submit"
              w="full"
              mt="24px"
              bg="var(--accent)"
              color="white"
              _hover={{ opacity: 0.9 }}
            >
              Sign in
            </Button>
          </Box>
        </form>
      </Box>
    </Flex>
  )
}
