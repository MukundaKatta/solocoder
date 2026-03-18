import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/sessions — list sessions for a project
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("project_id", projectId)
      .order("started_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/sessions — create or update a session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, projectId, phase } = body;

    if (action === "create") {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          project_id: projectId,
          phase,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ session: data });
    }

    if (action === "pause") {
      const { data, error } = await supabase
        .from("sessions")
        .update({ status: "paused" })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ session: data });
    }

    if (action === "resume") {
      const { data, error } = await supabase
        .from("sessions")
        .update({ status: "active" })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ session: data });
    }

    if (action === "complete") {
      const { data, error } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          tasks_completed: body.tasksCompleted || 0,
          tokens_used: body.tokensUsed || 0,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ session: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
