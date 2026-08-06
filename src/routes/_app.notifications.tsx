import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/api";
import { formatDistanceToNowStrict } from "date-fns";

export const Route = createFileRoute("/_app/notifications")({
  component: Notifs,
});

function timeAgo(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function Notifs() {
  const { data, isLoading } = useNotifications();
  const items = data ?? [];

  return (
    <div className="mx-auto max-w-md px-5 pt-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>

      {isLoading ? (
        <div className="mt-8 grid place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((n) => (
            <li key={n.id} className="card-elevated flex items-start gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate font-semibold">{n.title}</div>
                  <div className="ml-2 shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</div>
                </div>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <div className="card-elevated grid place-items-center p-10 text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">You're all caught up.</p>
            </div>
          )}
        </ul>
      )}
    </div>
  );
}
