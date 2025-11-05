import { _decorator, Node, Label } from "cc";
import { Page } from "../../Page";
import { ButtonStates, PageStates, QuestionTypes } from "../../Enums";
import { Game1Type1Option } from "./Game1Type1Option";
import { Game1Type2Option } from "./Game1Type2Option";
import { Game1Type2Slot } from "./Game1Type2Slot";
import {
  DataManager,
  MCQOption,
  Question,
  QUESTION_CHANGED,
  Quizzes,
  UserState,
} from "../../../Manager/DataManager";
import { UIManager } from "../../../Manager/UIManager";
import { GameManager } from "../../../Manager/GameManager";
import { MatchAnswer, MCQAnswer, YesNoAnswer } from "../../../Api/QuizService";
import { Game1QuizTransition } from "./Game1QuizTransition";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
import { waitForCondition } from "../../../Utils/Utils";

const { ccclass, property } = _decorator;

@ccclass("Game1Page")
export class Game1Page extends Page {
  @property({ type: Label })
  private questionTitleLabel: Label | null = null;

  @property({ type: Label })
  private questionLabel: Label | null = null;

  @property({ type: Node })
  private type1UI: Node | null = null;

  @property({ type: Node })
  private type2UI: Node | null = null;

  @property({ type: Node })
  private type3UI: Node | null = null;

  @property({ type: [Game1Type1Option] })
  private type1Options: Game1Type1Option[] = [];

  @property({ type: [Game1Type2Option] })
  private type2Options: Game1Type2Option[] = [];

  @property({ type: [Game1Type2Slot] })
  private type2Slots: Game1Type2Slot[] = [];

  @property({ type: [Game1Type2Option] })
  private type3Options: Game1Type2Option[] = [];

  @property({ type: [Game1Type2Slot] })
  private type3Slots: Game1Type2Slot[] = [];

  private question: Question | null = null;
  private wrongCount: number = 0;
  private selectedAnswer: number | string[] | boolean | null = null;
  private game1QuizTransition: Game1QuizTransition | null;
  private currentQuestionType: QuestionTypes = QuestionTypes.NONE;
  private questionCount: number = 0;
  private loadedQuestion: boolean = false;

  private offlineLogin: boolean = false;
  private questions: any[] = [];
  private answers: any[] = [];
  private matchCount: number = 0;

  onLoad() {
    this.game1QuizTransition = this.node.getComponent(Game1QuizTransition);

    this.questions = [
      {
        id: 1,
        question_type: "MCQ",
        text: "This is question 1 (MCQ) (Answer A)",
        mcq_options: [
          { id: 1, text: "Answer A" },
          { id: 2, text: "Answer B" },
          { id: 3, text: "Answer C" },
          { id: 4, text: "Answer D" },
          { id: 5, text: "Answer E" },
          { id: 6, text: "Answer F" },
        ],
        match_pairs: [],
        yes_no_answer: null,
      },
      {
        id: 2,
        question_type: "MATCH",
        text: "This is question 2 (Match)",
        mcq_options: [],
        match_pairs: {
          options_a: ["LEFT C", "LEFT B", "LEFT A", "LEFT D"],
          options_b: ["RIGHT A", "RIGHT C", "RIGHT B", "RIGHT D"],
        },
        yes_no_answer: null,
      },
      {
        id: 3,
        question_type: "YES_NO",
        text: "This is question 3 (Yes/No)",
        mcq_options: [],
        match_pairs: [],
        yes_no_answer: { statement: "Statement (Yes)" },
      },
      {
        id: 4,
        question_type: "MCQ",
        text: "This is Question 4 (CCC)",
        mcq_options: [
          { id: 13, text: "AAA" },
          { id: 14, text: "BBB" },
          { id: 15, text: "CCC" },
          { id: 16, text: "DDD" },
        ],
        match_pairs: [],
        yes_no_answer: null,
      },
      {
        id: 5,
        question_type: "MATCH",
        text: "This is Question 5",
        mcq_options: [],
        match_pairs: {
          options_a: ["Left 1", "Left 2", "Left 3", "Left 4"],
          options_b: ["Right 2", "Right 4", "Right 3", "Right 1"],
        },
        yes_no_answer: null,
      },
      {
        id: 6,
        question_type: "YES_NO",
        text: "This is Question 6",
        mcq_options: [],
        match_pairs: [],
        yes_no_answer: { statement: "Statement (No)" },
      },
    ];

    this.answers = [
      {
        id: 1,
      },
      {},
      { is_yes: true },
      {
        id: 15,
      },
      {},
      { is_yes: false },
    ];
  }
  start() {
    /*DataManager.instance.node.on(
      QUESTION_CHANGED,
      this.onQuestionChanged,
      this,
    );*/
  }

