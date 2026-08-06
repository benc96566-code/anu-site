import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useDocuments } from "@/lib/api";

export const Route = createFileRoute("/_app/documents")({
  component: Docs,
});

function Docs() {
  const { data: docs = [], isLoading } = useDocuments();
  return (
    <div className="mx-auto max-w-md px-5 pt-6 pb-24">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Documents</h1>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="card-elevated mt-6 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-3 font-semibold">No documents yet</div>
          <div className="mt-1 text-xs text-muted-foreground">Statements, tax forms and trade reports will appear here.</div>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="card-elevated flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{d.title}</div>
                <div className="text-xs text-muted-foreground">{d.kind} · {new Date(d.doc_date).toLocaleDateString()}</div>
              </div>
              {d.url && (
                <a href={d.url} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-muted">
                  <Download className="h-4 w-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
