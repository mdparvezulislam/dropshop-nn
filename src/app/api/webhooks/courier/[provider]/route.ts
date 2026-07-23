import { NextRequest, NextResponse } from "next/server";
import { WebhookService } from "@/features/courier/services/webhook-service";
import { logger } from "@/lib/utils/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider } = await params;

  const validProviders = ["steadfast", "pathao", "redx", "ecourier", "paperfly"];
  if (!validProviders.includes(provider)) {
    return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });
  }

  const signature = req.headers.get("x-courier-signature") ?? "";
  const rawBody = await req.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const webhookService = new WebhookService();
  const result = await webhookService.processProviderWebhook(provider, signature, rawBody, payload);

  logger.info("Courier webhook processed", { provider, success: result.success, error: result.error });

  if (result.success) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: result.error }, { status: 422 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    message: "Courier webhook endpoint ready",
    providers: ["steadfast", "pathao", "redx", "ecourier", "paperfly"],
  });
}
