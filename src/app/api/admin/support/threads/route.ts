import { listSupportThreads } from "@/lib/supportChats";

export const runtime = "nodejs";

export async function GET() {
  try {
    const threads = await listSupportThreads();

    const items = threads.map((t) => {
      const lastRead = t.lastReadBySupportAt ?? t.createdAt;
      const unread = t.lastMemberMessageAt ? Date.parse(t.lastMemberMessageAt) > Date.parse(lastRead) : false;

      return {
        id: t.id,
        status: t.status,
        email: t.email ?? "",
        name: t.name ?? "",
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
        unread,
        lastMessage: t.lastMessage ?? null,
      };
    });

    return new Response(JSON.stringify({ ok: true, threads: items }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
    });
  }
}

