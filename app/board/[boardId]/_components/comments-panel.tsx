"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  MessageSquare,
  Redo2,
  RotateCcw,
  Send,
  Undo2,
  X,
} from "lucide-react";
import {
  useCreateComment,
  useCreateThread,
  useMarkThreadAsResolved,
  useMarkThreadAsUnresolved,
  useOthers,
  useSelf,
  useThreads,
  useUser,
} from "@/liveblocks.config";
import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function getCommentText(body: unknown): string {
  if (!body || typeof body !== "object" || !("content" in body)) return "";
  const content = (body as { content?: unknown[] }).content;
  if (!Array.isArray(content)) return "";
  return content
    .flatMap((block) => {
      if (
        !block ||
        typeof block !== "object" ||
        !("children" in block) ||
        !Array.isArray(block.children)
      ) {
        return [];
      }
      return block.children.flatMap((child: unknown) =>
        child &&
        typeof child === "object" &&
        "text" in child &&
        typeof child.text === "string"
          ? [child.text]
          : []
      );
    })
    .join("");
}

interface CommentAuthorAvatarProps {
  name: string;
  picture?: string;
  size?: "sm" | "md";
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const CommentAuthorAvatar = ({
  name,
  picture,
  size = "md",
}: CommentAuthorAvatarProps) => {
  const sizeClasses = size === "sm" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs";

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className={cn("rounded-full object-cover shrink-0 border border-neutral-200", sizeClasses)}
      />
    );
  }

  const initial = (name || "T").charAt(0).toUpperCase();
  const bgColor = getAvatarColor(name || "Teammate");

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white shrink-0",
        sizeClasses,
        bgColor
      )}
    >
      {initial}
    </div>
  );
};

interface CommentItemProps {
  comment: {
    id: string;
    userId: string;
    createdAt: Date | string;
    body?: unknown;
    deletedAt?: Date | string;
  };
  isReply?: boolean;
}

const CommentItem = ({ comment, isReply = false }: CommentItemProps) => {
  if (comment.deletedAt) {
    return (
      <div className={cn("p-2 text-xs italic text-neutral-400", isReply && "ml-4")}>
        This comment was deleted.
      </div>
    );
  }

  const self = useSelf();
  const others = useOthers();
  const { user: liveblocksUser } = useUser(comment.userId);

  const isSelf = self?.id === comment.userId;
  const otherUser = others.find((o) => o.id === comment.userId);

  const authorName =
    (isSelf ? self.info?.name : otherUser?.info?.name) ||
    liveblocksUser?.name ||
    (isSelf ? "You" : "Teammate");

  const authorPicture =
    (isSelf ? self.info?.picture : otherUser?.info?.picture) ||
    liveblocksUser?.picture;

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
      });
    } catch {
      return "recently";
    }
  }, [comment.createdAt]);

  const text = getCommentText(comment.body);

  return (
    <div
      className={cn(
        "group relative flex gap-2.5 rounded-md p-2 transition-colors",
        isReply ? "ml-4 border-l-2 border-neutral-200 bg-neutral-100/60 pl-3 mt-1.5" : "bg-white border border-neutral-100 shadow-2xs"
      )}
    >
      <CommentAuthorAvatar
        name={authorName}
        picture={authorPicture}
        size={isReply ? "sm" : "md"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className="text-xs font-semibold text-neutral-800 truncate">
            {authorName}
          </span>
          {isSelf && (
            <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-medium text-sky-700">
              You
            </span>
          )}
          <span className="text-[10px] text-neutral-400 ml-auto shrink-0">
            {timeAgo}
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-700 whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>
    </div>
  );
};

interface CommentsPanelProps {
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  boardId?: string;
  canComment?: boolean;
}

