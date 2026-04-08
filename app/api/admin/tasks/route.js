import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { completeTask, createTask, listTasks } from "@/lib/crm/tasks-service";

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
  const customerId = String(searchParams.get("customerId") || "").trim();
  const openOnly = searchParams.get("openOnly") === "1";
  return Response.json({ tasks: listTasks({ customerId: customerId || undefined, openOnly }) });
}

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const task = createTask({
    title: body.title,
    customerId: body.customerId,
    opportunityId: body.opportunityId,
    dueAt: body.dueAt,
    source: body.source,
  });
  return Response.json({ task });
}

export async function PATCH(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  if (body.status === "done") {
    const t = completeTask(id);
    if (!t) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ task: t });
  }
  return Response.json({ error: "Unsupported patch" }, { status: 400 });
}
