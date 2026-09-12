"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Layers,
  Users,
  Share2,
  MousePointer2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Play,
  FileText,
  Palette,
  Eye,
  Lock,
  ChevronRight,
  Layout,
  GitBranch,
  Columns,
  MonitorPlay,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { analytics } from "@/lib/analytics";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: typeof Layout;
  badge: string;
  color: string;
  sampleItems: string[];
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "brainstorming",
    name: "Sprint Brainstorming",
    category: "Agile & Product",
    description: "Idea clusters, voting sticky notes, action items, and retrospective boards.",
    icon: Sparkles,
    badge: "Most Popular",
    color: "from-amber-500/20 to-orange-500/10 border-amber-200 text-amber-700",
    sampleItems: ["Idea Clustering", "Voting Dots", "Pain Points", "Action Matrix"],
  },
  {
    id: "flowchart",
    name: "User Journey & Flowchart",
    category: "Design & UX",
    description: "Decision trees, user path mapping, elbow connector arrows, and state machines.",
    icon: GitBranch,
    badge: "Smart Connectors",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-200 text-blue-700",
    sampleItems: ["Entry Point", "Auth Decision Node", "Onboarding Flow", "Conversion Gate"],
  },
  {
    id: "kanban",
    name: "Agile Kanban Board",
    category: "Project Management",
    description: "Streamline sprint tasks with Backlog, In Progress, Review, and Done lanes.",
    icon: Columns,
    badge: "Team Essential",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-200 text-emerald-700",
    sampleItems: ["Backlog (4)", "In Progress (2)", "Code Review (3)", "Shipped (12)"],
  },
  {
    id: "wireframe",
    name: "Mobile & Web Wireframing",
    category: "UI/UX Prototyping",
    description: "Rapid mockups, responsive viewports, UI component wireframes, and design specs.",
    icon: Layout,
    badge: "Fast Prototyping",
    color: "from-purple-500/20 to-pink-500/10 border-purple-200 text-purple-700",
    sampleItems: ["Header & Nav", "Hero Showcase", "Feature Cards", "Checkout Form"],
  },
  {
    id: "architecture",
    name: "System Architecture",
    category: "Engineering",
    description: "Microservices topology, database schemas, cloud infrastructure, and API pipelines.",
    icon: Layers,
    badge: "Dev Favorite",
    color: "from-sky-500/20 to-cyan-500/10 border-sky-200 text-sky-700",
    sampleItems: ["Next.js Frontend", "Convex Realtime DB", "Liveblocks Presence", "Clerk Auth"],
  },
  {
    id: "presentation",
    name: "Interactive Pitch & Deck",
    category: "Presentations",
    description: "Frame-by-frame slide canvas with 1-click full-screen presenter mode.",
    icon: MonitorPlay,
    badge: "Presenter Mode",
    color: "from-rose-500/20 to-red-500/10 border-rose-200 text-rose-700",
    sampleItems: ["Slide 1: Vision", "Slide 2: Problem", "Slide 3: Solution", "Slide 4: Traction"],
  },
];

