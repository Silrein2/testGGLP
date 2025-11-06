import {
  _decorator,
  Component,
  instantiate,
  Layout,
  Node,
  Prefab,
  ScrollView,
  SpriteFrame,
} from "cc";
import { PageStates } from "../../Enums";
import { Page } from "../../Page";
import { GameManager } from "../../../Manager/GameManager";
import { UIManager } from "../../../Manager/UIManager";
import { Game2Option } from "./Game2Option";
import { Game2QuizTransition } from "./Game2QuizTransition";
import { Game2Tutorial } from "./Game2Tutorial";
import { Game2Bee } from "./Game2Bee";
import { LocalizationManager } from "../../../Manager/LocalizationManager";
import { Game2Question } from "./Game2Question";
import { shuffleArray, waitForCondition } from "../../../Utils/Utils";
import {
  DataManager,
  PhishingEmail,
  UserState,
} from "../../../Manager/DataManager";
const { ccclass, property } = _decorator;

@ccclass("Game2Page")
export class Game2Page extends Page {
  @property({ type: Layout })
  public questionLayout: Layout | null = null;

  @property({ type: Prefab })
  private questionPrefab: Prefab | null = null;

  @property({ type: Layout })
  public optionLayout: Layout | null = null;

  @property({ type: Prefab })
  private optionPrefab: Prefab | null = null;

  @property({ type: Prefab })
  public slotPrefab: Prefab | null = null;

  @property({ type: Game2Tutorial })
  private tutorial: Game2Tutorial | null = null;

  @property({ type: Game2Bee })
  private game2Bee: Game2Bee | null = null;

  @property({ type: [Game2Question] })
  public game2Questions: Game2Question[] = [];

  @property({ type: [ScrollView] })
  public scrollViews: ScrollView[] = [];

  @property({ type: SpriteFrame })
  public optionNormalSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public optionCorrectSpriteFrame: SpriteFrame | null = null;

  @property({ type: SpriteFrame })
  public optionWrongSpriteFrame: SpriteFrame | null = null;

  private options: Game2Option[] = [];
  private game2QuizTransition: Game2QuizTransition | null = null;
  private firstQuestion: boolean = false;

  private question: PhishingEmail | null = null;
  private currentQuestionIndex: number = 0;
  private questions: PhishingEmail[] = [];
  private loadedQuestion: boolean = false;
  private currentScore: number = 0;
  private enableTutorial: boolean = false;
  private questionsLoadedCount: number = 0;

  onLoad() {
    this.game2QuizTransition = this.node.getComponent(Game2QuizTransition);

    /*this.questions = [
      {
        question: this.game2Questions[0],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Curiosity-piquing Subject" },
          { id: 4, text: "Suspicious Email Address" },
          { id: 5, text: "External Email Warning" },
          { id: 6, text: "Triggered strong emotion" },
          { id: 7, text: "Generic Greeting" },
          { id: 8, text: "Unusual Request" },
          { id: 9, text: "Sense of Urgency" },
          { id: 10, text: "Unexpected Email" },
          { id: 11, text: "Suspicious Link" },
        ],
      },
      {
        question: this.game2Questions[1],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Curiosity-piquing Subject" },
          { id: 4, text: "Suspicious Email Address" },
          { id: 5, text: "External Email Warning" },
          { id: 6, text: "Pretend to be Amway" },
          { id: 7, text: "Generic Greeting" },
          { id: 8, text: "Unusual Request" },
          { id: 9, text: "Sense of Urgency" },
          { id: 10, text: "Unexpected Email" },
          { id: 11, text: "Suspicious Link" },
        ],
      },
      {
        question: this.game2Questions[2],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Curiosity-piquing Subject" },
          { id: 4, text: "Suspicious Email Address" },
          { id: 5, text: "External Email Warning" },
          { id: 6, text: "Pretend to be Amway" },
          { id: 7, text: "Generic Greeting" },
          { id: 8, text: "Unusual Request" },
          { id: 9, text: "Sense of Urgency" },
          { id: 10, text: "Unexpected Email" },
          { id: 11, text: "Suspicious Link" },
          { id: 12, text: "Trigger Fear Emotion" },
        ],
      },
      {
        question: this.game2Questions[3],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Suspicious Email Address" },
          { id: 4, text: "External Email Warning" },
          { id: 5, text: "Pretend to be Amway" },
          { id: 6, text: "Generic Greeting" },
          { id: 7, text: "Unusual Request" },
          { id: 8, text: "Sense of Urgency" },
          { id: 9, text: "Unexpected Email" },
          { id: 10, text: "Suspicious Link" },
          { id: 11, text: "Trigger Nervous Emotion" },
        ],
      },
      {
        question: this.game2Questions[4],
        options: [
          { id: 1, text: "Too Good To Be True" },
          { id: 2, text: "Suspicious Attachment" },
          { id: 3, text: "Suspicious Email Address" },
          { id: 4, text: "External Email Warning" },
          { id: 5, text: "Asking for sensitive information" },
          { id: 6, text: "Generic Greeting" },
          { id: 7, text: "Unusual Request" },
          { id: 8, text: "Sense of Urgency" },
          { id: 9, text: "Unexpected Email" },
          { id: 10, text: "Suspicious Link" },
          { id: 11, text: "Trigger strong emotion" },
        ],
      },
    ];*/
  }

  protected setPageState() {
    this.pageState = PageStates.Game2;
  }

