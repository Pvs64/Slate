"use client";

import React from "react";

export const TemplatePreviewSystemDesign = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-md bg-gradient-to-b from-sky-50/80 to-blue-50/40 p-2.5 flex items-center justify-center border border-sky-100/80">
    <svg viewBox="0 0 200 90" className="w-full h-full">
      {/* Gateway */}
      <rect x="8" y="28" width="46" height="34" rx="5" className="fill-white stroke-sky-400 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="31" y="45" textAnchor="middle" className="text-[7.5px] font-semibold fill-sky-950">Gateway</text>
      <circle cx="16" cy="54" r="2" className="fill-sky-400" />
      <line x1="22" y1="54" x2="46" y2="54" className="stroke-sky-200 stroke-[1.5]" />

      {/* Connection from Gateway */}
      <path d="M 54 45 L 82 25" className="stroke-sky-400 stroke-[1.5] fill-none" strokeDasharray="2 2" />
      <path d="M 54 45 L 82 65" className="stroke-sky-400 stroke-[1.5] fill-none" strokeDasharray="2 2" />

      {/* Service Node */}
      <rect x="82" y="10" width="48" height="30" rx="5" className="fill-white stroke-blue-500 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="106" y="24" textAnchor="middle" className="text-[7.5px] font-semibold fill-blue-900">Auth API</text>
      <rect x="88" y="29" width="36" height="4" rx="2" className="fill-blue-100" />

      {/* Cache Node */}
      <rect x="82" y="50" width="48" height="30" rx="5" className="fill-white stroke-indigo-400 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="106" y="64" textAnchor="middle" className="text-[7.5px] font-semibold fill-indigo-900">Redis</text>
      <rect x="88" y="69" width="36" height="4" rx="2" className="fill-indigo-100" />

      {/* Connection to DB */}
      <path d="M 130 25 L 152 45" className="stroke-blue-400 stroke-[1.5] fill-none" />
      <path d="M 130 65 L 152 45" className="stroke-indigo-400 stroke-[1.5] fill-none" />

      {/* Database Cylinder */}
      <rect x="152" y="24" width="40" height="42" rx="6" className="fill-white stroke-cyan-500 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <ellipse cx="172" cy="31" rx="16" ry="5" className="fill-cyan-100 stroke-cyan-500 stroke-[1.5]" />
      <text x="172" y="52" textAnchor="middle" className="text-[7.5px] font-semibold fill-cyan-950">Postgres</text>
      <line x1="158" y1="58" x2="186" y2="58" className="stroke-cyan-200 stroke-[1.5]" />
    </svg>
  </div>
);

export const TemplatePreviewDatabaseDesign = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-md bg-gradient-to-b from-emerald-50/80 to-teal-50/40 p-2.5 flex items-center justify-center border border-emerald-100/80">
    <svg viewBox="0 0 200 90" className="w-full h-full">
      {/* Table 1: users */}
      <g filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))">
        <rect x="8" y="10" width="82" height="70" rx="5" className="fill-white stroke-emerald-500 stroke-[1.5]" />
        <rect x="8" y="10" width="82" height="18" rx="5" className="fill-emerald-600" />
        <text x="49" y="23" textAnchor="middle" className="text-[8px] font-bold fill-white">users</text>
        <rect x="14" y="34" width="14" height="6" rx="2" className="fill-amber-100" />
        <text x="21" y="39" textAnchor="middle" className="text-[5.5px] font-bold fill-amber-800">PK</text>
        <text x="32" y="39" className="text-[6.5px] font-medium fill-neutral-700">id : uuid</text>
        <line x1="14" y1="44" x2="84" y2="44" className="stroke-neutral-100" />
        <text x="16" y="53" className="text-[6.5px] fill-neutral-600">email : varchar</text>
        <text x="16" y="65" className="text-[6.5px] fill-neutral-600">role : string</text>
      </g>

      {/* Relationship link */}
      <path d="M 90 38 C 102 38, 102 38, 114 38" className="stroke-emerald-600 stroke-[1.5] fill-none" />
      <circle cx="90" cy="38" r="2.5" className="fill-emerald-600" />
      <circle cx="114" cy="38" r="2.5" className="fill-emerald-600" />

      {/* Table 2: orders */}
      <g filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))">
        <rect x="114" y="10" width="78" height="70" rx="5" className="fill-white stroke-teal-500 stroke-[1.5]" />
        <rect x="114" y="10" width="78" height="18" rx="5" className="fill-teal-600" />
        <text x="153" y="23" textAnchor="middle" className="text-[8px] font-bold fill-white">orders</text>
        <rect x="120" y="34" width="14" height="6" rx="2" className="fill-amber-100" />
        <text x="127" y="39" textAnchor="middle" className="text-[5.5px] font-bold fill-amber-800">PK</text>
        <text x="138" y="39" className="text-[6.5px] font-medium fill-neutral-700">id</text>
        <rect x="120" y="47" width="14" height="6" rx="2" className="fill-blue-100" />
        <text x="127" y="52" textAnchor="middle" className="text-[5.5px] font-bold fill-blue-800">FK</text>
        <text x="138" y="52" className="text-[6.5px] font-medium fill-neutral-700">user_id</text>
        <text x="122" y="65" className="text-[6.5px] fill-neutral-600">amount : dec</text>
      </g>
    </svg>
  </div>
);

