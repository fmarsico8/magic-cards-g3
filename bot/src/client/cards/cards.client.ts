import { PaginatedResponse } from "../utils/pagination.response"
import { CreateBaseClient } from "../base/createBase.client"
import { GetByIdBaseClient } from "../base/getBaseById.client"
import { GetAllBaseClient } from "../base/getAllBase.client"
import { DeleteBaseClient } from "../base/deleteBase.client"
import { UpdateBaseClient } from "../base/updateCard.client"
import { CreateRequest } from "./request/create.request"
import { GetRequest } from "./request/get.request"
import { UpdateRequest } from "./request/update.request"
import { CardResponse } from "./response/card.response"

export class CardsClient {
    url = "/cards/"
    createClient = new CreateBaseClient()
    getAllClient = new GetAllBaseClient()
    getByIdClient = new GetByIdBaseClient()
    updateClient = new UpdateBaseClient()
    deleteClient = new DeleteBaseClient() 

    create(request: CreateRequest, token: string): Promise<CardResponse> {
        return this.createClient.execute<CreateRequest,CardResponse>(request, token,this.url);
    }

    getAll(request: GetRequest, token: string): Promise<PaginatedResponse<CardResponse>> {
        return this.getAllClient.execute<CardResponse>(request, token,this.url);
    }

    getById(request: string, token: string): Promise<CardResponse> {
        return this.getByIdClient.execute<CardResponse>(this.url+request, token);
    }

    update(request: UpdateRequest, token: string): Promise<CardResponse> {
        return this.updateClient.execute<CardResponse>(request, token,this.url);
    }

    delete(request: string, token: string): Promise<void> {
       return this.deleteClient.execute(this.url+request,token);
    }
}