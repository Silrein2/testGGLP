import { ApiClient } from "./ApiClient";
import {
  BusinessUnit,
  DataManager,
  Language,
  UserState,
} from "../Manager/DataManager";

export class UserService {
  private apiClient: ApiClient;
  private languageEndpoint: string = "api/users/languages/";
  private businessUnitEndpoint: string = "api/users/business-units/";
  private userStateEndpoint: string = "api/users/state/";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  public async getLanguages(): Promise<Language[]> {
    try {
      const responseData = await this.apiClient.get<Language[]>(
        this.languageEndpoint,
      );
      DataManager.instance.setLanguages(responseData);
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
      DataManager.instance.setBusinessUnits(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async fetchUserState(): Promise<UserState> {
    try {
      const responseData = await this.apiClient.get<UserState>(
        this.userStateEndpoint,
      );
      DataManager.instance.setUserState(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
