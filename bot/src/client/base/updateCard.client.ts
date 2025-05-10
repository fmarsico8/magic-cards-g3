import { BaseApiClient } from "./BaseApiClient";

export class UpdateBaseClient extends BaseApiClient {
  async execute<R>(request: Record<string, any>, token: string, url: string): Promise<R> {
    return this.requestWithBody<R>(
      "PUT",
      url,
      "Error updating element.",
      request,
      token,
    );
  }
}
