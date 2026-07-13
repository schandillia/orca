"use client"

import { IconPlus } from "@tabler/icons-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"

export const AddNodeButton = memo(() => {
  return (
    <Button
      onClick={() => {}}
      size="icon"
      className="bg-background"
      variant="outline"
    >
      <IconPlus />
    </Button>
  )
})
