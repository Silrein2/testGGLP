import { _decorator, Component, Node } from "cc";
import { QuestionTypes } from "../Page/Enums";
const { ccclass, property } = _decorator;

export interface AuthToken {
  auth_token: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface BusinessUnit {
  id: number;
  name: string;
  description: string;
}

export interface Quizzes {
  current_score_quizzes: number;
  total_score_quizzes: number;
  total_questions_answered_this_session: number;
  highest_score_quizzes: number;
  total_seconds_at_highest_score_quizzes: number;
  times_played_quizzes: number;
}

export interface UserState {
  email: string;
  business_unit_id: number;
  business_unit: string;
  is_first_login: boolean;
  quizzes: Quizzes;
  next_question: Question;
}

export interface MCQOption {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface MatchPair {
  options_a: string[];
  options_b: string[];
}

export interface YesNoAnswer {
  statement: string;
}

export interface Question {
  id: number;
  question_type: QuestionTypes;
  text: string;
  mcq_options: MCQOption[];
  match_pairs: MatchPair;
  yes_no_answer: YesNoAnswer;
}

export const QUESTION_CHANGED = "question-changed";

@ccclass("DataManager")
export class DataManager extends Component {
  private static _instance: DataManager | null = null;

  public languages: Language[] = [];
  public businessUnits: BusinessUnit[] = [];
  public userState: UserState | null = null;
  public question: Question | null = null;

  public static get instance(): DataManager {
    if (this._instance) {
      return this._instance;
    }
    return null;
  }

  onLoad() {
    if (DataManager._instance && DataManager._instance !== this) {
      this.destroy();
      return;
    }
    DataManager._instance = this;
  }

  public setLanguages(languages: Language[]) {
    this.languages = languages;
  }

  public setBusinessUnits(businessUnits: BusinessUnit[]) {
    this.businessUnits = businessUnits;
  }

  public setUserState(userState: UserState) {
    this.userState = userState;
  }

  public setQuestion(question: Question) {
    this.question = question;
    this.node.emit(QUESTION_CHANGED, question);
  }

  public setDummyUserState() {
    const dummy: UserState = {
      email: "test@amway.com",
      business_unit_id: 1,
      business_unit: "HR",
      is_first_login: false,
      quizzes: {
        current_score_quizzes: 850,
        total_score_quizzes: 0,
        total_questions_answered_this_session: 0,
        highest_score_quizzes: 1150,
        total_seconds_at_highest_score_quizzes: 75,
        times_played_quizzes: 91,
      },
    };

    this.setUserState(dummy);
  }
}
