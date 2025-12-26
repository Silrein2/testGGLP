export enum PageStates {
  None,
  Login,
  DialogueIntro,
  GameSelection,
  DialogueGame1,
  Game1,
  Game2,
  Game3,
  Result,
  ExternalGame3,
}

export enum ButtonStates {
  Normal,
  Selected,
  Correct,
  Wrong,
}

export enum QuestionTypes {
  NONE = null,
  MCQ = "MCQ",
  MATCH = "MATCH",
  YES_NO = "YES_NO",
}