export const TemplatePreviewCodeReview = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-md bg-gradient-to-b from-violet-50/80 to-purple-50/40 p-2.5 flex items-center justify-center border border-violet-100/80">
    <svg viewBox="0 0 200 90" className="w-full h-full">
      {/* Code Editor Window */}
      <g filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))">
        <rect x="8" y="8" width="128" height="74" rx="5" className="fill-[#1e1e2e] stroke-violet-300 stroke-[1]" />
        {/* Window controls */}
        <circle cx="16" cy="16" r="2.5" className="fill-rose-400" />
        <circle cx="23" cy="16" r="2.5" className="fill-amber-400" />
        <circle cx="30" cy="16" r="2.5" className="fill-emerald-400" />
        <text x="40" y="18" className="text-[6px] fill-violet-300 font-mono">auth.ts</text>
        <line x1="8" y1="23" x2="136" y2="23" className="stroke-violet-900" />

        {/* Code lines */}
        <text x="14" y="34" className="text-[6.5px] fill-violet-400 font-mono">1</text>
        <text x="24" y="34" className="text-[6.5px] fill-purple-300 font-mono">const verify =</text>
        <text x="76" y="34" className="text-[6.5px] fill-pink-300 font-mono">(token) =&gt;</text>

        <text x="14" y="47" className="text-[6.5px] fill-violet-400 font-mono">2</text>
        <text x="24" y="47" className="text-[6.5px] fill-cyan-300 font-mono">  if (!token)</text>
        <text x="64" y="47" className="text-[6.5px] fill-rose-300 font-mono">throw 401;</text>

        <text x="14" y="60" className="text-[6.5px] fill-violet-400 font-mono">3</text>
        <text x="24" y="60" className="text-[6.5px] fill-emerald-300 font-mono">  return jwt.decode();</text>

        {/* Highlight line */}
        <rect x="22" y="66" width="90" height="8" rx="2" className="fill-violet-800/60" />
        <text x="25" y="72" className="text-[6px] fill-violet-200 font-mono">✓ tests passing</text>
      </g>

      {/* Reviewer Note Sticker */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))">
        <rect x="122" y="20" width="70" height="52" rx="4" className="fill-amber-50 stroke-amber-300 stroke-[1.5]" />
        <rect x="122" y="20" width="70" height="14" rx="4" className="fill-amber-200/80" />
        <text x="128" y="30" className="text-[6.5px] font-bold fill-amber-900">Review Note</text>
        <circle cx="184" cy="27" r="3" className="fill-emerald-500" />
        <text x="128" y="44" className="text-[6px] fill-neutral-700">Check token expiry</text>
        <text x="128" y="53" className="text-[6px] fill-neutral-700">before returning!</text>
        <rect x="128" y="59" width="36" height="8" rx="2" className="fill-emerald-100" />
        <text x="146" y="65" textAnchor="middle" className="text-[5.5px] font-semibold fill-emerald-800">Approved</text>
      </g>
    </svg>
  </div>
);

