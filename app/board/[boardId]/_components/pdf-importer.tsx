"use client";

import { useEffect, useRef, useCallback } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@/liveblocks.config";
import { Camera, Layer, LayerType } from "@/types/canvas";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface PdfImporterProps {
  camera: Camera;
}

export const PdfImporter = ({ camera }: PdfImporterProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertMedia = useMutation(
    (
      { storage, setMyPresence },
      payload: {
        src: string;
        name: string;
        width?: number;
        height?: number;
        mediaType: "pdf" | "image";
      }
    ) => {
      const id = nanoid();
      const initialWidth = payload.width || (payload.mediaType === "image" ? 480 : 640);
      const initialHeight = payload.height || (payload.mediaType === "image" ? 360 : 480);

      storage.get("layers").set(
        id,
        new LiveObject<Layer>({
          type: LayerType.Pdf,
          x: -camera.x / camera.zoom + 120,
          y: -camera.y / camera.zoom + 120,
          width: initialWidth,
          height: initialHeight,
          fill: { r: 255, g: 255, b: 255 },
          src: payload.src,
          name: payload.name,
          mediaType: payload.mediaType,
        } as Layer)
      );
      storage.get("layerIds").push(id);
      setMyPresence({ selection: [id] }, { addToHistory: true });
    },
    [camera]
  );

  const processFile = useCallback(
    (file: File) => {
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage =
        file.type.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);

      if (!isPdf && !isImage) {
        toast.error("Please choose an image (PNG, JPG, SVG, WebP) or PDF file");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error("Files must be smaller than 10 MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        const dataUrl = reader.result;

        if (isImage) {
          const img = new Image();
          img.onload = () => {
            let w = img.naturalWidth || 480;
            let h = img.naturalHeight || 360;
            const maxDim = 520;
            if (w > maxDim || h > maxDim) {
              const ratio = Math.min(maxDim / w, maxDim / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }
            insertMedia({
              src: dataUrl,
              name: file.name,
              width: Math.max(120, w),
              height: Math.max(120, h),
              mediaType: "image",
            });
            toast.success(`Photo "${file.name}" uploaded`);
          };
          img.onerror = () => {
            insertMedia({
              src: dataUrl,
              name: file.name,
              width: 480,
              height: 360,
              mediaType: "image",
            });
            toast.success(`Photo "${file.name}" uploaded`);
          };
          img.src = dataUrl;
        } else {
          insertMedia({
            src: dataUrl,
            name: file.name,
            width: 640,
            height: 480,
            mediaType: "pdf",
          });
          toast.success(`PDF "${file.name}" uploaded`);
        }
      };
      reader.readAsDataURL(file);
    },
    [insertMedia]
  );

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    event.target.value = "";
  };

  // Support clipboard paste of photos
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
          e.preventDefault();
          processFile(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  return (
    <div className="absolute right-4 top-28 z-20">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/95 px-3 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur-md hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
        onClick={() => inputRef.current?.click()}
        title="Upload photos (PNG, JPG, SVG, WebP) or PDF documents"
      >
        <ImageIcon className="h-4 w-4 text-sky-500" />
        <span>Upload Photo / PDF</span>
      </button>
    </div>
  );
};