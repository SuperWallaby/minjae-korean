const DEVICE_ID_HEADER = "x-device-id";
const SAFE_DEVICE_ID = /^[a-zA-Z0-9._:-]{8,128}$/;

export class RequestAuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestAuthError";
  }
}

export function getKoreanQuizDeviceRawId(request: Request): string {
  const raw = request.headers.get(DEVICE_ID_HEADER)?.trim();
  if (!raw || !SAFE_DEVICE_ID.test(raw)) {
    throw new RequestAuthError(400, "X-Device-Id header is required.");
  }
  return raw;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof RequestAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}
