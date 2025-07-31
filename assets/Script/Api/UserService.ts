import { ApiClient } from "./ApiClient";
import { BusinessUnit, Language } from "../Manager/DataManager";

export class UserService {
  private apiClient: ApiClient;
  private languageEndpoint: string = "api/users/languages/";
  private businessUnitEndpoint: string = "api/users/business-units/";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  public async getLanguages(): Promise<Language[]> {
    try {
      const responseData = await this.apiClient.get<Language[]>(
        this.languageEndpoint,
      );
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getBusinessUnits(): Promise<BusinessUnit[]> {
    try {
      const responseData = await this.apiClient.get<BusinessUnit[]>(
        this.businessUnitEndpoint,
      );
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
