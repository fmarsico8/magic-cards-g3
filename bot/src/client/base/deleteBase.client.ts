import { BaseApiClient } from "./BaseApiClient";

export class DeleteBaseClient extends BaseApiClient {
  async execute<R>(req: string, token: string): Promise<R> {
    return this.requestWithOutBody<R>(
        "DELETE",
        req,
        "Error fetching element by ID.",
        token,
    );
  }
}