  protected setPageState() {
    this.pageState = PageStates.Game1;
  }

  public onEnter() {
    super.onEnter();
    this.pageManager.targetGamePageState = this.pageState;
    this.offlineLogin = GameManager.instance.offlineLogin;
    this.getQuestion();
    this.setUI(true);
    this.showType(-1);
    this.questionLabel.string = "";
    this.questionCount = 0;
    GameManager.instance.timer.resetTimer();
    UIManager.instance.showGameUI(true);
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    UIManager.instance.showScoreStartUI(this.pageState, async () => {
      if (!this.loadedQuestion) {
        UIManager.instance.showLoading(true);
        await waitForCondition(this.loadedQuestion);
      }
      UIManager.instance.showLoading(false);
      this.setQuestion();
      GameManager.instance.timer.startTimer();
    });
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
    this.questionCount = 0;
  }

  private async getQuestion() {
    if (!this.offlineLogin) {
      this.loadedQuestion = false;
      await GameManager.instance.quizService.getQuestion();
      await GameManager.instance.userService.fetchUserState();
      this.setUI();
      this.loadedQuestion = true;
    } else {
      this.loadedQuestion = true;
    }
  }

  private setUI(init: boolean = false) {
    const userState: UserState = DataManager.instance.userState;
    const quizzes: Quizzes = userState.quizzes;
    //UIManager.instance.gameUI.updateScore(quizzes.total_score_quizzes);
    UIManager.instance.gameUI.updateTotalScore(quizzes.total_score_quizzes);
    if (init) {
      //UIManager.instance.gameUI.updateScore(0);
      UIManager.instance.gameUI.updateTotalScore(0);
    }
    let titleString =
      LocalizationManager.instance.getLocalizedString("general.question") +
      " " +
      this.questionCount;
    if (this.questionCount === 0) {
      titleString =
        LocalizationManager.instance.getLocalizedString("general.welcome");
    }
    this.questionTitleLabel.string = titleString;
  }

  private endQuiz() {
    GameManager.instance.timer.stopTimer();
    this.transitionPage(PageStates.Result);
  }

  private setQuestion() {
    if (!this.offlineLogin) {
      this.question = DataManager.instance.question;
    } else {
      this.question = this.questions[this.questionCount];
      this.matchCount = 0;
    }
    this.currentQuestionType = this.question?.question_type;
    if (this.question?.question_type == null) {
      this.endQuiz();
      return;
    }
    this.questionCount++;
    this.setUI();
    this.wrongCount = 0;
    this.questionLabel.string = this.question.text;
    if (this.question.question_type === QuestionTypes.MCQ) {
      this.showType(1);
      this.type1Options.forEach(
        (type1Answer: Game1Type1Option, index: number) => {
          type1Answer.init(this.question.mcq_options[index] ?? null, this);
        },
      );
      this.game1QuizTransition.showType1(true);
    } else if (this.question.question_type === QuestionTypes.MATCH) {
      this.showType(2);
      this.type2Options.forEach(
        (type2Option: Game1Type2Option, index: number) => {
          type2Option.init(
            this.question.match_pairs.options_b[index] ?? null,
            this.type2Slots,
            this,
            10,
          );
        },
      );

      this.type2Slots.forEach((type2Slots: Game1Type2Slot, index: number) => {
        type2Slots.init(this.question.match_pairs.options_a[index] ?? null);
      });
    } else if (this.question.question_type === QuestionTypes.YES_NO) {
      this.showType(3);
      const type3SlotData = [
        LocalizationManager.instance.getLocalizedString("game_1.yes"),
        LocalizationManager.instance.getLocalizedString("game_1.no"),
      ];
      this.type3Options.forEach((type3Option: Game1Type2Option) => {
        type3Option.init(
          this.question.yes_no_answer.statement,
          this.type3Slots,
          this,
          15,
        );
      });

      this.type3Slots.forEach((type3Slots: Game1Type2Slot, index: number) => {
        type3Slots.init(type3SlotData[index]);
      });
    }

    this.setBlockInput(true);
    this.game1QuizTransition.playTransition(
      this.currentQuestionType,
      true,
      () => {
        this.setBlockInput(false);
      },
    );
  }

