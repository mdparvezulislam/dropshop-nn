export const CMS_EVENTS = {
  CONTENT_CREATED: "cms.content.created",
  CONTENT_UPDATED: "cms.content.updated",
  CONTENT_PUBLISHED: "cms.content.published",
  CONTENT_ARCHIVED: "cms.content.archived",
  CONTENT_DELETED: "cms.content.deleted",
  MEDIA_UPLOADED: "cms.media.uploaded",
  MEDIA_DELETED: "cms.media.deleted",
  NAVIGATION_UPDATED: "cms.navigation.updated",
} as const;

export type CmsEventType = (typeof CMS_EVENTS)[keyof typeof CMS_EVENTS];
