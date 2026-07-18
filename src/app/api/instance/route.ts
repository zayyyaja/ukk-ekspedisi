import os from "node:os";

export const dynamic = "force-dynamic";

export async function GET() {
    return Response.json(
        {
            message: "Request berhasil diproses",
            instance: os.hostname(),
            timestamp: new Date().toISOString(),
        },
        {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        },
    );
}