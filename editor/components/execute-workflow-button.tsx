import { IconFlask2, IconLoader } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useExecuteWorkflow } from "@/workflows/hooks/use-workflows"

interface Props {
  workflowId: string
}

export function ExecuteWorkflowButton({ workflowId }: Props) {
  const executeWorkflow = useExecuteWorkflow()
  const handleExecute = () => {
    executeWorkflow.mutate({ id: workflowId })
  }
  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending}
    >
      {executeWorkflow.isPending ? (
        <IconLoader className="size-4 animate-spin" />
      ) : (
        <IconFlask2 className="size-4" />
      )}
      Execute workflow
    </Button>
  )
}