export const TemplatePreviewMindMap = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-md bg-gradient-to-b from-amber-50/80 to-orange-50/40 p-2.5 flex items-center justify-center border border-amber-100/80">
    <svg viewBox="0 0 200 90" className="w-full h-full">
      {/* Central Root Node */}
      <path d="M 100 45 C 75 45, 65 24, 48 24" className="stroke-amber-400 stroke-[2] fill-none" />
      <path d="M 100 45 C 75 45, 65 66, 48 66" className="stroke-orange-400 stroke-[2] fill-none" />
      <path d="M 100 45 C 125 45, 135 24, 152 24" className="stroke-emerald-400 stroke-[2] fill-none" />
      <path d="M 100 45 C 125 45, 135 66, 152 66" className="stroke-sky-400 stroke-[2] fill-none" />

      {/* Center Box */}
      <rect x="74" y="32" width="52" height="26" rx="13" className="fill-amber-500 stroke-amber-600 stroke-[1.5]" filter="drop-shadow(0 2px 4px rgba(245,158,11,0.25))" />
      <text x="100" y="47" textAnchor="middle" className="text-[8px] font-bold fill-white">DSA Roadmap</text>

      {/* Branch 1 */}
      <rect x="8" y="13" width="46" height="22" rx="11" className="fill-white stroke-amber-400 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="31" y="27" textAnchor="middle" className="text-[7.5px] font-semibold fill-amber-900">Trees</text>

      {/* Branch 2 */}
      <rect x="8" y="55" width="46" height="22" rx="11" className="fill-white stroke-orange-400 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="31" y="69" textAnchor="middle" className="text-[7.5px] font-semibold fill-orange-900">Graphs</text>

      {/* Branch 3 */}
      <rect x="146" y="13" width="46" height="22" rx="11" className="fill-white stroke-emerald-400 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="169" y="27" textAnchor="middle" className="text-[7.5px] font-semibold fill-emerald-900">DP</text>

      {/* Branch 4 */}
      <rect x="146" y="55" width="46" height="22" rx="11" className="fill-white stroke-sky-400 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <text x="169" y="69" textAnchor="middle" className="text-[7.5px] font-semibold fill-sky-900">Sorting</text>
    </svg>
  </div>
);

