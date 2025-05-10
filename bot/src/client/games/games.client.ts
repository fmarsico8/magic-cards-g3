import { CreateRequest } from "./request/create.request"
import { GetRequest } from "./request/get.request"
import { GameResponse } from "./response/game.response"
import { CreateBaseClient } from "../base/createBase.client"
import { GetByIdBaseClient } from "../base/getBaseById.client"
import { GetAllBaseClient } from "../base/getAllBase.client"
import { DeleteBaseClient } from "../base/deleteBase.client"
import { UpdateBaseClient } from "../base/updateCard.client"
import { PaginatedResponse } from "../utils/pagination.response"
export class GamesClient {
    url = "/games/"
    createClient = new CreateBaseClient()
    getAllClient = new GetAllBaseClient()
    getByIdClient = new GetByIdBaseClient()
    deleteClient = new DeleteBaseClient() 

    create(request: CreateRequest, token: string): Promise<GameResponse> {
        return this.createClient.execute<CreateRequest,GameResponse>(request, token,this.url);
    }

    getAll(request: GetRequest, token: string): Promise<PaginatedResponse<GameResponse>> {
        return this.getAllClient.execute<GameResponse>(request, token,this.url);
    }
    getById(request: string, token: string): Promise<GameResponse> {
        return this.getByIdClient.execute<GameResponse>(this.url+request, token);
    }

    // update(request: UpdateRequest, token: string): Promise<GameResponse> {
    //     return this.updateClient.execute<GameResponse>(request, token,this.url);
    // }

    delete(request: string, token: string): Promise<void> {
       return this.deleteClient.execute(this.url+request,token);
    }
}