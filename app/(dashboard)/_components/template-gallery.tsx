"use client";

import { ArrowRight, Code2, GitBranch, GraduationCap, Layers3, Network, NotebookPen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { TemplatePreview } from "./template-previews";

interface TemplateGalleryProps {
  orgId: string;
}

const templates = [
  {
    id: "system-design",
    title: "System Design",
    description: "URL Shortener architecture with gateways, cache & queues",
    icon: Network,
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200/80",
  },
  {
    id: "database-design",
    title: "Database Design",
    description: "E-Commerce ER schema with PK/FK columns & relations",
    icon: Layers3,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  {
    id: "code-review",
    title: "Code Review",
    description: "Auth code block with reviewer notes & triage cards",
    icon: Code2,
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200/80",
  },
  {
    id: "mind-map",
    title: "Mind Map",
    description: "DSA Roadmap exploring topics from center outward",
    icon: GitBranch,
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80",
  },
  {
    id: "study-planner",
    title: "Study Planner",
    description: "7-Day SDE Interview Sprint with daily task checklists",
    icon: GraduationCap,
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
  },
  {
    id: "lecture-notes",
    title: "Lecture Notes",
    description: "Computer Networks notes with OSI model & exam questions",
    icon: NotebookPen,
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
  },
];

export const TemplateGallery = ({ orgId }: TemplateGalleryProps) => {
  const router = useRouter();
  const { mutate, pending } = useApiMutation(api.board.create);

  const onSelectTemplate = (id: string, title: string) => {
    if (pending) return;

    mutate({
      orgId,
      title,
      template: id,
    })
      .then((boardId) => {
        toast.success(`${title} board created`);
        router.push(`/board/${boardId}`);
      })
      .catch(() => {
        toast.error("Failed to create board");
      });
  };

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Start with a workflow
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            Pre-built templates for developers and students
          </h2>
        </div>
        <span className="hidden text-xs font-medium text-neutral-500 sm:block">
          Full ready-to-use starting workspaces
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
        {templates.map(({ id, title, description, icon: Icon, badgeBg }) => (
          <div
            key={id}
            onClick={() => onSelectTemplate(id, title)}
            className="group relative flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg cursor-pointer"
          >
            {/* Header with soft badge and subtle hover add trigger */}
            <div className="mb-2 flex items-center justify-between">
              <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${badgeBg}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="truncate max-w-[80px]">{title}</span>
              </div>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-blue-600 hover:text-white"
                aria-label={`Use ${title} template`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Visual Vector Preview */}
            <TemplatePreview id={id} />

            {/* Description */}
            <div className="mt-2.5 flex-1">
              <h3 className="text-xs font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1 text-[11px] leading-4 text-neutral-600 line-clamp-2">
                {description}
              </p>
            </div>

            {/* Bottom Use Template Button */}
            <button
              type="button"
              disabled={pending}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-neutral-200 bg-neutral-50/80 py-1.5 text-xs font-medium text-neutral-700 transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            >
              <span>Use Template</span>
              <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};