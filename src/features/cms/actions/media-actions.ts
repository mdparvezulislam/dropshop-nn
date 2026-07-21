"use server";

import { auth } from "@/shared/lib/auth";
import { checkPermission } from "@/shared/lib/check-permission";
import { MediaService } from "../services/media-service";
import { createMediaSchema, updateMediaSchema } from "../types/validation";
import { revalidatePath } from "next/cache";

export async function getMediaUploadAuthAction(): Promise<{
  success: boolean;
  data?: {
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Create");
    const service = new MediaService();
    return { success: true, data: service.getUploadAuthParams() };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get upload auth",
    };
  }
}

export async function registerMediaAssetAction(formData: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Create");
    const validated = createMediaSchema.parse(formData);
    const service = new MediaService();
    const user = session?.user as { id?: string } | undefined;
    const result = await service.registerAsset(validated, user?.id);
    revalidatePath("/dashboard/content/media");
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to register media",
    };
  }
}

export async function updateMediaAssetAction(formData: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Update");
    const validated = updateMediaSchema.parse(formData);
    const { id, ...rest } = validated;
    const service = new MediaService();
    const result = await service.updateAsset(id, rest);
    revalidatePath("/dashboard/content/media");
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update media",
    };
  }
}

export async function deleteMediaAssetAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.Delete");
    const service = new MediaService();
    await service.deleteAsset(id);
    revalidatePath("/dashboard/content/media");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete media",
    };
  }
}

export async function listMediaAction(filters: {
  type?: string;
  folder?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const session = await auth();
    checkPermission(session, "Content.View");
    const service = new MediaService();
    const result = await service.list(
      {
        type: filters.type as any,
        folder: filters.folder,
        search: filters.search,
      },
      { page: filters.page ?? 1, limit: filters.limit ?? 24 },
    );
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list media",
    };
  }
}

export async function listMediaFoldersAction(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Content.View");
    const service = new MediaService();
    const folders = await service.listFolders();
    return { success: true, data: folders };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list folders",
    };
  }
}
