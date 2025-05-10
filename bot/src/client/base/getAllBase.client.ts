import { PaginatedResponse } from "../utils/pagination.response";
import { BaseApiClient } from "./BaseApiClient";

export class GetAllBaseClient extends BaseApiClient {
  async execute<R>(request: Record<string, any>, token: string, url: string): Promise<PaginatedResponse<R>> {
    return this.requestWithOutBody<PaginatedResponse<R>>(
      "GET",
      url,
      "Error fetching elements.",
      token,
      request,
    );
  }
}
