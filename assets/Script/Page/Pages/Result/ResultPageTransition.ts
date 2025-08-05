import {
  _decorator,
  Component,
  easing,
  gfx,
  Label,
  Node,
  ParticleSystem2D,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
import { PageTransition } from "../../PageTransition";
import { delay } from "../../../Utils/Utils";
import { ResultScore } from "./ResultScore";
const { ccclass, property } = _decorator;

@ccclass("ResultPageTransition")
export class ResultPageTransition extends PageTransition {
  @property({ type: Node })
  private panel: Node | null = null;

  @property({ type: Node })
  private title: Node | null = null;

  @property({ type: [Node] })
  private bottomNodes: Node[] = [];

  @property({ type: Node })
  private scoreNode: Node | null = null;

  @property({ type: Label })
  private scoreLabel: Label | null = null;

  @property({ type: [ResultScore] })
  private resultScores: ResultScore[] = [];

  @property({
    type: [ParticleSystem2D],
  })
  private particleSystems: ParticleSystem2D[] = [];

  private bottomInitialPos: Vec3[] = [];
  private bottomFromPos: Vec3[] = [];

  private panelInitialPos: Vec3 = new Vec3();
  private panelFromPos: Vec3 = new Vec3(0, 1260, 0);

  onLoad() {
    this.enterTransitionEnabled = true;
    this.exitTransitionEnabled = true;

    this.recordPos(
      this.bottomNodes,
      this.bottomInitialPos,
      this.bottomFromPos,
      "y",
      -820,
    );

    this.panelInitialPos.set(this.panel.position.clone());
  }

  start() {
    for (const particleSystem of this.particleSystems) {
      const material = particleSystem
        .getComponent(ParticleSystem2D)
        .getMaterialInstance(0);
      if (material) {
        const pass = material.passes[0];

        if (
          pass &&
          pass.blendState &&
          pass.blendState.targets &&
          pass.blendState.targets.length > 0
        ) {
          pass.blendState.targets[0].blendSrc = gfx.BlendFactor.SRC_ALPHA;
          pass.blendState.targets[0].blendDst =
            gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
        }
      }
    }
  }

  public onEnter() {
    this.initParticleSystem();
    this.panel.active = false;
    this.panel.position = this.panelInitialPos;
    this.panel.setScale(new Vec3(0.1, 0.1, 0.1));
    this.title.active = false;
    this.title.setScale(Vec3.ZERO);
    this.setNodesPosition(this.bottomNodes, this.bottomFromPos);

    const titleUIOpacity = this.title.getComponent(UIOpacity);
    titleUIOpacity.opacity = 0;

    for (const resultScore of this.resultScores) {
      resultScore.node.active = false;
      resultScore.node.setScale(Vec3.ZERO);
      const resultScoreUIOpacity = resultScore.getComponent(UIOpacity);
      resultScoreUIOpacity.opacity = 0;
    }

    this.scheduleOnce(async () => {
      this.panel.active = true;
      tween(this.panel)
        .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" })
        .call(() => {
          this.title.active = true;
        })
        .parallel(
          tween(this.title).to(
            0.4,
            { scale: new Vec3(1, 1, 1) },
            { easing: "backOut" },
          ),
          tween(titleUIOpacity).to(
            0.4,
            { opacity: 255 },
            { easing: "cubicOut" },
          ),
        )
        .call(() => {
          this.tweenScore();
        })
        .start();

      this.onEnterComplete();
    }, this.stateEnterTransitionDuration * 0.5);
  }

  public async onExit() {
    const backIn = (s: number) => {
      return (k: number) => k * k * ((s + 1) * k - s);
    };

    tween(this.panel)
      .to(0.8, { position: this.panelFromPos }, { easing: backIn(0.9) })
      .start();
    await delay(100);
    this.tweenList(this.bottomNodes, this.bottomFromPos, 100, "backIn");
    await delay(800);
    this.onExitComplete();
  }

  private tweenScore() {
    for (let i = 0; i < this.resultScores.length; i++) {
      const resultScore = this.resultScores[i];
      const resultScoreUIOpacity = resultScore.getComponent(UIOpacity);

      const scoreTweenData = { scoreValue: 0 };
      const _tween = tween(resultScore.node)
        .delay(0.65 * i)
        .call(() => {
          resultScore.node.active = true;
        })
        .parallel(
          tween(resultScore.node).to(
            0.3,
            { scale: Vec3.ONE },
            { easing: "backOut" },
          ),
          tween(resultScoreUIOpacity).to(
            0.3,
            { opacity: 255 },
            { easing: "cubicOut" },
          ),
          tween(scoreTweenData)
            .to(
              0.5,
              { scoreValue: resultScore.score },
              {
                onUpdate: () => {
                  resultScore.setCounter(Math.round(scoreTweenData.scoreValue));
                },
                easing: "quadIn",
              },
            )
            .then(
              tween(resultScore.scoreLabel.node)
                .to(
                  0.1,
                  { scale: new Vec3(1.5, 1.5, 1.5) },
                  { easing: "backOut" },
                )
                .to(0.2, { scale: Vec3.ONE }, { easing: "backIn" }),
            ),
        );

      if (i === this.resultScores.length - 1) {
        _tween.delay(0.1).call(() => {
          this.startParticleSystem(true);
          tween(this.title)
            .to(
              0.15,
              { scale: new Vec3(1.5, 1.5, 1.5) },
              { easing: "cubicOut" },
            )
            .to(0.2, { scale: Vec3.ONE }, { easing: "cubicIn" })
            .start();
          for (let i = 0; i < this.resultScores.length; i++) {
            const resultScore = this.resultScores[i];
            tween(resultScore.scoreLabel.node)
              .to(
                0.15,
                { scale: new Vec3(1.5, 1.5, 1.5) },
                { easing: "cubicOut" },
              )
              .to(0.2, { scale: Vec3.ONE }, { easing: "cubicIn" })
              .start();
          }
          this.tweenList(
            this.bottomNodes,
            this.bottomInitialPos,
            100,
            "backOut",
          );
        });
      }
      _tween.start();
    }
  }

  private startParticleSystem(start: boolean) {
    for (const particleSystem of this.particleSystems) {
      if (start) {
        particleSystem.resetSystem();
      } else {
        particleSystem.stopSystem();
      }
    }
  }

  private initParticleSystem() {
    this.startParticleSystem(false);
    for (const particleSystem of this.particleSystems) {
      const material = particleSystem
        .getComponent(ParticleSystem2D)
        .getMaterialInstance(0);
      if (material) {
        const pass = material.passes[0];

        if (
          pass &&
          pass.blendState &&
          pass.blendState.targets &&
          pass.blendState.targets.length > 0
        ) {
          pass.blendState.targets[0].blendSrc = gfx.BlendFactor.SRC_ALPHA;
          pass.blendState.targets[0].blendDst =
            gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
        }
      }
    }
  }
}
