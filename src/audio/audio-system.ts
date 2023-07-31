export class AudioSystem {
  private ctx: AudioContext;
  private master: GainNode;
  private music: GainNode;
  private fx: GainNode;
  private muted = false;

  public get musicDestination(): GainNode {
    return this.music;
  }

  public get fxDestination(): GainNode {
    return this.fx;
  }

  public constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain();
    this.music.connect(this.master);
    this.fx = this.ctx.createGain();
    this.fx.connect(this.master);
  }

  public mute(): void {
    if (this.muted) return;
    this.master.disconnect();
    this.muted = true;
    this.ctx.suspend();
  }

  public unmute(): void {
    if (!this.muted) return;
    this.master.connect(this.ctx.destination);
    this.muted = false;
    this.ctx.resume();
  }

  public toggleMute(): void {
    this.muted ? this.unmute() : this.mute();
  }
}