  private showType(type: number) {
    this.type1UI.active = type === 1;
    this.type2UI.active = type === 2;
    this.type3UI.active = type === 3;
  }

  public async onClickType1Button(data: MCQOption) {
    this.selectedAnswer = data.id;
    const type1Answer: Game1Type1Option = this.type1Options.find(
      (x) => x.data.id === data.id,
    );
    const correct = await this.onSubmitAnswer();
    if (correct) {
      type1Answer.setState(ButtonStates.Correct);
    } else {
      type1Answer.setState(ButtonStates.Wrong);
    }
  }

  public async onDropType2Option(
    optionData: string,
    slotData: string,
    type2Option: Game1Type2Option,
  ) {
    if (slotData == null) {
      type2Option.moveResetPosition();
      return;
    }
    if (this.currentQuestionType === QuestionTypes.MATCH) {
      this.selectedAnswer = [slotData, optionData];
    } else if (this.currentQuestionType === QuestionTypes.YES_NO) {
      const type3Answers = { Yes: true, No: false };
      this.selectedAnswer = type3Answers[slotData];
    }
    const correct = await this.onSubmitAnswer();
    if (!correct) {
      type2Option.moveResetPosition();
    } else {
      type2Option.setDisable(true);
    }
  }

  private async onSubmitAnswer() {
    this.setBlockInput(true);
    let correct = false;
    let haveNextQuestion = false;
    const questionType = this.question.question_type;
    let answer: MCQAnswer | MatchAnswer | YesNoAnswer | null = null;
    if (questionType === QuestionTypes.MCQ) {
      answer = {
        id: this.selectedAnswer as number,
      };
    } else if (questionType === QuestionTypes.MATCH) {
      answer = {
        option_a: this.selectedAnswer[0],
        option_b: this.selectedAnswer[1],
      };
    } else if (questionType === QuestionTypes.YES_NO) {
      answer = {
        is_yes: this.selectedAnswer as boolean,
      };
    }
    if (!this.offlineLogin) {
      try {
        const response = await GameManager.instance.quizService.submitQuestion(
          this.question.id,
          answer,
          GameManager.instance.timer.getElapsedTime(),
          this.wrongCount,
        );
        correct = true;
        haveNextQuestion = response.next_question != null;
      } catch (error) {
        if (error.statusCode == 400) {
          correct = false;
          this.wrongCount++;
        }
      }
    } else {
      correct = this.checkOfflineAnswer(answer);
      if (questionType === QuestionTypes.MATCH) {
        if (correct) this.matchCount++;
        if (this.matchCount >= 4) haveNextQuestion = true;
      } else if (correct) {
        haveNextQuestion = true;
      }
    }
    if (haveNextQuestion) {
      this.scheduleOnce(() => {
        this.onQuestionChanged();
      }, 0.4);
    } else {
      this.setBlockInput(false);
    }
    const feedbackText = correct
      ? ""
      : LocalizationManager.instance.getLocalizedString("game_1.think_twice");
    UIManager.instance.playFeedbackUI(correct, feedbackText, () => {});
    return correct;
  }

  private checkOfflineAnswer(
    answer: MCQAnswer | MatchAnswer | YesNoAnswer,
  ): boolean {
    const questionType = this.question.question_type;
    const correctAnswer = this.answers[this.questionCount - 1];
    let correct = false;
    if (questionType === QuestionTypes.MCQ) {
      correct = answer.id === correctAnswer.id;
    } else if (questionType === QuestionTypes.MATCH) {
      correct = answer.option_a.slice(-1) === answer.option_b.slice(-1);
    } else if (questionType === QuestionTypes.YES_NO) {
      correct = answer.is_yes === correctAnswer.is_yes;
    }
    return correct;
  }

  private onQuestionChanged() {
    this.setBlockInput(true);
    this.game1QuizTransition.playTransition(
      this.currentQuestionType,
      false,
      () => {
        this.setBlockInput(false);
        this.setQuestion();
      },
    );
  }
}
