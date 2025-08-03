export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...defaultHeaders,
    };
  }

  public setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = "Token " + token;
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));

        if (
          errorData.type === "validation_error" &&
          Array.isArray(errorData.errors)
        ) {
          throw new ValidationError(errorData.errors, response.status);
        }

        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorData.message || "Unknown error"}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        const text = await response.text();
        return text ? JSON.parse(text) : ({} as T);
      }
    } catch (error: any) {
      console.error(`API Request Error for ${url}:`, error);
      throw error;
    }
  }

  public get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url = `${endpoint}?${queryString}`;
    }
    return this.request<T>(url, { method: "GET" });
  }

  public post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export class ValidationError extends Error {
  public errors: { code: string; detail: string; attr: string }[];

  constructor(
    errors: any[],
    public statusCode: number,
  ) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }

  public printError(): string {
    return this.errors
      .map((e) => `An issue occurred: ${e.detail} (Code: ${e.code})`)
      .join("\n");
  }
}
