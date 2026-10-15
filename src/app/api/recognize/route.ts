import { createRecognitionHandler } from "@/lib/server/recognize-route";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = createRecognitionHandler();
