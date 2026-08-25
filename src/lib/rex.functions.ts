import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getListingContact = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ listingId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("listings")
      .select("contact")
      .eq("id", data.listingId)
      .maybeSingle();
    if (error) throw new Error("Could not load contact");
    return { contact: row?.contact ?? "" };
  });

export const createNeedPost = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        authorName: z.string().trim().min(2).max(60),
        body: z.string().trim().min(5).max(600),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("need_posts")
      .insert({ author_name: data.authorName, body: data.body });
    if (error) throw new Error("Could not post");
    return { ok: true };
  });

export const createNeedReply = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        postId: z.string().uuid(),
        authorName: z.string().trim().min(2).max(60),
        body: z.string().trim().min(2).max(600),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("need_replies")
      .insert({ post_id: data.postId, author_name: data.authorName, body: data.body });
    if (error) throw new Error("Could not reply");
    return { ok: true };
  });

export const listWatchKeywords = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ deviceId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("watch_keywords")
      .select("id, keyword")
      .eq("device_id", data.deviceId)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Could not load watchlist");
    return rows ?? [];
  });

export const addWatchKeyword = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({ deviceId: z.string().uuid(), keyword: z.string().trim().min(2).max(40) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("watch_keywords")
      .insert({ device_id: data.deviceId, keyword: data.keyword });
    if (error) throw new Error("Could not add keyword");
    return { ok: true };
  });

export const removeWatchKeyword = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ deviceId: z.string().uuid(), id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Scoped by device_id so one device can never delete another device's keywords.
    const { error } = await supabaseAdmin
      .from("watch_keywords")
      .delete()
      .eq("id", data.id)
      .eq("device_id", data.deviceId);
    if (error) throw new Error("Could not remove keyword");
    return { ok: true };
  });
