import { BaseApiClient } from "./BaseApiClient";

export class DeleteBaseClient extends BaseApiClient {
  async execute<R>(url: string, token: string): Promise<void> {
        this.requestWithOutBody<R>(
        "DELETE",
        url,
        "Error fetching element by ID.",
        token,
    );
  }
}
