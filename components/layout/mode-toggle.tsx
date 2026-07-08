"use client"

import { IconDeviceImac, IconMoonStars, IconSunHigh } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const THEMES = [
  { value: "light", Icon: IconSunHigh },
  { value: "dark", Icon: IconMoonStars },
  { value: "system", Icon: IconDeviceImac },
] as const

interface ModeToggleProps {
  expanded?: boolean
  onThemeChange?: (mode: string) => void
}

export function ModeToggle({
  expanded = false,
  onThemeChange,
}: ModeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  function cycleTheme() {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    applyTheme(next)
  }

  function applyTheme(value: string) {
    document.documentElement.classList.add("theme-transitioning")
    setTheme(value)
    onThemeChange?.(value)
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning")
    }, 500)
  }

  if (!mounted) {
    return expanded ? (
      <div className="h-9 w-25 rounded-full bg-sidebar-accent/50 opacity-50" />
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0"
        aria-label="Theme toggle loading"
        aria-disabled="true"
      />
    )
  }

  if (expanded) {
    return (
      <Tabs value={theme} onValueChange={setTheme}>
        <TabsList className="grid grid-cols-3 rounded-full bg-sidebar-accent/50 p-1">
          {THEMES.map(({ value, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="cursor-pointer rounded-full p-1 data-[state=active]:bg-background"
              aria-label={`Theme: ${value}`}
              onClick={() => applyTheme(value)}
            >
              <Icon
                className="size-4.5"
                aria-hidden="true"
                {...({ focusable: "false" } as React.SVGProps<SVGSVGElement>)}
              />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    )
  }

  const baseClass = "text-[18px] transition-all duration-200 ease-in-out"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Theme: ${theme}`}
      className="relative"
    >
      {THEMES.map(({ value, Icon }) => (
        <Icon
          key={value}
          aria-hidden="true"
          focusable="false"
          className={`${baseClass} ${
            theme === value
              ? "scale-100 opacity-100"
              : "absolute scale-75 opacity-0"
          }`}
        />
      ))}
    </Button>
  )
}
