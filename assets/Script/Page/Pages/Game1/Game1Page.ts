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
} from "../../../Manager/DataManager";
import { UIManager } from "../../../Manager/UIManager";
import { GameManager } from "../../../Manager/GameManager";
import { MatchAnswer, MCQAnswer, YesNoAnswer } from "../../../Api/QuizService";
import { Game1QuizTransition } from "./Game1QuizTransition";

const { ccclass, property } = _decorator;

@ccclass("Game1Page")
export class Game1Page extends Page {
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

  onLoad() {
    this.game1QuizTransition = this.node.getComponent(Game1QuizTransition);
  }
  start() {
    DataManager.instance.node.on(
      QUESTION_CHANGED,
      this.onQuestionChanged,
      this,
    );
  }

  protected setPageState() {
    this.pageState = PageStates.Game1;
  }

  public onEnter() {
    super.onEnter();
    this.setUI();
    this.showType(-1);
    this.questionLabel.string = "";
    GameManager.instance.timer.resetTimer();
    UIManager.instance.showGameUI(true);
  }

  public onPostEnterTransition(): void {
    super.onPostEnterTransition();
    UIManager.instance.showScoreStartUI("QUESTION & ANSWER", () => {
      this.setQuestion();
      GameManager.instance.timer.startTimer();
    });
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
  }

  private setUI() {
    const quizzes: Quizzes = DataManager.instance.userState.quizzes;
    UIManager.instance.gameUI.updateScore(quizzes.current_score_quizzes);
    UIManager.instance.gameUI.updateTotalScore(quizzes.total_score_quizzes);
  }

  private endQuiz() {
    GameManager.instance.timer.stopTimer();
    this.transitionPage(PageStates.Result);
  }

  private setQuestion() {
    this.question = DataManager.instance.question;
    this.currentQuestionType = this.question.question_type;
    if (this.question.question_type == null) {
      this.endQuiz();
      return;
    }
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
          );
        },
      );

      this.type2Slots.forEach((type2Slots: Game1Type2Slot, index: number) => {
        type2Slots.init(this.question.match_pairs.options_a[index] ?? null);
      });
    } else if (this.question.question_type === QuestionTypes.YES_NO) {
      this.showType(3);
      const type3SlotData = ["Yes", "No"];
      this.type3Options.forEach((type3Option: Game1Type2Option) => {
        type3Option.init("", this.type3Slots, this);
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

  private setBlockInput(enable: boolean) {
    this.pageManager.enableBlockInput(enable);
  }

  private showType(type: number) {
    this.type1UI.active = type === 1;
    this.type2UI.active = type === 2;
    this.type3UI.active = type === 3;
  }

  public onClickType1Button(data: MCQOption) {
    this.selectedAnswer = data.id;
    const type1Answer: Game1Type1Option = this.type1Options.find(
      (x) => x.data.id === data.id,
    );
    UIManager.instance.playFeedbackUI(
      data.is_correct,
      this.onFeedbackComplete.bind(this),
    );
    if (data.is_correct) {
      type1Answer.setState(ButtonStates.Correct);
    } else {
      type1Answer.setState(ButtonStates.Wrong);
    }
  }

  public onDropType2Option(
    optionData: string,
    slotData: string,
    type2Option: Game1Type2Option,
  ) {
    if (slotData == null) {
      type2Option.moveResetPosition();
      return;
    }
    let correct: boolean = false;
    if (this.currentQuestionType === QuestionTypes.MATCH) {
      this.selectedAnswer = [slotData, optionData];
      const matchPairs = this.question.match_pairs;
      const optionIndex = matchPairs.options_b.indexOf(optionData);
      const slotIndex = matchPairs.options_a.indexOf(slotData);
      correct = optionIndex === slotIndex;
      if (!correct) {
        type2Option.moveResetPosition();
      } else {
        type2Option.setDisable(true);
      }
    } else if (this.currentQuestionType === QuestionTypes.YES_NO) {
      const type3Answers = { Yes: true, No: false };
      this.selectedAnswer = type3Answers[slotData];
      correct = true;
    }

    UIManager.instance.playFeedbackUI(
      correct,
      this.onFeedbackComplete.bind(this),
    );
  }

  private async onFeedbackComplete(correct: boolean) {
    if (correct) {
      this.setBlockInput(true);
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
      try {
        const response = await GameManager.instance.quizService.submitQuestion(
          this.question.id,
          answer,
          GameManager.instance.timer.getElapsedTime(),
          this.wrongCount,
        );
        this.setBlockInput(response?.next_question != null);
      } catch (error) {
        this.setBlockInput(false);
      }
    } else {
      this.wrongCount++;
    }
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