  public onEnter() {
    super.onEnter();
    this.pageManager.targetGamePageState = this.pageState;
    this.tutorial.node.active = false;
    this.currentScore = 0;
    this.enableTutorial = false;
    this.game2Bee.node.active = false;
    this.showGame(false);
    this.firstQuestion = true;
    this.currentQuestionIndex = 0;
    this.questionsLoadedCount = 0;
    this.setUI();
    GameManager.instance.timer.resetTimer();
    UIManager.instance.showGameUI(true);
    this.getQuestion();
  }

  public onPostEnterTransition() {
    super.onPostEnterTransition();
    UIManager.instance.showScoreStartUI(
      this.pageState,
      async (tutorial: boolean = false) => {
        if (!this.loadedQuestion || !this.allQuestionLoaded()) {
          UIManager.instance.showLoading(true);
          await waitForCondition(this.loadedQuestion);
          await waitForCondition(this.allQuestionLoaded());
        }
        UIManager.instance.showLoading(false);
        this.game2Bee.setText("Q1", true);
        this.enableTutorial = tutorial;
        this.setQuestion();
        if (!tutorial) {
          GameManager.instance.timer.startTimer();
        }
      },
    );
  }

  public onExit() {
    super.onExit();
    UIManager.instance.showGameUI(false);
  }

  private async getQuestion() {
    this.loadedQuestion = false;
    await GameManager.instance.quizService.getPhishingEmail();
    this.createQuestion();
    UIManager.instance.showLoading(false);
    this.loadedQuestion = true;
  }

  private setUI() {
    const userState: UserState = DataManager.instance.userState;
    //UIManager.instance.gameUI.updateScore(this.currentScore);
    UIManager.instance.gameUI.updateTotalScore(this.currentScore);
  }

  private async endQuiz() {
    GameManager.instance.timer.stopTimer();
    const userState: UserState = DataManager.instance.userState;
    await GameManager.instance.quizService.submitPhishingScore(
      this.currentScore,
      GameManager.instance.timer.getElapsedTime(),
      this.currentScore,
      userState.phishing.times_played_phishing++,
    );
    this.transitionPage(PageStates.Result);
  }

  private createQuestion() {
    this.questions = DataManager.instance.phishingEmails;

    for (const game2Question of this.game2Questions) {
      game2Question.node.destroy();
    }
    this.game2Questions = [];
    for (let i = 0; i < this.questions.length; i++) {
      const questionNode = instantiate(this.questionPrefab) as Node;
      this.questionLayout.node.addChild(questionNode);
      const game2Question = questionNode.getComponent(Game2Question);
      game2Question.init(this.questions[i], this);
      this.game2Questions.push(game2Question);
    }
  }

  private setQuestion() {
    this.question = this.questions[this.currentQuestionIndex];
    this.currentScore = Math.max(0, this.currentScore);
    this.setUI();
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endQuiz();
      return;
    }
    const question = this.game2Questions[this.currentQuestionIndex];
    this.showGame(true);

    for (const option of this.options) {
      if (option.node && option.node.isValid) {
        option.node.destroy();
      }
    }
    this.options = [];
    this.optionLayout.enabled = true;

    for (let i = 0; i < this.questions.length; i++) {
      this.game2Questions[i].node.active = i === this.currentQuestionIndex;
    }
    const optionLabels = this.question.indicators.map((x) => {
      return x.label;
    });
    const shuffledOptions = shuffleArray(optionLabels);
    for (let i = 0; i < shuffledOptions.length; i++) {
      const optionNode = instantiate(this.optionPrefab) as Node;
      this.optionLayout.node.addChild(optionNode);
      const game2Option = optionNode.getComponent(Game2Option);
      game2Option.init(shuffledOptions[i], question.slots, this);
      this.options.push(game2Option);
    }
    for (const scrollView of this.scrollViews) {
      scrollView.scrollToTop(0.01);
    }

    this.scheduleOnce(() => {
      this.optionLayout.enabled = false;
      for (const game2Option of this.options) {
        game2Option.setInitialPosition();
      }
    }, 0.1);

    this.setBlockInput(true);
    this.game2QuizTransition.playTransition(
      true,
      this.optionNodes(),
      "Q" + (this.currentQuestionIndex + 1).toString(),
      this.firstQuestion,
      () => {
        this.setBlockInput(false);
        this.showTutorial();
        this.firstQuestion = false;
      },
    );
  }

  public onDropOption(correct: boolean) {
    const feedbackText = correct
      ? ""
      : LocalizationManager.instance.getLocalizedString("game_1.think_twice");
    UIManager.instance.playFeedbackUI(correct, feedbackText, () => {});

    const correctScore = 100;
    const wrongScore = -25;
    this.currentScore += correct ? correctScore : wrongScore;
  }

  private onClickSafe() {
    this.currentQuestionIndex++;
    this.setBlockInput(true);
    this.game2QuizTransition.playTransition(
      false,
      this.optionNodes(),
      "",
      false,
      () => {
        this.setBlockInput(false);
        this.setQuestion();
      },
    );
  }

  private showGame(show: boolean) {
    this.questionLayout.node.active = show;
    this.optionLayout.node.active = show;
  }

  private showTutorial() {
    if (this.firstQuestion && this.enableTutorial) {
      this.tutorial.show(() => {
        GameManager.instance.timer.startTimer();
      });
    }
  }

  public optionNodes(): Node[] {
    const nodes: Node[] = [];
    for (const option of this.options) {
      nodes.push(option.node);
    }
    return nodes;
  }

  public onGame2QuestionLoaded() {
    this.questionsLoadedCount++;
  }

  private allQuestionLoaded(): boolean {
    return this.questionsLoadedCount >= this.questions.length;
  }
}
