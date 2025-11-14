import {
  DataManager,
  FakeBossQuestion,
  PhishingEmail,
  PhishingEmailAnswer,
  Question,
  UserState,
} from "../Manager/DataManager";
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

export interface PhishingEmailRequest {
  id: number;
  answer: PhishingEmailAnswer;
  seconds_spent: number;
}

export interface PhisingScoreRequest {
  score: number;
  seconds: number;
  total_score: number;
  times_played: number;
}

export interface FakeBossScoreRequest {
  score: number;
  seconds: number;
}

export class QuizService {
  private apiClient: ApiClient;
  private questionEndpoint: string = "api/quizzes/question/";
  private phishingEmailEndpoint: string = "api/phishing/emails/";
  private phishingEmailStartEndEndpoint: string =
    "api/phishing/emails/start-end";
  private phishingScoreEndpoint: string = "api/phishing/score/";
  private fakeBossQuestionEndpoint: string = "api/fake-boss/question/";
  private fakeBossScoreEndpoint: string = "api/fake-boss/score/";

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

  public async getPhishingEmail(): Promise<PhishingEmail[]> {
    try {
      const responseData = await this.apiClient.get<PhishingEmail[]>(
        this.phishingEmailEndpoint,
      );
      DataManager.instance.setPhishingEmails(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async submitPhishingEmail(
    id: number,
    answer: PhishingEmailAnswer,
    secondSpent: number,
  ): Promise<UserState> {
    try {
      const requestData: PhishingEmailRequest = {
        id: id,
        answer: answer,
        seconds_spent: secondSpent,
      };
      const responseData = await this.apiClient.post<UserState>(
        this.phishingEmailEndpoint,
        requestData,
      );
      DataManager.instance.setUserState(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async submitPhishingEmailStartEnd(isStart: boolean) {
    try {
      const requestData = isStart
        ? {
            start: true,
          }
        : { end: true };
      const responseData = await this.apiClient.post<UserState>(
        this.phishingEmailStartEndEndpoint,
        requestData,
      );
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async submitPhishingScore(
    score: number,
    seconds: number,
    total_score: number,
    times_played: number,
  ): Promise<UserState> {
    try {
      const requestData: PhisingScoreRequest = {
        score: score,
        seconds: seconds,
        total_score: total_score,
        times_played: times_played,
      };

      const responseData = await this.apiClient.post<UserState>(
        this.phishingScoreEndpoint,
        requestData,
      );
      DataManager.instance.setUserState(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getFakeBossQuestion(): Promise<FakeBossQuestion[]> {
    try {
      const responseData = await this.apiClient.get<FakeBossQuestion[]>(
        this.fakeBossQuestionEndpoint,
      );
      DataManager.instance.setFakeBossQuestions(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async submitFakeBossScore(
    score: number,
    seconds: number,
  ): Promise<UserState> {
    try {
      const requestData: FakeBossScoreRequest = {
        score: score,
        seconds: seconds,
      };

      const responseData = await this.apiClient.post<UserState>(
        this.fakeBossScoreEndpoint,
        requestData,
      );
      DataManager.instance.setUserState(responseData);
      return responseData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
