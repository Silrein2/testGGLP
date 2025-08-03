import { DataManager, Question, UserState } from "../Manager/DataManager";
import { QuestionTypes } from "../Page/Enums";
import { ApiClient, ValidationError } from "./ApiClient";

export interface MCQAnswer {
  id: number;
}

export interface MatchAnswer {
  option_a: string;
  option_b: string;
}

export interface YesNoAnswer {
  is_yes: boolean;
}

export interface QuestionRequest {
  id: number;
  answer: MCQAnswer | MatchAnswer | YesNoAnswer;
  seconds_spent: number;
  wrong_count: number;
}

export class QuizService {
  private apiClient: ApiClient;
  private questionEndpoint: string = "api/quizzes/question/";

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  public async getQuestion(): Promise<Question> {
    try {
      const responseData = await this.apiClient.get<Question>(
        this.questionEndpoint,
      );
      DataManager.instance.setQuestion(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async submitQuestion(
    id: number,
    answer: MCQAnswer | MatchAnswer | YesNoAnswer,
    secondSpent: number,
    wrongCount: number,
  ): Promise<UserState> {
    try {
      const requestData: QuestionRequest = {
        id: id,
        answer: answer,
        seconds_spent: secondSpent,
        wrong_count: wrongCount,
      };

      const responseData = await this.apiClient.post<UserState>(
        this.questionEndpoint,
        requestData,
      );
      DataManager.instance.setUserState(responseData);
      if (responseData.next_question != null) {
        DataManager.instance.setQuestion(responseData.next_question);
      }
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
