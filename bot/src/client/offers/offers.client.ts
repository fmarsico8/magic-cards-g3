import { CreateBaseClient } from "../base/createBase.client"
import { GetByIdBaseClient } from "../base/getBaseById.client"
import { GetAllBaseClient } from "../base/getAllBase.client"
import { DeleteBaseClient } from "../base/deleteBase.client"
import { UpdateBaseClient } from "../base/updateCard.client"
import { PaginatedResponse } from "../utils/pagination.response"
import { CreateRequest } from "./request/create.request";
import { GetRequest } from "./request/get.request";
import { UpdateRequest } from "./request/update.request";
import { OfferResponse } from "./response/offer.response";

export class OffersClient {
    url = "/offers/"    
    createClient = new CreateBaseClient()
    getAllClient = new GetAllBaseClient()
    getByIdClient = new GetByIdBaseClient()
    updateClient = new UpdateBaseClient()
    deleteClient = new DeleteBaseClient() 

    create(request: CreateRequest, token: string): Promise<OfferResponse> {
        return this.createClient.execute<CreateRequest,OfferResponse>(request, token,this.url);
    }

    getAll(request: GetRequest, token: string): Promise<PaginatedResponse<OfferResponse>> {
        return this.getAllClient.execute<OfferResponse>(request, token,this.url);
    }

    getById(request: string, token: string): Promise<OfferResponse> {
        return this.getByIdClient.execute<OfferResponse>(this.url+request, token);
    }

    update(request: UpdateRequest, token: string): Promise<OfferResponse> {
        return this.updateClient.execute<OfferResponse>(request, token,this.url);
    }

    delete(request: string, token: string): Promise<void> {
       return this.deleteClient.execute(this.url+request,token);
    }
}