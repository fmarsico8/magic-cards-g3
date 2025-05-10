import { BaseApiClient } from "./BaseApiClient";


export class CreateBaseClient extends BaseApiClient {
  async execute<T,R>(request: T, token: string, url: string): Promise<R> {
    return this.requestWithBody<R>(
      "POST",
      url,
      "Error creating element.",
      request,
      token,
    );
  }
}
