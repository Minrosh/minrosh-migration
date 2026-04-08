import { PipelineBoard } from "@/components/admin/pipeline-board";

export default function PipelinePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Pipeline</h1>
      <p className="mb-8 text-muted-foreground">
        Opportunities by stage. Data: <code className="rounded bg-muted px-1">data/crm-opportunities.json</code>.
      </p>
      <PipelineBoard />
    </div>
  );
}
