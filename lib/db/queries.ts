import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "../errors";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  message,
  stream,
  type User,
  user,
  vote,
  itinerary,
  itineraryItem,
  type Itinerary,
  type ItineraryItem,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const [existingItinerary] = await db
      .select({ id: itinerary.id })
      .from(itinerary)
      .where(eq(itinerary.chatId, id));
    if (existingItinerary) {
      await db
        .delete(itineraryItem)
        .where(eq(itineraryItem.itineraryId, existingItinerary.id));
      await db.delete(itinerary).where(eq(itinerary.chatId, id));
    }
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);
    const itinerariesForChats = await db
      .select({ id: itinerary.id })
      .from(itinerary)
      .where(inArray(itinerary.chatId, chatIds));
    const itineraryIds = itinerariesForChats.map((i) => i.id);
    if (itineraryIds.length > 0) {
      await db
        .delete(itineraryItem)
        .where(inArray(itineraryItem.itineraryId, itineraryIds));
    }
    await db.delete(itinerary).where(inArray(itinerary.chatId, chatIds));
    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    return await db.update(message).set({ parts }).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
  } catch (_error) {
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

const now = () => new Date();

export async function createItinerary({ chatId }: { chatId: string }) {
  try {
    const [created] = await db
      .insert(itinerary)
      .values({
        chatId,
        createdAt: now(),
        updatedAt: now(),
      })
      .returning();
    return created;
  } catch (error) {
    const cause =
      error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to create itinerary: ${cause}`
    );
  }
}

export async function getItineraryByChatId({
  chatId,
}: {
  chatId: string;
}): Promise<Itinerary | null> {
  try {
    const [row] = await db
      .select()
      .from(itinerary)
      .where(eq(itinerary.chatId, chatId));
    return row ?? null;
  } catch (error) {
    const cause =
      error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to get itinerary by chat id: ${cause}`
    );
  }
}

export async function getItineraryById({
  id,
}: {
  id: string;
}): Promise<Itinerary | null> {
  try {
    const [row] = await db.select().from(itinerary).where(eq(itinerary.id, id));
    return row ?? null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get itinerary by id"
    );
  }
}

export async function updateItineraryMetadata({
  id,
  tripName,
  destination,
  startDate,
  endDate,
  adults,
  children,
}: {
  id: string;
  tripName?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
}) {
  try {
    const updates: Partial<Itinerary> = { updatedAt: now() };
    if (tripName !== undefined) {
      updates.tripName = tripName;
    }
    if (destination !== undefined) {
      updates.destination = destination;
    }
    if (startDate !== undefined) {
      updates.startDate = startDate;
    }
    if (endDate !== undefined) {
      updates.endDate = endDate;
    }
    if (adults !== undefined) {
      updates.adults = adults;
    }
    if (children !== undefined) {
      updates.children = children;
    }
    await db.update(itinerary).set(updates).where(eq(itinerary.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update itinerary metadata"
    );
  }
}

export async function addItineraryItem({
  itineraryId,
  day,
  timeBlock,
  type,
  name,
  description,
  price,
  imageUrl,
  sortOrder,
}: {
  itineraryId: string;
  day: string;
  timeBlock: "morning" | "evening";
  type: "activity" | "accommodation" | "transport" | "meal";
  name: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  sortOrder?: number;
}) {
  try {
    await db.insert(itineraryItem).values({
      itineraryId,
      day,
      timeBlock,
      type,
      name,
      description,
      price,
      imageUrl,
      sortOrder: sortOrder ?? 0,
      createdAt: now(),
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to add itinerary item"
    );
  }
}

export async function removeItineraryItem({ id }: { id: string }) {
  try {
    await db.delete(itineraryItem).where(eq(itineraryItem.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to remove itinerary item"
    );
  }
}

export async function getItineraryItemsByItineraryId({
  itineraryId,
}: {
  itineraryId: string;
}): Promise<ItineraryItem[]> {
  try {
    return await db
      .select()
      .from(itineraryItem)
      .where(eq(itineraryItem.itineraryId, itineraryId))
      .orderBy(asc(itineraryItem.day), asc(itineraryItem.sortOrder));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get itinerary items"
    );
  }
}

export async function updateItineraryItem({
  id,
  day,
  timeBlock,
  type,
  name,
  description,
  price,
  imageUrl,
  sortOrder,
}: {
  id: string;
  day?: string;
  timeBlock?: "morning" | "evening";
  type?: "activity" | "accommodation" | "transport" | "meal";
  name?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  sortOrder?: number;
}) {
  try {
    const updates: Partial<ItineraryItem> = {};
    if (day !== undefined) {
      updates.day = day;
    }
    if (timeBlock !== undefined) {
      updates.timeBlock = timeBlock;
    }
    if (type !== undefined) {
      updates.type = type;
    }
    if (name !== undefined) {
      updates.name = name;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (price !== undefined) {
      updates.price = price;
    }
    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl;
    }
    if (sortOrder !== undefined) {
      updates.sortOrder = sortOrder;
    }
    if (Object.keys(updates).length === 0) {
      return;
    }
    await db.update(itineraryItem).set(updates).where(eq(itineraryItem.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update itinerary item"
    );
  }
}

export async function setAccommodation({
  itineraryId,
  day,
  timeBlock,
  name,
  description,
  price,
  imageUrl,
}: {
  itineraryId: string;
  day: string;
  timeBlock: "morning" | "evening";
  name: string;
  description?: string;
  price?: string;
  imageUrl?: string;
}) {
  try {
    const existing = await db
      .select()
      .from(itineraryItem)
      .where(
        and(
          eq(itineraryItem.itineraryId, itineraryId),
          eq(itineraryItem.day, day),
          eq(itineraryItem.timeBlock, timeBlock),
          eq(itineraryItem.type, "accommodation")
        )
      )
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(itineraryItem)
        .set({
          name,
          description,
          price,
          imageUrl,
        })
        .where(eq(itineraryItem.id, existing[0].id));
    } else {
      await db.insert(itineraryItem).values({
        itineraryId,
        day,
        timeBlock,
        type: "accommodation",
        name,
        description,
        price,
        imageUrl,
        sortOrder: 0,
        createdAt: now(),
      });
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to set accommodation"
    );
  }
}

export async function setTransport({
  itineraryId,
  day,
  timeBlock,
  name,
  description,
  price,
  imageUrl,
}: {
  itineraryId: string;
  day: string;
  timeBlock: "morning" | "evening";
  name: string;
  description?: string;
  price?: string;
  imageUrl?: string;
}) {
  try {
    const existing = await db
      .select()
      .from(itineraryItem)
      .where(
        and(
          eq(itineraryItem.itineraryId, itineraryId),
          eq(itineraryItem.day, day),
          eq(itineraryItem.timeBlock, timeBlock),
          eq(itineraryItem.type, "transport")
        )
      )
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(itineraryItem)
        .set({
          name,
          description,
          price,
          imageUrl,
        })
        .where(eq(itineraryItem.id, existing[0].id));
    } else {
      await db.insert(itineraryItem).values({
        itineraryId,
        day,
        timeBlock,
        type: "transport",
        name,
        description,
        price,
        imageUrl,
        sortOrder: 0,
        createdAt: now(),
      });
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to set transport"
    );
  }
}