export const TemplatePreviewStudyPlanner = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-md bg-gradient-to-b from-rose-50/80 to-pink-50/40 p-2.5 flex items-center justify-center border border-rose-100/80">
    <svg viewBox="0 0 200 90" className="w-full h-full">
      {/* Column 1 */}
      <rect x="8" y="8" width="56" height="74" rx="5" className="fill-white stroke-rose-200 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <rect x="8" y="8" width="56" height="16" rx="5" className="fill-rose-500" />
      <text x="36" y="19" textAnchor="middle" className="text-[7.5px] font-bold fill-white">Day 1 • Mon</text>
      <rect x="13" y="29" width="46" height="18" rx="3" className="fill-rose-50/80 border border-rose-100" />
      <circle cx="20" cy="38" r="3" className="fill-emerald-500" />
      <text x="26" y="40" className="text-[6px] font-medium fill-neutral-800">2x LeetCode</text>
      <rect x="13" y="52" width="46" height="18" rx="3" className="fill-neutral-50" />
      <circle cx="20" cy="61" r="3" className="fill-neutral-300" />
      <text x="26" y="63" className="text-[6px] font-medium fill-neutral-600">Review Trie</text>

      {/* Column 2 */}
      <rect x="72" y="8" width="56" height="74" rx="5" className="fill-white stroke-purple-200 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <rect x="72" y="8" width="56" height="16" rx="5" className="fill-purple-600" />
      <text x="100" y="19" textAnchor="middle" className="text-[7.5px] font-bold fill-white">Day 2 • Tue</text>
      <rect x="77" y="29" width="46" height="18" rx="3" className="fill-purple-50/80" />
      <circle cx="84" cy="38" r="3" className="fill-emerald-500" />
      <text x="90" y="40" className="text-[6px] font-medium fill-neutral-800">System Design</text>
      <rect x="77" y="52" width="46" height="18" rx="3" className="fill-neutral-50" />
      <circle cx="84" cy="61" r="3" className="fill-neutral-300" />
      <text x="90" y="63" className="text-[6px] font-medium fill-neutral-600">Rate Limiter</text>

      {/* Column 3 */}
      <rect x="136" y="8" width="56" height="74" rx="5" className="fill-white stroke-blue-200 stroke-[1.5]" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
      <rect x="136" y="8" width="56" height="16" rx="5" className="fill-blue-600" />
      <text x="164" y="19" textAnchor="middle" className="text-[7.5px] font-bold fill-white">Day 3 • Wed</text>
      <rect x="141" y="29" width="46" height="24" rx="3" className="fill-blue-50/80" />
      <text x="147" y="39" className="text-[6px] font-bold fill-blue-900">Mock Sprint</text>
      <text x="147" y="47" className="text-[5.5px] fill-blue-700">45m Live Coding</text>
    </svg>
  </div>
);

export const TemplatePreviewLectureNotes = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-md bg-gradient-to-b from-cyan-50/80 to-sky-50/40 p-2.5 flex items-center justify-center border border-cyan-100/80">
    <svg viewBox="0 0 200 90" className="w-full h-full">
      {/* Notebook Paper Sheet */}
      <g filter="drop-shadow(0 1px 3px rgba(0,0,0,0.08))">
        <rect x="14" y="8" width="172" height="74" rx="5" className="fill-white stroke-cyan-200 stroke-[1.5]" />
        {/* Margin line */}
        <line x1="36" y1="8" x2="36" y2="82" className="stroke-rose-200 stroke-[1]" />

        {/* Title */}
        <text x="44" y="21" className="text-[8px] font-bold fill-neutral-900">Computer Networks • Chapter 4</text>
        <line x1="44" y1="25" x2="178" y2="25" className="stroke-neutral-100" />

        {/* OSI Model Highlighting Box */}
        <rect x="44" y="30" width="134" height="20" rx="3" className="fill-cyan-50 border border-cyan-200" />
        <text x="50" y="40" className="text-[6.5px] font-bold fill-cyan-900">Key Concept: OSI 7-Layer Hierarchy</text>
        <text x="50" y="47" className="text-[5.5px] fill-cyan-700">Application &gt; Transport (TCP/UDP) &gt; Network (IP)</text>

        {/* Question Note */}
        <rect x="44" y="54" width="134" height="22" rx="3" className="fill-amber-50/80 stroke-amber-200 stroke-[1]" />
        <circle cx="52" cy="62" r="3" className="fill-amber-400" />
        <text x="58" y="64" className="text-[6px] font-bold fill-amber-900">Exam Q: TCP vs UDP 3-Way Handshake?</text>
        <text x="58" y="72" className="text-[5.5px] fill-neutral-600">• TCP: Reliable stream (SYN, SYN-ACK, ACK)</text>
      </g>
    </svg>
  </div>
);

export const TemplatePreview = ({ id }: { id: string }) => {
  switch (id) {
    case "system-design":
      return <TemplatePreviewSystemDesign />;
    case "database-design":
      return <TemplatePreviewDatabaseDesign />;
    case "code-review":
      return <TemplatePreviewCodeReview />;
    case "mind-map":
      return <TemplatePreviewMindMap />;
    case "study-planner":
      return <TemplatePreviewStudyPlanner />;
    case "lecture-notes":
      return <TemplatePreviewLectureNotes />;
    default:
      return null;
  }
};
