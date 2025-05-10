import { CreateBaseClient } from "../base/createBase.client"
import { GetByIdBaseClient } from "../base/getBaseById.client"
import { GetAllBaseClient } from "../base/getAllBase.client"
import { DeleteBaseClient } from "../base/deleteBase.client"
import { UpdateBaseClient } from "../base/updateCard.client"
import { PaginatedResponse } from "../utils/pagination.response"
import { CreateRequest } from "./request/create.request";
import { GetRequest } from "./request/get.request";
import { UpdateRequest } from "./request/update.request";
import { PublicationResponse } from "./response/publication.response";

export class PublicationsClient {
    url = "/publications/"
    createClient = new CreateBaseClient()
    getAllClient = new GetAllBaseClient()
    getByIdClient = new GetByIdBaseClient()
    updateClient = new UpdateBaseClient()
    deleteClient = new DeleteBaseClient() 

    create(request: CreateRequest, token: string): Promise<PublicationResponse> {
        return this.createClient.execute<CreateRequest,PublicationResponse>(request, token,this.url);
    }

    getAll(request: GetRequest, token: string): Promise<PaginatedResponse<PublicationResponse>> {
        return this.getAllClient.execute<PublicationResponse>(request, token,this.url);
    }

    getById(request: string, token: string): Promise<PublicationResponse> {
        return this.getByIdClient.execute<PublicationResponse>(this.url+request, token);
    }

    update(request: UpdateRequest, token: string): Promise<PublicationResponse> {
        return this.updateClient.execute<PublicationResponse>(request, token,this.url);
    }

    delete(request: string, token: string): Promise<void> {
       return this.deleteClient.execute(this.url+request,token);
    }
}