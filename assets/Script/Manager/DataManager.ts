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

export interface Text {
  key: string;
  text: string;
  order: number;
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

export interface Phishing {
  current_score_phishing: number;
  total_score_phishing: number;
  highest_score_phishing: number;
  total_seconds_at_highest_score_phishing: number;
  times_played_phishing: number;
}

export interface FakeBoss {
  total_score_fake_boss: number;
  total_seconds_fake_boss: number;
  best_total_seconds_fake_boss: number;
}

export interface UserState {
  email: string;
  business_unit_id: number;
  business_unit: string;
  is_first_login: boolean;
  quizzes: Quizzes;
  phishing: Phishing;
  fake_boss: FakeBoss;
  total_score_all: number;
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

export interface FakeBossQuestion {
  id: number;
  title: string;
  answer_options: FakeBossAnswerOption[];
}

export interface FakeBossAnswerOption {
  id: number;
  text: string;
  bee_safe_text: string;
  is_correct: boolean;
}

export interface PhishingEmail {
  id: number;
  title: string;
  image: string;
  created_at: string;
  indicators: PhishingIndicator[];
}

export interface PhishingIndicator {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

export interface PhishingEmailAnswer {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const QUESTION_CHANGED = "question-changed";

@ccclass("DataManager")
export class DataManager extends Component {
  private static _instance: DataManager | null = null;

  public languages: Language[] = [];
  public businessUnits: BusinessUnit[] = [];
  public texts: Text[] = [];
  public userState: UserState | null = null;
  public question: Question | null = null;
  public phishingEmails: PhishingEmail[] = [];
  public fakeBossQuestions: FakeBossQuestion[] = [];

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

  public setTexts(texts: Text[]) {
    this.texts = texts;
  }

  public setUserState(userState: UserState) {
    this.userState = userState;
  }

  public setQuestion(question: Question) {
    this.question = question;
    this.node.emit(QUESTION_CHANGED, question);
  }

  public setPhishingEmails(phishingEmails: PhishingEmail[]) {
    this.phishingEmails = phishingEmails;
  }

  public setFakeBossQuestions(fakeBossQuestions: FakeBossQuestion[]) {
    this.fakeBossQuestions = fakeBossQuestions;
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
      phishing: {
        current_score_phishing: 0,
        total_score_phishing: 0,
        highest_score_phishing: 0,
        total_seconds_at_highest_score_phishing: 0,
        times_played_phishing: 0,
      },
      fake_boss: {
        total_score_fake_boss: 0,
        total_seconds_fake_boss: 0,
        best_total_seconds_fake_boss: 0,
      },
      total_score_all: 0,
      next_question: null,
    };

    this.setUserState(dummy);
  }
}
