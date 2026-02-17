import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { addActivity } from "./ai/tools/add-activity";
import type { removeActivity } from "./ai/tools/remove-activity";
import type { setAccommodation } from "./ai/tools/set-accommodation";
import type { setTransport } from "./ai/tools/set-transport";
import type { updateTripMetadata } from "./ai/tools/update-trip-metadata";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type ChatTools = {
  updateTripMetadata: InferUITool<ReturnType<typeof updateTripMetadata>>;
  addActivity: InferUITool<ReturnType<typeof addActivity>>;
  removeActivity: InferUITool<ReturnType<typeof removeActivity>>;
  setAccommodation: InferUITool<ReturnType<typeof setAccommodation>>;
  setTransport: InferUITool<ReturnType<typeof setTransport>>;
};

export type CustomUIDataTypes = {
  "chat-title": string;
  "itinerary-update": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