export const LandingPage = () => {
  const { requireAuth, openAuthModal } = useRequireAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "design" | "agile" | "dev">("all");

  // Track guest view on mount for funnel analytics
  useEffect(() => {
    analytics.track("guest_view", {
      referrer: typeof document !== "undefined" ? document.referrer : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      path: "/",
    });
  }, []);

  const handleUseTemplate = (tmpl: TemplateItem) => {
    analytics.track("template_selected", { templateId: tmpl.id, name: tmpl.name });
    requireAuth(
      () => {
        // If already logged in, redirect to board creation
      },
      {
        source: `template_${tmpl.id}`,
        pendingAction: {
          type: "use_template",
          label: `Create ${tmpl.name}`,
          payload: {
            template: tmpl.id,
            templateName: tmpl.name,
            title: `${tmpl.name} Board`,
          },
        },
      }
    );
  };

  const handleStartBlank = () => {
    analytics.track("template_selected", { templateId: "blank", name: "Untitled Board" });
    requireAuth(
      () => { },
      {
        source: "hero_cta_start_free",
        pendingAction: {
          type: "create_board",
          label: "Create New Board",
          payload: {
            title: "My First Board",
          },
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE] text-neutral-900 selection:bg-sky-100 selection:text-sky-900 font-sans">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Slate",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "Slate is a real-time collaborative visual whiteboard workspace for team brainstorming, wireframing, flowcharts, and agile planning.",
          }),
        }}
      />

      {/* 1. Public Sticky Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Slate Logo" width={32} height={32} priority />
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              Slate
            </span>
            <span className="ml-2 hidden rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 sm:inline-block border border-sky-200/60">
              Public Preview
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <a href="#templates" className="hover:text-neutral-900 transition-colors">
              Templates
            </a>
            <a href="#features" className="hover:text-neutral-900 transition-colors">
              Features
            </a>
            <a href="#sandbox" className="hover:text-neutral-900 transition-colors">
              Live Sandbox
            </a>
            <a href="#collaboration" className="hover:text-neutral-900 transition-colors">
              Multiplayer
            </a>
          </nav>

          {/* Auth Actions - Modal Triggered, NOT full page redirect! */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAuthModal("sign-in", "header_nav_signin")}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => openAuthModal("sign-up", "header_nav_signup")}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer px-4"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-sky-100/50 via-indigo-50/40 to-blue-50/30 blur-3xl -z-10 pointer-events-none" />

          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-medium text-sky-800 shadow-2xs mb-6">
              {/* <Sparkles className="h-3.5 w-3.5 text-sky-600" /> */}
              <span className="text-sky-300">•</span>
              <span>Real-Time Visual Collaboration Workspace</span>
              <span className="text-sky-300">•</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl leading-[1.15]">
              Where visual ideas come to life,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                together.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-600 sm:text-lg leading-relaxed">
              Brainstorm, wireframe, design flowcharts, and lead presentations on an infinite
              multiplayer canvas. Zero installation, zero friction.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                size="lg"
                onClick={handleStartBlank}
                className="w-full sm:w-auto h-12 px-7 text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-md gap-2 cursor-pointer"
              >
                <span>Start Whiteboard for Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <a
                href="#templates"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 text-sm font-semibold rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs transition gap-2 cursor-pointer"
              >
                <Layout className="h-4 w-4 text-neutral-500" />
                <span>Explore Templates</span>
              </a>
            </div>

            {/* Value checklist */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Infinite Canvas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Live Multiplayer
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> PDF & Image Upload
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Smart Connectors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Free to explore
              </span>
            </div>
          </div>

          {/* Interactive Hero Canvas Graphic Preview */}
          <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl border border-neutral-200/80 bg-white p-3 sm:p-4 shadow-2xl overflow-hidden">
              {/* Fake Canvas Window Header */}
              <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-400/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="font-medium text-neutral-600 ml-2 text-[11px]">
                    Sprint Planning & Architecture Canvas — Live Demo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 3 Teammates Active
                  </span>
                </div>
              </div>

              {/* Mock Whiteboard Canvas Surface with Simulated Multiplayer */}
              <div className="relative h-[360px] sm:h-[440px] w-full rounded-xl bg-[#FAFAFA] border border-neutral-100 overflow-hidden select-none">
                {/* Canvas Grid Background */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Sticky Note 1 */}
                <div className="absolute top-10 left-8 sm:left-14 w-48 rounded-lg bg-amber-100/90 border border-amber-300/80 p-3.5 shadow-md transform -rotate-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                    Idea Discovery
                  </span>
                  <p className="mt-1 text-xs text-amber-950 font-medium">
                    &quot;Allow PDF & image drops onto the canvas with resize handles.&quot;
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[9px] text-amber-800/80">
                    <span>Alex M.</span>
                    <span className="rounded bg-amber-200/80 px-1 py-0.5 font-bold">5 votes</span>
                  </div>
                </div>

                {/* Sticky Note 2 */}
                <div className="absolute top-12 left-64 sm:left-72 w-52 rounded-lg bg-blue-100/90 border border-blue-300/80 p-3.5 shadow-md transform rotate-1">
                  <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">
                    Architecture Decision
                  </span>
                  <p className="mt-1 text-xs text-blue-950 font-medium">
                    &quot;Curve connectors & elbow arrows anchor seamlessly between nodes.&quot;
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[9px] text-blue-800/80">
                    <span>Sarah K.</span>
                    <span className="rounded bg-blue-200/80 px-1 py-0.5 font-bold">Approved</span>
                  </div>
                </div>

                {/* Flowchart Node 1 */}
                <div className="absolute bottom-16 left-12 sm:left-24 rounded-lg bg-white border-2 border-indigo-500 p-3 shadow-md w-44 text-center">
                  <div className="text-[11px] font-bold text-indigo-900">User Signup Flow</div>
                  <div className="text-[10px] text-neutral-500">Clerk Modal Trigger</div>
                </div>

                {/* Flowchart Node 2 */}
                <div className="absolute bottom-16 left-72 sm:left-80 rounded-lg bg-white border-2 border-emerald-500 p-3 shadow-md w-44 text-center">
                  <div className="text-[11px] font-bold text-emerald-900">Instant Canvas Room</div>
                  <div className="text-[10px] text-neutral-500">Auto-resumes pending action</div>
                </div>

                {/* Simulated Live Multiplayer Cursor 1 */}
                <div className="absolute top-28 left-60 flex items-center gap-1 z-10 pointer-events-none animate-bounce duration-1000">
                  <MousePointer2 className="h-4 w-4 fill-rose-500 text-rose-500 transform -rotate-12" />
                  <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Sarah (Editing)
                  </span>
                </div>

                {/* Simulated Live Multiplayer Cursor 2 */}
                <div className="absolute bottom-28 left-96 hidden sm:flex items-center gap-1 z-10 pointer-events-none">
                  <MousePointer2 className="h-4 w-4 fill-sky-600 text-sky-600 transform -rotate-12" />
                  <span className="rounded-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    David (Presenting)
                  </span>
                </div>

                {/* Simulated Connector Line SVG */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none">
                  <path
                    d="M 240 280 C 270 280, 270 280, 300 280"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                  <polygon points="300,276 308,280 300,284" fill="#4F46E5" />
                </svg>

                {/* Canvas Overlay Callout for Guests */}
                <div className="absolute bottom-4 right-4 rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm max-w-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">

                    <span>Try any template below</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Pick a template to see immediate real value. No upfront sign-in required!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Guest Can See Real Value: Interactive Template Gallery */}
        <section id="templates" className="border-t border-neutral-200/80 bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Ready-to-Use Whiteboard Blueprints
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                  Explore Templates & Start Instantly
                </h2>
                <p className="mt-2 text-sm text-neutral-600 max-w-xl">
                  Choose from curated templates designed for agile teams, system architects, and UX
                  designers. Guests can preview any template or launch it in one click.
                </p>
              </div>

              {/* Template Category Filters */}
              <div className="mt-4 md:mt-0 flex gap-1.5 rounded-lg border border-neutral-200 bg-white p-1 shadow-2xs">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "agile", label: "Agile & Team" },
                    { key: "design", label: "Design & UX" },
                    { key: "dev", label: "Engineering" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`rounded px-3 py-1 text-xs font-medium transition cursor-pointer ${activeTab === t.key
                      ? "bg-neutral-900 text-white shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.filter((tmpl) => {
                if (activeTab === "agile") return tmpl.category.includes("Agile") || tmpl.category.includes("Project");
                if (activeTab === "design") return tmpl.category.includes("Design") || tmpl.category.includes("UI");
                if (activeTab === "dev") return tmpl.category.includes("Engineering");
                return true;
              }).map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-300 hover:shadow-md transition duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-gradient-to-br ${tmpl.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 border border-neutral-200/60">
                          {tmpl.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                        {tmpl.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                        {tmpl.description}
                      </p>

                      {/* Sample Items in Template */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {tmpl.sampleItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-neutral-50 border border-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600 font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          analytics.track("template_previewed", { templateId: tmpl.id });
                          setSelectedTemplate(tmpl);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>

                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(tmpl)}
                        className="h-8 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white gap-1 cursor-pointer"
                      >
                        <span>Use Template</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Core Features Showcase */}
        <section id="features" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Built for High-Velocity Teams
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                Everything you need on a single infinite board
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                Crafted with top-tier performance, real-time multiplayer synchronization, and intuitive
                whiteboard ergonomics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Multiplayer Presence</h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Live presence indicators, colored cursors, and real-time thread comments powered by
                  Liveblocks. Collaborate like you are in the same room.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 mb-4">
                  <GitBranch className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Smart Connectors</h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Elbow arrows, curve lines, and straight connectors with magnetic shape snapping.
                  Rearrange your shapes and connections follow automatically.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mb-4">
                  <FileUp className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">PDF & Image Assets</h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Drop high-res images, screenshots, and multi-page PDFs directly onto your canvas with
                  aspect ratio locks and drag-to-resize handles.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-600 mb-4">
                  <MonitorPlay className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">1-Click Presenter Mode</h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Turn any canvas frame into interactive presentation slides with full-screen focus,
                  keyboard navigation, and laser pointer tools.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-sky-600 mb-4">
                  <Share2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Direct Email & Link Sharing</h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Generate tokenized links with granular permissions (Editor, Commenter, Viewer) and
                  dispatch invitations directly from your signed-in email account.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-100 text-rose-600 mb-4">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Enterprise Security</h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Convex reactive database guarantees atomic mutations and strict server-enforced
                  access control. Clerk authentication keeps workspaces secure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Guest Sandbox Section */}
        <section id="sandbox" className="py-20 bg-[#F8FAFC] border-t border-neutral-200/80">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              Interactive Guest Sandbox
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Try the canvas experience right now
            </h2>
            <p className="mt-3 text-sm text-neutral-600 max-w-xl mx-auto">
              No forms, no credit card. Click below to launch your canvas instantly. If you choose to
              save it, sign in via modal and keep all your work!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={handleStartBlank}
                className="h-12 px-8 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2 cursor-pointer"
              >
                <span>Launch Whiteboard Now</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-neutral-200 bg-white py-10 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Slate" width={20} height={20} />
            <span className="font-semibold text-neutral-800">Slate Whiteboard</span>
            <span>— Real-time collaborative visual workspace</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => openAuthModal("sign-in", "footer_link")}
              className="hover:text-neutral-800 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal("sign-up", "footer_link")}
              className="hover:text-neutral-800 cursor-pointer"
            >
              Sign Up
            </button>
            <span>&copy; {new Date().getFullYear()} Slate. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <selectedTemplate.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-neutral-900">{selectedTemplate.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-4">{selectedTemplate.description}</p>

            <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3 mb-6 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Included in this Blueprint:
              </span>
              {selectedTemplate.sampleItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 text-xs cursor-pointer"
              >
                Close Preview
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const tmpl = selectedTemplate;
                  setSelectedTemplate(null);
                  handleUseTemplate(tmpl);
                }}
                className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
