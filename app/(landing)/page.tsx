"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTRPC } from "@/trpc/client"

export default function HomePage() {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.getWorkflows.queryOptions())
  const testAI = useMutation(trpc.testAI.mutationOptions(
    {
      onSuccess: () => {
        toast.success("AI Job queued")
      },
    }
  ))
  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job queued")
      },
    }),
  )
  console.log(data)

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "flex flex-1 flex-col items-center justify-center",
        "gap-8 px-6 pt-14 text-center",
        "mx-auto max-w-4xl",
      )}
    >
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button disabled={testAI.isPending} onClick={() => testAI.mutate()}>
        Test AI
      </Button>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <h1
        id="hero-heading"
        className={cn(
          "text-5xl md:text-7xl",
          "font-bold tracking-tight leading-tight",
          "text-silver",
        )}
      >
        Your SaaS, ready to ship
      </h1>
      <p
        className={cn(
          "max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground",
        )}
      >
        Orca gives you authentication, billing, and the rest of the plumbing
        already wired together, so you can build the part that matters.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button render={<Link href="/login" />} nativeButton={false} size="lg">
          Get started free
        </Button>

        <Button
          render={<Link href="/pricing" />}
          nativeButton={false}
          size="lg"
          variant="outline"
        >
          View pricing
        </Button>
      </div>
    </section>
  )
}
