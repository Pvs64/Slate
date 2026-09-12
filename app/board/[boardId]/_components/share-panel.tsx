"use client";

import { FormEvent, useState } from "react";
import {
  Share2,
  Trash2,
  X,
  Mail,
  UserPlus,
  Shield,
  Copy,
  Check,
  Link2,
  Eye,
  MessageSquare,
  Edit3,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ShareRole = "admin" | "editor" | "commenter" | "viewer";
type LinkRole = "viewer" | "commenter" | "editor";

interface SharePanelProps {
  boardId: string;
  ownerName: string;
  boardTitle?: string;
}

const ROLE_CONFIG: Record<
  LinkRole,
  { label: string; description: string; icon: typeof Eye; badgeClass: string }
> = {
  viewer: {
    label: "Can view (Can only see)",
    description: "Read-only access. Can navigate board and read comments.",
    icon: Eye,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  commenter: {
    label: "Can comment",
    description: "Can view the board and add, reply, or resolve comments.",
    icon: MessageSquare,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  editor: {
    label: "Can edit",
    description: "Full editing access. Can create, edit, and move shapes.",
    icon: Edit3,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export const SharePanel = ({
  boardId,
  ownerName,
  boardTitle = "Whiteboard",
}: SharePanelProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ShareRole>("editor");
  const [selectedLinkRole, setSelectedLinkRole] = useState<LinkRole>("viewer");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [emailingMember, setEmailingMember] = useState<string | null>(null);

  const shares = useQuery(api.shares.list, open ? { boardId: boardId as never } : "skip");
  const shareLinks = useQuery(
    api.shares.listLinks,
    open ? { boardId: boardId as never } : "skip"
  );

  const { mutate: saveShare, pending: saving } = useApiMutation(api.shares.upsert);
  const { mutate: removeShare } = useApiMutation(api.shares.remove);
  const getOrCreateLink = useMutation(api.shares.getOrCreateLink);

  const activeLinkForRole = shareLinks?.find((l) => l.role === selectedLinkRole);

  const getFullUrl = (token: string, role: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/board/${boardId}?token=${token}&role=${role}`;
  };

  const handleGenerateAndCopyLink = async (roleToUse: LinkRole = selectedLinkRole) => {
    setGeneratingLink(true);
    try {
      const link = await getOrCreateLink({
        boardId: boardId as never,
        role: roleToUse,
      });

      if (link?.token && typeof window !== "undefined") {
        const url = getFullUrl(link.token, roleToUse);
        await navigator.clipboard.writeText(url);
        setCopiedToken(roleToUse);
        toast.success(`Copied "${ROLE_CONFIG[roleToUse].label}" link to clipboard`);
        setTimeout(() => setCopiedToken(null), 2500);
      }
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const sendEmailInvitation = async (targetEmail: string, role: ShareRole) => {
    const linkRole: LinkRole = role === "admin" ? "editor" : (role as LinkRole);
    const link = await getOrCreateLink({
      boardId: boardId as never,
      role: linkRole,
    });

    const token = link?.token || "";
    const inviteLink = getFullUrl(token, linkRole);

    const res = await fetch("/api/send-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: targetEmail,
        boardId,
        boardTitle,
        role,
        inviteLink,
        inviterName: ownerName,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || "Email dispatch failed");
    }

    const data = await res.json();
    if (data.delivered) {
      toast.success(`Invitation email sent directly to ${targetEmail}!`);
    } else if (data.mailtoUrl) {
      window.open(data.mailtoUrl, "_blank");
      toast.info(
        `Invite saved! Opening your email client to send link to ${targetEmail}...`
      );
    } else {
      toast.success(`Invite link generated for ${targetEmail}`);
    }
  };

  const submitInvite = async (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setSendingInvite(true);
    try {
      await saveShare({
        boardId: boardId as never,
        memberId: cleanEmail,
        memberName: cleanEmail.split("@")[0],
        role: inviteRole,
      });

      await sendEmailInvitation(cleanEmail, inviteRole);
      setEmail("");
    } catch (err) {
      console.error("Invite error:", err);
      toast.error("Failed to send invite or update board access");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleResendEmail = async (memberEmail: string, role: ShareRole) => {
    setEmailingMember(memberEmail);
    try {
      await sendEmailInvitation(memberEmail, role);
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to send invitation email");
    } finally {
      setEmailingMember(null);
    }
  };

  const handleRemove = (memberId: string, memberName: string) => {
    removeShare({ boardId: boardId as never, memberId })
      .then(() => toast.success(`Removed ${memberName}`))
      .catch(() => toast.error("Failed to remove member"));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Hint label="Share board" side="bottom" sideOffset={10}>
        <PopoverTrigger asChild>
          <Button
            variant="board"
            size="icon"
            className="h-8 w-8 text-neutral-700 hover:text-neutral-900 cursor-pointer"
            aria-label="Share board"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </Hint>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[min(420px,calc(100vw-24px))] max-h-[85vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-2xl z-50"
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-1.5 text-neutral-900">
              <UserPlus className="h-4 w-4 text-sky-600" /> Share Board
            </h2>
            <p className="text-xs text-neutral-500">
              Create role-specific links or invite teammates directly.
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
            aria-label="Close sharing"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Create Link Section */}
        <div className="mb-4 rounded-lg border border-neutral-200/80 bg-neutral-50/70 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
            <Link2 className="h-3.5 w-3.5 text-sky-600" />
            <span>Create Share Link</span>
          </div>

          <p className="mb-2 text-[11px] text-neutral-500">
            Select the permission role for the link before sharing:
          </p>

          {/* Role Choice Radio Tiles */}
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            {(["viewer", "commenter", "editor"] as const).map((r) => {
              const cfg = ROLE_CONFIG[r];
              const isSelected = selectedLinkRole === r;
              const Icon = cfg.icon;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedLinkRole(r)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border p-2 text-center transition cursor-pointer",
                    isSelected
                      ? "border-sky-500 bg-sky-50/60 text-sky-900 shadow-xs font-medium"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 mb-1",
                      isSelected ? "text-sky-600" : "text-neutral-500"
                    )}
                  />
                  <span className="text-[11px] leading-tight">
                    {r === "viewer"
                      ? "Can view"
                      : r === "commenter"
                      ? "Can comment"
                      : "Can edit"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Description */}
          <p className="mb-3 text-[11px] text-neutral-600 italic bg-white/80 rounded border border-neutral-100 px-2 py-1">
            {ROLE_CONFIG[selectedLinkRole].description}
          </p>

          {/* Active Link Box or Generate Action */}
          <div className="space-y-2">
            {activeLinkForRole ? (
              <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white p-1.5">
                <input
                  readOnly
                  value={getFullUrl(activeLinkForRole.token, activeLinkForRole.role)}
                  className="min-w-0 flex-1 bg-transparent text-[11px] font-mono text-neutral-600 outline-none select-all truncate px-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateAndCopyLink(selectedLinkRole)}
                  className="h-7 px-2.5 text-xs font-medium gap-1 shrink-0 cursor-pointer"
                >
                  {copiedToken === selectedLinkRole ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedToken === selectedLinkRole ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            ) : null}

            <Button
              type="button"
              onClick={() => handleGenerateAndCopyLink(selectedLinkRole)}
              disabled={generatingLink}
              className="w-full h-8 text-xs bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer font-medium"
            >
              {generatingLink
                ? "Generating Link..."
                : copiedToken === selectedLinkRole
                ? `Copied ${ROLE_CONFIG[selectedLinkRole].label} link!`
                : `Create & Copy ${
                    selectedLinkRole === "viewer"
                      ? "Can view"
                      : selectedLinkRole === "commenter"
                      ? "Can comment"
                      : "Can edit"
                  } link`}
            </Button>
          </div>

          {/* All Generated Links Summary if any */}
          {shareLinks && shareLinks.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-neutral-200/60 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Active links for this board:
              </p>
              {shareLinks.map((link) => {
                const cfg = ROLE_CONFIG[link.role as LinkRole] || ROLE_CONFIG.viewer;
                const Icon = cfg.icon;
                const isCopied = copiedToken === link.role;

                return (
                  <div
                    key={link._id}
                    className="flex items-center justify-between gap-1.5 rounded bg-white px-2 py-1 text-xs border border-neutral-100"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className="h-3 w-3 text-neutral-500 shrink-0" />
                      <span className="truncate text-[11px] font-medium text-neutral-700">
                        {cfg.label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerateAndCopyLink(link.role as LinkRole)}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite by Email */}
        <form onSubmit={submitInvite} className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-neutral-700">Invite via Email</p>
            <span className="text-[10px] text-sky-600 font-medium flex items-center gap-1">
              <Mail className="h-3 w-3" /> Sends direct link
            </span>
          </div>
          <div className="relative">
            <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="email"
              className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-neutral-900 placeholder:text-neutral-400"
              placeholder="colleague@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-label="Collaborator email"
              required
            />
          </div>

          <div className="flex gap-2">
            <select
              className="h-8 min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-sky-500 text-neutral-800 cursor-pointer"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as ShareRole)}
              aria-label="Share role"
            >
              <option value="editor">Can edit (Editor)</option>
              <option value="admin">Full access (Admin)</option>
              <option value="commenter">Can comment (Commenter)</option>
              <option value="viewer">Can view (Viewer - Can only see)</option>
            </select>
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 text-xs bg-sky-600 hover:bg-sky-700 text-white cursor-pointer min-w-[80px]"
              disabled={saving || sendingInvite || !email.trim()}
            >
              {sendingInvite ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mailing...
                </span>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </form>

        {/* Members List */}
        <div className="space-y-2 border-t border-neutral-100 pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            People with access
          </p>
          <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-xs">
            <span className="font-medium text-neutral-700">{ownerName}</span>
            <span className="inline-flex items-center gap-1 rounded bg-neutral-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
              <Shield className="h-3 w-3" /> Owner
            </span>
          </div>

          <div className="max-h-36 space-y-1.5 overflow-auto pr-1">
            {shares && shares.length === 0 && (
              <p className="py-2 text-center text-xs text-neutral-400">
                No external collaborators added yet.
              </p>
            )}
            {shares?.map((share) => (
              <div
                key={share._id}
                className="flex items-center justify-between gap-2 rounded-md border border-neutral-100 bg-white px-2.5 py-1.5 text-xs shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-800">{share.memberName}</p>
                  <p className="truncate text-[10px] text-neutral-400">{share.memberId}</p>
                </div>
                <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 capitalize">
                  {share.role === "viewer" ? "Can view" : share.role}
                </span>
                {share.memberId.includes("@") && (
                  <Hint label={`Email invite link to ${share.memberId}`} side="top">
                    <button
                      type="button"
                      onClick={() => handleResendEmail(share.memberId, share.role as ShareRole)}
                      disabled={emailingMember === share.memberId}
                      className="p-1 text-neutral-400 hover:text-sky-600 cursor-pointer disabled:opacity-50"
                      aria-label={`Email link to ${share.memberId}`}
                    >
                      {emailingMember === share.memberId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </Hint>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(share.memberId, share.memberName)}
                  className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer"
                  aria-label={`Remove ${share.memberName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};