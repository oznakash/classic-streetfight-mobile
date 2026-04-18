class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
    }

    init(data) {
        this.p1Char = data.p1 || 'doomguy';
        this.p2Char = data.p2 || 'mario';
    }

    create() {
        // Stage background
        this.add.image(400, 225, 'stage_bg').setDepth(0);

        // Ground (invisible, just physics)
        const ground = this.add.rectangle(400, 430, 800, 40);
        ground.setAlpha(0);
        this.physics.add.existing(ground, true);

        // Invisible walls
        const wallLeft = this.add.rectangle(-5, 225, 10, 450);
        this.physics.add.existing(wallLeft, true);
        const wallRight = this.add.rectangle(805, 225, 10, 450);
        this.physics.add.existing(wallRight, true);

        // KO flash overlay
        this.koFlash = this.add.rectangle(400, 225, 800, 450, 0xffffff, 0).setDepth(40);

        // Systems
        this.inputManager = new InputManager(this);
        this.combatSystem = new CombatSystem(this);
        this.isMobile = !!window.IS_MOBILE;

        // Fighters
        this.fighter1 = new Fighter(this, 200, 350, this.p1Char, 0);
        this.fighter2 = new Fighter(this, 600, 350, this.p2Char, 1);

        // On mobile: CPU controls P2
        this.ai = this.isMobile ? new AIController(this.fighter2, this.fighter1) : null;
        this.fighter1.sprite.setDepth(2);
        this.fighter2.sprite.setDepth(2);

        // Collisions
        this.physics.add.collider(this.fighter1.sprite, ground);
        this.physics.add.collider(this.fighter2.sprite, ground);
        this.physics.add.collider(this.fighter1.sprite, wallLeft);
        this.physics.add.collider(this.fighter1.sprite, wallRight);
        this.physics.add.collider(this.fighter2.sprite, wallLeft);
        this.physics.add.collider(this.fighter2.sprite, wallRight);

        // Projectile collisions with ground
        this.physics.add.collider(this.combatSystem.projectiles, ground);

        // HUD
        this.hud = new HUD(this);
        this.hud.setCharacters(this.p1Char, this.p2Char);

        // Round state
        this.roundNum = 1;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.roundTimer = 99;
        this.roundActive = false;
        this.roundOver = false;

        // Sound effects (Web Audio)
        this.sfx = this.createSFX();

        // Show touch overlay during fights (mobile only)
        if (window.showTouchControls) window.showTouchControls(true);
        this.events.once('shutdown', () => {
            if (window.showTouchControls) window.showTouchControls(false);
        });

        // Start first round
        this.startRound();
    }

    createSFX() {
        const ctx = this.sound.context;
        if (!ctx) return null;

        return {
            playHit: () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
            },
            playBlock: () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.05);
            },
            playKO: () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            },
            playSpecial: () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
                osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            },
            playRoundStart: () => {
                [0, 0.1, 0.2].forEach((delay, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'square';
                    osc.frequency.setValueAtTime([330, 440, 660][i], ctx.currentTime + delay);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
                    osc.start(ctx.currentTime + delay);
                    osc.stop(ctx.currentTime + delay + 0.15);
                });
            }
        };
    }

    startRound() {
        this.roundActive = false;
        this.roundOver = false;
        this.roundTimer = 99;

        this.fighter1.reset(200);
        this.fighter2.reset(600);
        this.combatSystem.clearProjectiles();

        this.hud.updateRound(this.roundNum);
        this.hud.updateRoundWins(this.p1Wins, this.p2Wins);
        this.hud.updateHealth(this.fighter1.health, this.fighter1.maxHealth, this.fighter2.health, this.fighter2.maxHealth);

        this.hud.showAnnouncement(`ROUND ${this.roundNum}`, 1000, () => {
            this.hud.showAnnouncement('FIGHT!', 600, () => {
                this.roundActive = true;
                if (this.sfx) this.sfx.playRoundStart();
            });
        });
    }

    update(time, delta) {
        if (!this.roundActive) {
            this.fighter1.updateVisuals();
            this.fighter2.updateVisuals();
            return;
        }

        if (this.roundOver) return;

        // Timer
        this.roundTimer -= delta / 1000;
        this.hud.updateTimer(this.roundTimer);

        // Get input (CPU drives P2 on mobile)
        const p1Input = this.inputManager.getInput('p1');
        const p2Input = this.ai ? this.ai.getInput(delta) : this.inputManager.getInput('p2');

        // Update fighters
        this.fighter1.update(delta, p1Input, this.fighter2);
        this.fighter2.update(delta, p2Input, this.fighter1);

        // Combat
        this.combatSystem.update(delta, [this.fighter1, this.fighter2]);

        // Update HUD
        this.hud.updateHealth(this.fighter1.health, this.fighter1.maxHealth, this.fighter2.health, this.fighter2.maxHealth);

        // Check round end
        if (this.fighter1.health <= 0 || this.fighter2.health <= 0 || this.roundTimer <= 0) {
            this.endRound();
        }
    }

    endRound() {
        this.roundOver = true;
        this.roundActive = false;

        let winner;
        if (this.fighter1.health <= 0) {
            winner = 2;
            this.fighter1.enterKO();
            this.fighter2.enterVictory();
        } else if (this.fighter2.health <= 0) {
            winner = 1;
            this.fighter2.enterKO();
            this.fighter1.enterVictory();
        } else {
            if (this.fighter1.health >= this.fighter2.health) {
                winner = 1;
                this.fighter2.enterKO();
                this.fighter1.enterVictory();
            } else {
                winner = 2;
                this.fighter1.enterKO();
                this.fighter2.enterVictory();
            }
        }

        if (winner === 1) this.p1Wins++;
        else this.p2Wins++;

        this.hud.updateRoundWins(this.p1Wins, this.p2Wins);

        // Dramatic slow-mo: freeze physics briefly, then resume
        this.physics.world.timeScale = 4; // 4x slower
        this.time.timeScale = 0.3;

        // KO flash + sound after a dramatic pause
        this.time.delayedCall(200, () => {
            if (this.sfx) this.sfx.playKO();
            this.koFlash.setAlpha(0.8);
            this.tweens.add({
                targets: this.koFlash,
                alpha: 0,
                duration: 600,
                ease: 'Power2'
            });
            this.cameras.main.shake(400, 0.02);
        });

        // Resume normal speed after slow-mo
        this.time.delayedCall(600, () => {
            this.physics.world.timeScale = 1;
            this.time.timeScale = 1;
        });

        // Show KO text after the dramatic pause
        this.time.delayedCall(800, () => {
            this.hud.showAnnouncement('K.O.!', 1500, () => {
                if (this.p1Wins >= 2 || this.p2Wins >= 2) {
                    const winnerChar = this.p1Wins >= 2 ? this.p1Char : this.p2Char;
                    const winnerPlayer = this.p1Wins >= 2 ? 1 : 2;
                    this.time.delayedCall(500, () => {
                        this.cleanup();
                        this.scene.start('VictoryScene', {
                            winner: winnerPlayer,
                            character: winnerChar,
                            p1Char: this.p1Char,
                            p2Char: this.p2Char
                        });
                    });
                } else {
                    this.roundNum++;
                    this.time.delayedCall(500, () => {
                        this.startRound();
                    });
                }
            });
        });
    }

    cleanup() {
        this.physics.world.timeScale = 1;
        this.time.timeScale = 1;
        this.fighter1.destroy();
        this.fighter2.destroy();
        this.combatSystem.destroy();
        this.inputManager.destroy();
        this.hud.destroy();
    }
}
