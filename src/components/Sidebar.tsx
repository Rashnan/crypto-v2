import { Box, Button, Flex, IconButton, Separator, Text } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../auth/auth";
import {
  ChartNoAxesColumnIncreasing,
  House,
  LogOut,
  PanelLeftClose,
  Settings,
  Star,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navButtonStyles = {
  w: "full",
  h: "44px",
  px: "12px",
  gap: "12px",
  justifyContent: "flex-start",
  color: "var(--text)",
  borderRadius: "10px",
  _hover: { color: "var(--accent)", bg: "var(--accent-bg)" },
  _focusVisible: { outline: "2px solid var(--accent)", outlineOffset: "2px" },
} as const;

export function Sidebar({ open, onToggle }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <Flex
      as="aside"
      aria-label="Primary navigation"
      position="sticky"
      top="0"
      left="0"
      zIndex="20"
      w={{ base: open ? "240px" : "64px", md: open ? "240px" : "72px" }}
      h="100svh"
      p="16px 12px"
      direction="column"
      overflow="hidden"
      borderRightWidth="1px"
      borderColor="var(--border)"
      bg="var(--bg)"
      transition="width 180ms ease"
    >
      <Flex
        h="40px"
        align="center"
        justify={open ? "flex-start" : "center"}
        gap="4px"
      >
        {open ? (
          <Flex
            asChild
            flex="1"
            minW="0"
            h="40px"
            align="center"
            gap="12px"
            px="8px"
            borderRadius="10px"
            whiteSpace="nowrap"
            textDecoration="none"
            _hover={{ bg: 'var(--accent-bg)' }}
            _focusVisible={{ outline: '2px solid var(--accent)', outlineOffset: '2px' }}
          >
            <Link to="/" aria-label="Crypto home">
              <Flex
                w="32px"
                h="32px"
                flex="0 0 32px"
                align="center"
                justify="center"
                borderRadius="10px"
                color="white"
                bg="var(--accent)"
                fontSize="sm"
                fontWeight="semibold"
              >
                C
              </Flex>
              <Text color="var(--text-h)" fontWeight="semibold">
                Crypto
              </Text>
            </Link>
          </Flex>
        ) : (
          <Button
            w="40px"
            h="40px"
            minW="40px"
            p="4px"
            variant="ghost"
            aria-label="Expand sidebar"
            aria-expanded="false"
            onClick={onToggle}
          >
            <Flex
              w="32px"
              h="32px"
              align="center"
              justify="center"
              borderRadius="10px"
              color="white"
              bg="var(--accent)"
              fontSize="sm"
              fontWeight="semibold"
            >
              C
            </Flex>
          </Button>
        )}
        {open && (
          <IconButton
            variant="ghost"
            size="sm"
            flex="0 0 auto"
            color="var(--text)"
            aria-label="Collapse sidebar"
            aria-expanded="true"
            onClick={onToggle}
          >
            <PanelLeftClose size={19} />
          </IconButton>
        )}
      </Flex>

      <Separator my="20px" borderColor="var(--border)" />

      <Box as="nav" display="grid" gap="4px">
        {open && (
          <Text px="12px" pb="6px" color="var(--text)" fontSize="xs" fontWeight="medium">
            Workspace
          </Text>
        )}
        <Button asChild variant="ghost" {...navButtonStyles}>
          <Link
            to="/"
            activeProps={{ style: activeLinkStyles }}
          >
            <House size={20} />
            {open && <Text>Overview</Text>}
          </Link>
        </Button>
        <Button asChild variant="ghost" {...navButtonStyles}>
          <Link to="/markets" activeProps={{ style: activeLinkStyles }}>
            <ChartNoAxesColumnIncreasing size={20} />
            {open && <Text>Markets</Text>}
          </Link>
        </Button>
        <Button asChild variant="ghost" {...navButtonStyles}>
          <Link to="/watchlist" activeProps={{ style: activeLinkStyles }}>
            <Star size={20} />
            {open && <Text>Watchlist</Text>}
          </Link>
        </Button>
      </Box>

      <Box mt="20px">
        <Separator mb="12px" borderColor="var(--border)" />
        {open && (
          <Text px="12px" pb="6px" color="var(--text)" fontSize="xs" fontWeight="medium">
            Preferences
          </Text>
        )}
        <Button asChild variant="ghost" {...navButtonStyles}>
          <Link to="/settings" activeProps={{ style: activeLinkStyles }}>
            <Settings size={20} />
            {open && <Text>Settings</Text>}
          </Link>
        </Button>
      </Box>

      <Box mt="auto">
        <Separator mb="12px" borderColor="var(--border)" />
        {open && (
          <Text px="12px" pb="6px" color="var(--text)" fontSize="xs" fontWeight="medium">
            Account
          </Text>
        )}
        <Button
          asChild
          variant="ghost"
          {...navButtonStyles}
          color="red.500"
          _hover={{ color: 'red.600', bg: 'red.50' }}
        >
          <Link to="/login" onClick={logout}>
            <LogOut size={20} />
            {open && <Text>Log out</Text>}
          </Link>
        </Button>
      </Box>
    </Flex>
  );
}

const activeLinkStyles = {
  color: "var(--accent)",
  background: "var(--accent-bg)",
  boxShadow: "inset 2px 0 var(--accent)",
};
