import { BaseApiClient } from "../base/BaseApiClient";
import { CardResponse } from "./response/card.response";
import { GetRequest } from "./request/get.request";
import { PaginatedResponse } from "../utils/pagination.response";

export class GetAllCardsClient extends BaseApiClient {
  async execute(request: GetRequest, token: string): Promise<PaginatedResponse<CardResponse>> {
    return this.requestWithOutBody<PaginatedResponse<CardResponse>>(
      "GET",
      "/cards/",
      "",
      token,
      request,
    );
  }
}