export const CommentsPanel = ({
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  boardId = "",
  canComment: initialCanComment,
}: CommentsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"open" | "resolved" | "all">("open");
  const [draft, setDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    if (typeof window !== "undefined" && boardId) {
      const stored = localStorage.getItem(`miro_read_comments_${boardId}`);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 0;
  });

  const self = useSelf();
  const { threads, isLoading } = useThreads();
  const visibleThreads = useMemo(() => threads ?? [], [threads]);

  const access = useQuery(
    api.shares.getAccess,
    boardId ? { boardId: boardId as never } : "skip"
  );
  const canComment =
    initialCanComment !== undefined ? initialCanComment : access ? access.canComment : true;

  const createThread = useCreateThread();
  const createComment = useCreateComment();
  const markResolved = useMarkThreadAsResolved();
  const markUnresolved = useMarkThreadAsUnresolved();

  // Filter threads
  const openThreads = useMemo(
    () => visibleThreads.filter((t) => !t.resolved),
    [visibleThreads]
  );
  const resolvedThreads = useMemo(
    () => visibleThreads.filter((t) => t.resolved),
    [visibleThreads]
  );

  const displayedThreads = useMemo(() => {
    if (activeFilter === "open") return openThreads;
    if (activeFilter === "resolved") return resolvedThreads;
    return visibleThreads;
  }, [activeFilter, openThreads, resolvedThreads, visibleThreads]);

  // Unread badge logic:
  // Count comments created after lastReadTimestamp not created by current user
  const unreadCount = useMemo(() => {
    if (isOpen) return 0;
    if (!lastReadTimestamp) {
      // First visit: unread count is the number of comments from others
      return openThreads.reduce((count, thread) => {
        const othersComments = thread.comments.filter((c) => c.userId !== self?.id);
        return count + othersComments.length;
      }, 0);
    }

    return openThreads.reduce((count, thread) => {
      const newComments = thread.comments.filter((c) => {
        const commentTime = new Date(c.createdAt).getTime();
        return commentTime > lastReadTimestamp && c.userId !== self?.id;
      });
      return count + newComments.length;
    }, 0);
  }, [isOpen, openThreads, lastReadTimestamp, self?.id]);

  // Mark comments as read when panel is open
  useEffect(() => {
    if (isOpen && boardId) {
      const now = Date.now();
      setLastReadTimestamp(now);
      localStorage.setItem(`miro_read_comments_${boardId}`, now.toString());
    }
  }, [isOpen, boardId, visibleThreads]);

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && boardId) {
        const now = Date.now();
        setLastReadTimestamp(now);
        localStorage.setItem(`miro_read_comments_${boardId}`, now.toString());
      }
      return next;
    });
  };

  const handleResolveThread = (threadId: string) => {
    markResolved(threadId);
    toast.success("Thread marked as resolved");
  };

  const handleReopenThread = (threadId: string) => {
    markUnresolved(threadId);
    toast.success("Thread reopened");
  };

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!canComment) {
      toast.error("You have view-only access and cannot post comments");
      return;
    }

    const text = draft.trim();
    if (!text) return;

    createThread({
      body: {
        version: 1,
        content: [{ type: "paragraph", children: [{ text }] }],
      },
    });
    setDraft("");
  };

  return (
    <div className="absolute left-4 bottom-4 z-20 flex flex-col items-start">
      {isOpen && (
        <div className="mb-2 flex h-[min(540px,calc(100vh-130px))] w-[min(380px,calc(100vw-32px))] flex-col rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 bg-neutral-50/70">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-sky-600" />
              <strong className="text-sm font-semibold text-neutral-800">
                Board Comments
              </strong>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close comments"
              className="rounded p-1 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-neutral-100 bg-neutral-50/40 px-3 py-1.5 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("open")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition cursor-pointer",
                activeFilter === "open"
                  ? "bg-white text-sky-700 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <span>Open</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                  activeFilter === "open"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-neutral-200/60 text-neutral-600"
                )}
              >
                {openThreads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("resolved")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition cursor-pointer",
                activeFilter === "resolved"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Check className="h-3 w-3" />
              <span>Resolved</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-semibold",
                  activeFilter === "resolved"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-200/60 text-neutral-600"
                )}
              >
                {resolvedThreads.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition cursor-pointer ml-auto",
                activeFilter === "all"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <span>All</span>
              <span className="rounded-full bg-neutral-200/60 px-1.5 py-0.2 text-[10px] font-semibold text-neutral-600">
                {visibleThreads.length}
              </span>
            </button>
          </div>

          {/* Thread List */}
          <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5 bg-neutral-50/30">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-xs text-neutral-400">
                Loading comments...
              </div>
            )}

            {!isLoading && displayedThreads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <MessageSquare className="h-8 w-8 text-neutral-300 mb-2" />
                <p className="text-xs font-medium text-neutral-600">
                  {activeFilter === "resolved"
                    ? "No resolved threads yet"
                    : activeFilter === "open"
                    ? "No open conversations"
                    : "No comments on this board"}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {canComment
                    ? "Start a discussion by writing a comment below."
                    : "Comments will appear here once posted."}
                </p>
              </div>
            )}

            {displayedThreads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "rounded-lg border p-3 text-sm transition-all",
                  thread.resolved
                    ? "border-emerald-200/80 bg-emerald-50/30"
                    : "border-neutral-200/80 bg-white shadow-xs"
                )}
              >
                {/* Thread Card Header */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {thread.resolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" /> Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                        {thread.comments.length}{" "}
                        {thread.comments.length === 1 ? "comment" : "comments"}
                      </span>
                    )}
                  </div>

                  {/* Resolve / Reopen Button */}
                  {thread.resolved ? (
                    <button
                      type="button"
                      onClick={() => handleReopenThread(thread.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="h-3 w-3 text-sky-600" />
                      <span>Reopen</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResolveThread(thread.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50/60 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>

                {/* Comments in this thread */}
                <div className="space-y-1.5">
                  {thread.comments.map((comment, idx) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isReply={idx > 0}
                    />
                  ))}
                </div>

                {/* Reply Form (only allowed if canComment) */}
                {canComment && !thread.resolved && (
                  <form
                    className="mt-2.5 flex gap-1.5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const text = replyDraft[thread.id]?.trim();
                      if (!text) return;
                      createComment({
                        threadId: thread.id,
                        body: {
                          version: 1,
                          content: [
                            { type: "paragraph", children: [{ text }] },
                          ],
                        },
                      });
                      setReplyDraft((current) => ({
                        ...current,
                        [thread.id]: "",
                      }));
                    }}
                  >
                    <input
                      className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50/50 px-2.5 py-1 text-xs outline-none focus:border-sky-500 focus:bg-white transition"
                      value={replyDraft[thread.id] || ""}
                      onChange={(event) =>
                        setReplyDraft((current) => ({
                          ...current,
                          [thread.id]: event.target.value,
                        }))
                      }
                      placeholder="Reply..."
                      aria-label="Reply to comment"
                    />
                    <button
                      className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-40 transition cursor-pointer"
                      type="submit"
                      disabled={!replyDraft[thread.id]?.trim()}
                    >
                      Reply
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          {/* New Comment Composer Footer */}
          <div className="border-t border-neutral-200 bg-white p-3">
            {canComment ? (
              <form onSubmit={submitComment} className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                />
                <button
                  className="rounded-lg bg-neutral-900 px-3 text-white disabled:opacity-40 hover:bg-neutral-800 transition cursor-pointer flex items-center justify-center shrink-0"
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send comment"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <p className="text-center text-xs text-neutral-400 italic py-1">
                Viewing only: You cannot post comments.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Bar: Undo, Redo, Comments button */}
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white p-1 shadow-md">
        {undo && (
          <Hint label="Undo" side="top" sideOffset={10}>
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex h-8 w-8 items-center justify-center rounded text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          </Hint>
        )}
        {redo && (
          <Hint label="Redo" side="top" sideOffset={10}>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex h-8 w-8 items-center justify-center rounded text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </Hint>
        )}
        {(undo || redo) && <div className="mx-1 h-5 w-[1px] bg-neutral-200" />}

        {/* Comments Button with Unread Badge */}
        <button
          className={cn(
            "flex h-8 items-center gap-2 rounded px-2.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 cursor-pointer",
            isOpen && "bg-neutral-100 text-neutral-900 font-semibold"
          )}
          onClick={handleToggleOpen}
          aria-label="Toggle comments panel"
        >
          <MessageSquare className="h-3.5 w-3.5 text-neutral-600" />
          <span>Comments</span>
          {/* Only show badge if there are UNREAD comments! Once read, number disappears unless new comment occurs! */}
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white animate-in zoom-in-50 duration-150">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};