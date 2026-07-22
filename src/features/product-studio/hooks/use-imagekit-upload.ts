import * as React from "react";
import { toast } from "sonner";
import { getMediaUploadAuthAction } from "@/features/cms/actions/media-actions";
import type { ImageUploadItem } from "../types/studio-types";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function useImageKitUpload(
  onUploadSuccess: (item: ImageUploadItem) => void,
): {
  uploading: boolean;
  uploadFile: (file: File) => Promise<void>;
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  handlePasteEvent: (e: React.ClipboardEvent | ClipboardEvent) => Promise<void>;
} {
  const [uploading, setUploading] = React.useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid image format (${file.type || "unknown"}). Allowed: JPG, PNG, WebP, GIF, SVG.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
    }
    return null;
  };

  const uploadFile = React.useCallback(
    async (file: File): Promise<void> => {
      const err = validateFile(file);
      if (err) {
        toast.error(err);
        return;
      }

      setUploading(true);
      const itemId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      try {
        const authRes = await getMediaUploadAuthAction();
        if (!authRes.success || !authRes.data) {
          throw new Error(authRes.error || "Failed to retrieve ImageKit auth signatures");
        }

        const { token, expire, signature, publicKey } = authRes.data;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name.replace(/[^a-zA-Z0-9._-]/g, "_"));
        formData.append("token", token);
        formData.append("expire", String(expire));
        formData.append("signature", signature);
        formData.append("publicKey", publicKey);
        formData.append("useUniqueFileName", "true");
        formData.append("folder", "/products");

        const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Upload failed (${response.status})`);
        }

        const data = await response.json();
        const uploadedUrl = data.url;

        onUploadSuccess({
          id: itemId,
          url: uploadedUrl,
          name: file.name,
          size: file.size,
          progress: 100,
          status: "completed",
          isPrimary: false,
          imagekitFileId: data.fileId,
        });

        toast.success(`Uploaded ${file.name}`);
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : "ImageKit upload failed";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess],
  );

  const uploadFiles = React.useCallback(
    async (files: FileList | File[]): Promise<void> => {
      const list = Array.from(files);
      for (const file of list) {
        await uploadFile(file);
      }
    },
    [uploadFile],
  );

  const handlePasteEvent = React.useCallback(
    async (e: React.ClipboardEvent | ClipboardEvent): Promise<void> => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            toast.info("Pasted image detected. Uploading to ImageKit...");
            await uploadFile(file);
          }
        }
      }
    },
    [uploadFile],
  );

  return {
    uploading,
    uploadFile,
    uploadFiles,
    handlePasteEvent,
  };
}
