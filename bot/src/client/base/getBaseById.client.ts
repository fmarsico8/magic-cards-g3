import { BaseApiClient } from "./BaseApiClient";

export class GetByIdBaseClient extends BaseApiClient {
  async execute<R>(url: string, token: string): Promise<R> {
    return this.requestWithOutBody<R>(
      "GET",
      url,
      "Error fetching element by ID.",
      token,
    );
  }
}
