import { ApiClient } from "./ApiClient";
import { AuthToken } from "../Manager/DataManager";

export interface AuthRequest {
  email: string;
  business_unit_id: number;
}

export class AuthService {
  private apiClient: ApiClient;
  private loginEndpoint: string = "auth/token/login/";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  public async login(email: string, businessUnitId): Promise<AuthToken> {
    try {
      const requestData: AuthRequest = {
        email: email,
        business_unit_id: businessUnitId,
      };
      const responseData = await this.apiClient.post<AuthToken>(
        this.loginEndpoint,
        requestData,
      );
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
