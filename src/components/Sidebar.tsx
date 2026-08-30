import { Box, Button, Flex, IconButton, Separator, Text } from "@chakra-ui/react";
import { Drawer } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactElement } from "react";
import { PanelLeftClose } from "lucide-react";
import { navigationSections, overviewItem, preferenceItems, type NavigationItem } from '../lib/navigation';

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
  _focusVisible: { outline: "2px solid var(--accent)", outlineOffset: "2px" },
} as const;

function SideTooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip.Root openDelay={200} positioning={{ placement: "right" }}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}

function NavButton({ item, open }: { item: NavigationItem; open: boolean }) {
  const Icon = item.icon;
  const activeStyles = {
    color: "var(--accent)",
    background: "var(--accent-bg)",
    boxShadow: open ? "inset 2px 0 var(--accent)" : "inset -2px 0 var(--accent)",
  };
  const hoverStyles = {
    color: "var(--accent)",
    bg: "var(--accent-bg)",
    boxShadow: open ? "inset 2px 0 var(--accent)" : "inset -2px 0 var(--accent)",
  };

  const button = (
    <Button asChild variant="ghost" {...navButtonStyles} _hover={hoverStyles}>
      <Link to={item.to} activeProps={{ style: activeStyles }}>
        <Icon size={20} />
        {open && <Text>{item.label}</Text>}
      </Link>
    </Button>
  );

  if (open) {
    return button;
  }

  return <SideTooltip label={item.label}>{button}</SideTooltip>;
}

function LogoBlock({ onClose }: { onClose?: () => void }) {
  return (
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
      <Link to="/" aria-label="Crypto home" onClick={onClose}>
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
  );
}

function NavSections({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  return (
    <>
      <Box display="grid" gap="4px">
        <Box onClick={onNavigate}>
          <NavButton item={overviewItem} open={open} />
        </Box>
      </Box>

      {navigationSections.map((section) => (
        <Section key={section.label} title={section.label} items={section.items} open={open} onNavigate={onNavigate} />
      ))}

      <Box mt="auto">
        <Separator mb="12px" borderColor="var(--border)" />
        {open && (
          <Text px="12px" pb="6px" color="var(--text)" fontSize="xs" fontWeight="medium">
            Preferences
          </Text>
        )}
        <Box display="grid" gap="4px">
          {preferenceItems.map((item) => (
            <Box key={item.to} onClick={onNavigate}>
              <NavButton item={item} open={open} />
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}

function Section({
  title,
  items,
  open,
  onNavigate,
}: {
  title: string;
  items: NavigationItem[];
  open: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Box mt="12px">
      {open && (
        <Text px="12px" pb="6px" color="var(--text)" fontSize="xs" fontWeight="medium">
          {title}
        </Text>
      )}
      <Box display="grid" gap="4px">
        {items.map((item) => (
          <Box key={item.to} onClick={onNavigate}>
            <NavButton item={item} open={open} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(
    () => !window.matchMedia("(min-width: 721px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 721px)");
    const handle = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  return (
    <>
      {isMobile && (
      <Drawer.Root
        open={open}
        onOpenChange={({ open }) => {
          if (!open) onToggle();
        }}
        placement="start"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            w="100vw"
            maxW="100vw"
            bg="var(--bg)"
            boxShadow="none"
          >
            <Flex
              h="100vh"
              p="16px 20px"
              direction="column"
              display={{ base: "flex", md: "none" }}
            >
              <Flex h="40px" align="center" gap="4px">
                <LogoBlock onClose={() => onToggle()} />
                <IconButton
                  variant="ghost"
                  size="sm"
                  flex="0 0 auto"
                  color="var(--text)"
                  aria-label="Close menu"
                  onClick={() => onToggle()}
                >
                  <PanelLeftClose size={19} />
                </IconButton>
              </Flex>

              <Separator my="20px" borderColor="var(--border)" />

              <NavSections open onNavigate={() => onToggle()} />
            </Flex>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
      )}

      <Flex
        as="aside"
        aria-label="Primary navigation"
        position="sticky"
        top="0"
        left="0"
        zIndex="20"
        w={open ? "240px" : "72px"}
        h="100svh"
        p="16px 12px"
        direction="column"
        overflowX="hidden"
        overflowY="auto"
        borderRightWidth="1px"
        borderColor="var(--border)"
        bg="var(--bg)"
        transition="width 180ms ease"
        display={{ base: "none", md: "flex" }}
      >
        <Flex
          h="40px"
          align="center"
          justify={open ? "flex-start" : "center"}
          gap="4px"
        >
          {open ? (
            <LogoBlock />
          ) : (
            <SideTooltip label="Expand sidebar">
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
            </SideTooltip>
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

        <NavSections open={open} />
      </Flex>
    </>
  );
}
