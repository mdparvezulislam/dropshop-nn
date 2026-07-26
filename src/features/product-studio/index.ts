export {
  saveStudioProductAction,
  publishStudioProductAction,
  archiveStudioProductAction,
  deleteStudioProductAction,
  getStudioProductAction,
  getBrandsAction,
  getCategoriesAction,
} from "./actions/studio-actions";
export { useProductStudio } from "./hooks/use-product-studio";
export { useAutosave } from "./hooks/use-autosave";
export { StudioRightSidebar } from "./components/sidebar/studio-right-sidebar";
export type { StudioFormState } from "./hooks/use-product-studio";
export type { SaveState } from "./hooks/use-autosave";
export type { VariantRow } from "./components/sections/variants-section";
export type { MediaItem } from "./components/sections/media-section";
export { STUDIO_SECTIONS } from "./hooks/use-product-studio";
export { createStudioProductSchema, updateStudioProductSchema } from "./types/validation";
export type { CreateStudioProductInput, UpdateStudioProductInput } from "./types/validation";
