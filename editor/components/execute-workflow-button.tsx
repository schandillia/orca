import { IconFlask2 } from "@tabler/icons-react"
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
      <IconFlask2 className="size-4" />
      Execute workflow
    </Button>
  )
}
