import { _decorator, Vec3, Node, CCFloat } from "cc";
import { Page } from "../../Page";
import { ButtonStates, PageStates } from "../../Enums";
import { Game1Type1Option } from "./Game1Type1Option";
import { Game1Type2Option } from "./Game1Type2Option";
import { Game1Type2Slot } from "./Game1Type2Slot";

const { ccclass, property } = _decorator;

@ccclass("Game1Page")
export class Game1Page extends Page {
  @property({ type: [Game1Type1Option] })
  type1Options: Game1Type1Option[] = [];

  @property({ type: [Game1Type2Option] })
  type2Options: Game1Type2Option[] = [];

  @property({ type: [Game1Type2Slot] })
  type2Slots: Game1Type2Slot[] = [];

  @property({ type: [Game1Type2Option] })
  type3Options: Game1Type2Option[] = [];

  @property({ type: [Game1Type2Slot] })
  type3Slots: Game1Type2Slot[] = [];

  private type2Answers: any[] = [];

  start() {
    this.setQuestion();
  }

  protected setPageState() {
    this.pageState = PageStates.Game1;
  }

  private setQuestion() {
    const data = [
      { id: 1, text: "Answer1" },
      { id: 2, text: "Answer2" },
      { id: 3, text: "Answer3" },
      { id: 4, text: "Answer4" },
      { id: 5, text: "Answer5" },
      { id: 6, text: "Answer6" },
    ];

    const data2 = [
      { id: 1, text: "Slot1" },
      { id: 2, text: "Slot2" },
      { id: 3, text: "Slot3" },
      { id: 4, text: "Slot4" },
    ];

    /*this.type1Options.forEach(
      (type1Answer: Game1Type1Option, index: number) => {
        type1Answer.init(data[index]);
      },
    );*/

    /*this.type2Options.forEach(
      (type2Answer: Game1Type2Option, index: number) => {
        type2Answer.init(data[index], this.type2Slots);
      },
    );

    this.type2Slots.forEach((type2Slots: Game1Type2Slot, index: number) => {
      type2Slots.init(data2[index]);
    });*/

    this.type3Options.forEach(
      (type3Answer: Game1Type2Option, index: number) => {
        type3Answer.init(data[index], this.type3Slots);
      },
    );

    this.type3Slots.forEach((type3Slots: Game1Type2Slot, index: number) => {
      type3Slots.init(data2[index]);
    });
  }

  onClickType1Button(data: any) {
    const type1Answer: Game1Type1Option = this.type1Options.find(
      (x) => x.data.id === data.id,
    );
    type1Answer.setState(ButtonStates.Correct);
  }

  onDropType2Option(
    optionData: any,
    slotData: any,
    type2Option: Game1Type2Option,
  ) {
    let answerObj = this.type2Answers.find((x) => x.slotId == slotData?.id);
    if (answerObj == null && slotData != null) {
      answerObj = this.type2Answers.find((x) => x.optionId == optionData.id);
      if (answerObj == null) {
        const obj = {
          optionId: optionData.id,
          slotId: slotData.id,
        };

        this.type2Answers.push(obj);
      } else {
        answerObj.slotId = slotData?.id;
      }
    } else {
      type2Option.resetPosition();
      this.type2Answers = this.type2Answers.filter(
        (x) => x.optionId !== optionData.id,
      );
    }
  }
}
