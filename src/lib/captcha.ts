type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

export async function verifyCaptcha(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return {
        success: true,
        message: "Captcha verification skipped in development",
        errors: [],
        raw: null,
      };
    }

    throw new Error("TURNSTILE_SECRET_KEY is not configured");
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    },
  );

  const result = (await response.json()) as TurnstileResponse;

  return {
    success: result.success,
    message: result.success ? "Captcha verified" : "Captcha verification failed",
    errors: result["error-codes"] ?? [],
    raw: result,
  };
}
