const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  formData?: FormData;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, formData, headers, ...rest } = options;
  console.log(
    API_URL,path
  )
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: formData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
    body: formData
      ? formData
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });
  console.log(response)

  let data: Record<string, unknown> = {};

  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(
      typeof data.message === "string"
        ? data.message
        : "Something went wrong. Please try again.",
      response.status,
    );
  }
  console.log(data)
  return data as T;
}

export { API_URL };
