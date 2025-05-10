import { CreateBaseClient } from "../base/createBase.client"
import { GetByIdBaseClient } from "../base/getBaseById.client"
import { GetAllBaseClient } from "../base/getAllBase.client"
import { DeleteBaseClient } from "../base/deleteBase.client"
import { UpdateBaseClient } from "../base/updateCard.client"
import { PaginatedResponse } from "../utils/pagination.response"
import { CreateRequest } from "./request/create.request"
import { GetRequest } from "./request/get.request"
import { BaseCardResponse } from "./response/baseCard.response"
// import { UpdateRequest } from "./request/update.request"

export class BaseCardsClient {
    url = "/card-bases/"
    createClient = new CreateBaseClient()
    getAllClient = new GetAllBaseClient()
    getByIdClient = new GetByIdBaseClient()
    updateClient = new UpdateBaseClient()
    deleteClient = new DeleteBaseClient()

    create(request: CreateRequest, token: string): Promise<BaseCardResponse> {
        return this.createClient.execute<CreateRequest,BaseCardResponse>(request, token,this.url);
    }

    getAll(request: GetRequest, token: string): Promise<PaginatedResponse<BaseCardResponse>> {
        return this.getAllClient.execute<BaseCardResponse>(request,token,this.url);
    }
    
    getById(request: string, token: string): Promise<BaseCardResponse> {
        return this.getByIdClient.execute(this.url+request, token);
    }

    // update(request: UpdateRequest, token: string): Promise<BaseCardResponse> {
    //     return this.updateClient.execute<BaseCardResponse>(request, token,`/publications/${request.publicationId}`);
    // }

    delete(request: string, token: string): Promise<void> {
       return this.deleteClient.execute(this.url+request,token);
    }
}