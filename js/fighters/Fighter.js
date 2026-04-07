class Fighter {
    constructor(scene, x, y, characterKey, playerIndex) {
        this.scene = scene;
        this.characterKey = characterKey;
        this.charData = CHARACTERS[characterKey];
        this.playerIndex = playerIndex;
        this.facingRight = playerIndex === 0;

        this.health = this.charData.health;
        this.maxHealth = this.charData.health;

        // State machine
        this.state = 'IDLE';
        this.stateTimer = 0;
        this.frameCounter = 0;
        this.currentMove = null;
        this.hitboxActive = false;
        this.hasHitThisAttack = false;
        this.hitstunTimer = 0;
        this.hasActiveProjectile = false;
        this.holdingBack = false;
        this.currentAnim = '';

        // Create animated sprite (scaled 2.5x for the stage)
        this.sprite = scene.add.sprite(x, y, characterKey, 0);
        this.sprite.setScale(2.5);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setSize(24, 44);
        this.sprite.body.setOffset(20, 18);
        this.sprite.body.setMaxVelocity(400, 600);

        // Attack indicator (debug, mostly invisible)
        this.attackIndicator = scene.add.rectangle(0, 0, 0, 0, 0xff0000, 0);
        this.attackIndicator.setDepth(5);

        // State label for special move names
        this.stateLabel = scene.add.text(0, -38, '', {
            fontSize: '8px', fontFamily: 'monospace', color: '#fff'
        }).setOrigin(0.5);

        this.playAnim('idle');
    }

    playAnim(name) {
        const key = `${this.characterKey}_${name}`;
        if (this.currentAnim === key) return;
        this.currentAnim = key;
        this.sprite.play(key, true);
    }

    update(delta, input, opponent) {
        this.stateTimer += delta;
        const body = this.sprite.body;

        // Auto-face opponent
        if (opponent && this.state !== 'HIT' && this.state !== 'KO') {
            this.facingRight = this.sprite.x < opponent.sprite.x;
        }

        // Determine if blocking (holding away from opponent)
        const holdingBack = this.facingRight ? input.holdLeft : input.holdRight;

        // Hitstun countdown
        if (this.hitstunTimer > 0) {
            this.hitstunTimer -= delta / 16.67;
            if (this.hitstunTimer <= 0) {
                this.hitstunTimer = 0;
                if (this.state === 'HIT') {
                    this.setState('IDLE');
                }
            }
        }

        switch (this.state) {
            case 'IDLE':
            case 'WALK':
                body.setVelocityX(0);

                // Block only when holding back + down
                if (holdingBack && input.down && body.blocked.down) {
                    this.setState('BLOCK');
                    break;
                }

                // Track if holding back for passive blocking (checked on hit)
                this.holdingBack = holdingBack;

                if (input.left) {
                    body.setVelocityX(-this.charData.speed);
                    if (this.state !== 'WALK') this.setState('WALK');
                } else if (input.right) {
                    body.setVelocityX(this.charData.speed);
                    if (this.state !== 'WALK') this.setState('WALK');
                } else {
                    if (this.state !== 'IDLE') this.setState('IDLE');
                }

                if (input.up && body.blocked.down) {
                    body.setVelocityY(this.charData.jumpForce);
                    this.setState('JUMP');
                    break;
                }

                if (input.special) {
                    this.startAttack(input.down ? 'special2' : 'special1');
                } else if (input.punch) {
                    this.startAttack('punch');
                } else if (input.kick) {
                    this.startAttack('kick');
                }
                break;

            case 'JUMP':
                if (input.left) body.setVelocityX(-this.charData.speed * 0.7);
                else if (input.right) body.setVelocityX(this.charData.speed * 0.7);

                if (body.blocked.down) {
                    this.setState('IDLE');
                }

                if (input.punch) this.startAttack('punch');
                else if (input.kick) this.startAttack('kick');
                else if (input.special) {
                    this.startAttack(input.down ? 'special2' : 'special1');
                }
                break;

            case 'BLOCK':
                body.setVelocityX(0);
                if (!holdingBack) {
                    this.setState('IDLE');
                }
                break;

            case 'PUNCH':
            case 'KICK':
            case 'SPECIAL1':
            case 'SPECIAL2':
                this.updateAttack(delta);
                break;

            case 'HIT':
                break;

            case 'KO':
                break;

            case 'VICTORY':
                body.setVelocityX(0);
                break;
        }

        this.updateVisuals();
    }

    startAttack(type) {
        const move = this.charData.moves[type];
        if (!move) return;

        if (move.isProjectile && this.hasActiveProjectile) return;

        const stateMap = { punch: 'PUNCH', kick: 'KICK', special1: 'SPECIAL1', special2: 'SPECIAL2' };
        this.setState(stateMap[type]);
        this.currentMove = move;
        this.frameCounter = 0;
        this.hitboxActive = false;
        this.hasHitThisAttack = false;

        if (move.isDive) {
            const dir = this.facingRight ? 1 : -1;
            this.sprite.body.setVelocityX(move.diveVelocityX * dir);
            this.sprite.body.setVelocityY(move.diveVelocityY);
        }

        // Play special sound
        if ((type === 'special1' || type === 'special2') && this.scene.sfx) {
            this.scene.sfx.playSpecial();
        }
    }

    updateAttack(delta) {
        if (!this.currentMove) {
            this.setState('IDLE');
            return;
        }

        this.frameCounter += delta / 16.67;
        const move = this.currentMove;
        const totalFrames = move.startup + move.active + move.recovery;

        if (this.frameCounter < move.startup) {
            this.hitboxActive = false;
        } else if (this.frameCounter < move.startup + move.active) {
            this.hitboxActive = true;

            if (move.isProjectile && !this.hasHitThisAttack) {
                this.hasHitThisAttack = true;
                const proj = this.scene.combatSystem.fireProjectile(this, move);
                this.hasActiveProjectile = true;
                const fighter = this;
                proj.on('destroy', () => { fighter.hasActiveProjectile = false; });
            }
        } else if (this.frameCounter < totalFrames) {
            this.hitboxActive = false;
        } else {
            this.hitboxActive = false;
            this.currentMove = null;
            this.setState(this.sprite.body.blocked.down ? 'IDLE' : 'JUMP');
        }
    }

    setState(newState) {
        if (this.state === 'KO') return;
        const prev = this.state;
        this.state = newState;
        this.stateTimer = 0;

        // Play corresponding animation
        const animMap = {
            'IDLE': 'idle', 'WALK': 'walk', 'JUMP': 'jump',
            'PUNCH': 'punch', 'KICK': 'kick',
            'SPECIAL1': 'special1', 'SPECIAL2': 'special2',
            'BLOCK': 'block', 'HIT': 'hit', 'KO': 'ko', 'VICTORY': 'victory'
        };
        const anim = animMap[newState];
        if (anim) {
            this.currentAnim = '';  // Force replay
            this.playAnim(anim);
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        // Flash white using tint
        this.sprite.setTintFill(0xffffff);
        this.scene.time.delayedCall(80, () => {
            if (this.sprite && this.sprite.active) {
                this.sprite.clearTint();
            }
        });
    }

    enterHitstun(frames) {
        this.setState('HIT');
        this.hitstunTimer = frames;
        this.hitboxActive = false;
        this.currentMove = null;
    }

    enterKO() {
        this.setState('KO');
        this.sprite.body.setVelocityX(this.facingRight ? -100 : 100);
        this.sprite.body.setVelocityY(-200);
        this.hitboxActive = false;
        this.currentMove = null;
    }

    enterVictory() {
        this.setState('VICTORY');
        this.sprite.body.setVelocityX(0);
    }

    reset(x) {
        this.health = this.maxHealth;
        this.state = 'IDLE';
        this.stateTimer = 0;
        this.hitstunTimer = 0;
        this.frameCounter = 0;
        this.currentMove = null;
        this.hitboxActive = false;
        this.hasHitThisAttack = false;
        this.hasActiveProjectile = false;
        this.facingRight = this.playerIndex === 0;
        this.sprite.setPosition(x, 350);
        this.sprite.body.setVelocity(0, 0);
        this.sprite.clearTint();
        this.sprite.setAngle(0);
        this.sprite.setFlipX(!this.facingRight);
        this.currentAnim = '';
        this.playAnim('idle');
    }

    updateVisuals() {
        // Flip based on facing direction
        this.sprite.setFlipX(!this.facingRight);

        // Attack hitbox indicator (scaled)
        if (this.hitboxActive && this.currentMove && this.currentMove.hitbox) {
            const hb = this.currentMove.hitbox;
            const S = 2.5;
            const dir = this.facingRight ? 1 : -1;
            this.attackIndicator.setPosition(
                this.sprite.x + hb.x * dir * S,
                this.sprite.y + hb.y * S
            );
            this.attackIndicator.setSize(hb.w * S, hb.h * S);
            this.attackIndicator.setFillStyle(0xff0000, 0.3);
        } else {
            this.attackIndicator.setSize(0, 0);
            this.attackIndicator.setFillStyle(0xff0000, 0);
        }

        // State label for specials
        this.stateLabel.setPosition(this.sprite.x, this.sprite.y - 80);
        if (this.state === 'SPECIAL1' || this.state === 'SPECIAL2') {
            const moveType = this.state === 'SPECIAL1' ? 'special1' : 'special2';
            this.stateLabel.setText(this.charData.moves[moveType].name || this.state);
        } else {
            this.stateLabel.setText('');
        }
    }

    destroy() {
        this.sprite.destroy();
        this.attackIndicator.destroy();
        this.stateLabel.destroy();
    }
}
