import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare, CornerDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/rex";
import { createNeedPost, createNeedReply } from "@/lib/rex.functions";

export const Route = createFileRoute("/needs")({
  head: () => ({
    meta: [
      { title: "Need Board — RExchange" },
      {
        name: "description",
        content:
          "Post an open ask to the campus community and get answers inline. Deadlines, setup help, teammates — ask here.",
      },
      { property: "og:title", content: "Need Board — RExchange" },
      {
        property: "og:description",
        content: "Post an open ask to the campus community and get answers inline.",
      },
    ],
  }),
  component: NeedBoard,
});

interface NeedPost {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
}
interface NeedReply extends NeedPost {
  post_id: string;
}

function NeedBoard() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["need-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("need_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NeedPost[];
    },
  });

  const { data: replies = [] } = useQuery({
    queryKey: ["need-replies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("need_replies")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as NeedReply[];
    },
  });

  const addPost = useMutation({
    mutationFn: async () => {
      const cleanName = name.trim().slice(0, 60);
      const cleanBody = body.trim().slice(0, 600);
      if (cleanName.length < 2) throw new Error("Add your name");
      if (cleanBody.length < 5) throw new Error("Say a bit more about what you need");
      await createNeedPost({ data: { authorName: cleanName, body: cleanBody } });
    },
    onSuccess: () => {
      setBody("");
      toast.success("Posted to the Need Board");
      qc.invalidateQueries({ queryKey: ["need-posts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not post"),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl">Need Board</h1>
      <p className="mt-3 text-muted-foreground">
        One flat thread. Ask anything, answer anything — no nesting, no noise.
      </p>

      <form
        className="card-soft mt-8 space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          addPost.mutate();
        }}
      >
        <Input
          value={name}
          maxLength={60}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          value={body}
          maxLength={600}
          rows={3}
          placeholder="What do you need help with?"
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" disabled={addPost.isPending}>
          {addPost.isPending ? "Posting…" : "Post ask"}
        </Button>
      </form>

      <div className="mt-8 space-y-5">
        {isLoading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : posts.map((post) => (
              <NeedThread
                key={post.id}
                post={post}
                replies={replies.filter((r) => r.post_id === post.id)}
              />
            ))}
      </div>
    </div>
  );
}

function NeedThread({ post, replies }: { post: NeedPost; replies: NeedReply[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const addReply = useMutation({
    mutationFn: async () => {
      const cleanName = name.trim().slice(0, 60);
      const cleanBody = body.trim().slice(0, 600);
      if (cleanName.length < 2 || cleanBody.length < 2) throw new Error("Add your name and a reply");
      await createNeedReply({
        data: { postId: post.id, authorName: cleanName, body: cleanBody },
      });
    },
    onSuccess: () => {
      setBody("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["need-replies"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not reply"),
  });

  return (
    <article className="card-soft p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{post.author_name}</p>
        <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
      </div>
      <p className="mt-2 leading-relaxed text-foreground">{post.body}</p>

      {replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-l-2 border-sand-deep pl-4">
          {replies.map((r) => (
            <li key={r.id} className="text-sm">
              <span className="flex items-start gap-2">
                <CornerDownRight className="mt-0.5 size-3.5 shrink-0 text-forest" />
                <span>
                  <span className="font-medium">{r.author_name}</span>{" "}
                  <span className="text-muted-foreground">{r.body}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            addReply.mutate();
          }}
        >
          <Input
            value={name}
            maxLength={60}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            value={body}
            maxLength={600}
            rows={2}
            placeholder="Your reply"
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={addReply.isPending}>
              Reply
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline"
        >
          <MessageSquare className="size-3.5" /> Reply
        </button>
      )}
    </article>
  );
}
