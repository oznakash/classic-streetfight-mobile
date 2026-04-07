class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = scene.physics.add.group();
        this.hitEffects = [];
    }

    checkHit(attacker, defender) {
        const move = attacker.currentMove;
        if (!move || !attacker.hitboxActive || attacker.hasHitThisAttack) return false;

        const hb = move.hitbox;
        if (!hb) return false;

        const S = 2.5; // sprite scale
        const dir = attacker.facingRight ? 1 : -1;
        const hitRect = new Phaser.Geom.Rectangle(
            attacker.sprite.x + hb.x * dir * S - (dir === -1 ? hb.w * S : 0),
            attacker.sprite.y + hb.y * S,
            hb.w * S,
            hb.h * S
        );

        const defenderBounds = new Phaser.Geom.Rectangle(
            defender.sprite.x - 30,
            defender.sprite.y - 55,
            60,
            110
        );

        if (Phaser.Geom.Rectangle.Overlaps(hitRect, defenderBounds)) {
            this.applyHit(attacker, defender, move);
            return true;
        }
        return false;
    }

    applyHit(attacker, defender, move) {
        attacker.hasHitThisAttack = true;

        const isBlocking = defender.state === 'BLOCK' || defender.holdingBack;
        const damageMultiplier = isBlocking ? 0.15 : 1;
        const knockbackMultiplier = isBlocking ? 0.3 : 1;

        const damage = Math.round(move.damage * damageMultiplier);
        defender.takeDamage(damage);

        const dir = attacker.facingRight ? 1 : -1;
        const kb = move.knockback * knockbackMultiplier;
        defender.sprite.body.setVelocityX(dir * kb);
        if (!isBlocking) {
            defender.sprite.body.setVelocityY(-80);
        }

        if (!isBlocking) {
            defender.enterHitstun(move.hitstun);
        }

        this.spawnHitEffect(
            defender.sprite.x - dir * 10,
            defender.sprite.y - 10,
            isBlocking
        );

        // Sound + screen shake
        const sfx = this.scene.sfx;
        if (sfx) {
            if (isBlocking) sfx.playBlock();
            else sfx.playHit();
        }
        if (!isBlocking) {
            this.scene.cameras.main.shake(80, 0.005);
        }
    }

    fireProjectile(fighter, move) {
        const dir = fighter.facingRight ? 1 : -1;
        const x = fighter.sprite.x + 60 * dir;
        const y = fighter.sprite.y - 10;

        // Glow behind projectile
        const glow = this.scene.add.circle(x, y, move.projectileSize * 3, move.projectileColor, 0.35);
        glow.setDepth(4);

        // Use sprite if available, fallback to rectangle
        let proj;
        if (move.projectileSprite) {
            proj = this.scene.add.image(x, y, move.projectileSprite);
            proj.setScale(2.5);
            proj.setFlipX(dir === -1);
        } else {
            proj = this.scene.add.rectangle(x, y, move.projectileSize * 2, move.projectileSize * 2, move.projectileColor);
        }
        proj.setDepth(5);
        proj.glow = glow;
        this.scene.physics.add.existing(proj);
        proj.body.setAllowGravity(false);
        proj.body.setVelocityX(move.projectileSpeed * dir);

        if (move.arc) {
            proj.body.setVelocityY(-200);
            proj.body.setAllowGravity(true);
        }
        if (move.bounce) {
            proj.body.setBounce(1, 0.8);
            proj.body.setVelocityY(100);
            proj.body.setAllowGravity(true);
            proj.bounceCount = 0;
            proj.maxBounces = 3;
        }

        proj.owner = fighter;
        proj.moveData = move;
        proj.lifetime = 0;
        this.projectiles.add(proj);

        return proj;
    }

    update(delta, fighters) {
        const [f1, f2] = fighters;

        // Check melee hits
        if (f1.hitboxActive) this.checkHit(f1, f2);
        if (f2.hitboxActive) this.checkHit(f2, f1);

        // Update projectiles
        this.projectiles.getChildren().forEach(proj => {
            proj.lifetime += delta;

            // Sync glow position + rotate projectile
            if (proj.glow) {
                proj.glow.setPosition(proj.x, proj.y);
                proj.glow.setScale(1 + Math.sin(proj.lifetime * 0.01) * 0.2);
            }
            if (proj.moveData.bounce || proj.moveData.arc) {
                proj.angle += delta * 0.3;
            }

            // Remove if off screen or too old
            if (proj.x < -50 || proj.x > 850 || proj.y > 500 || proj.lifetime > 3000) {
                if (proj.glow) proj.glow.destroy();
                proj.destroy();
                return;
            }

            // Bounce handling
            if (proj.moveData.bounce && proj.body) {
                if (proj.body.blocked.down) {
                    proj.bounceCount++;
                    if (proj.bounceCount >= proj.maxBounces) {
                        if (proj.glow) proj.glow.destroy();
                        proj.destroy();
                        return;
                    }
                }
            }

            // Check collision with fighters
            fighters.forEach(fighter => {
                if (fighter === proj.owner) return;
                if (!proj.body) return;

                const projBounds = new Phaser.Geom.Rectangle(
                    proj.x - proj.width / 2, proj.y - proj.height / 2,
                    proj.width, proj.height
                );
                const fighterBounds = new Phaser.Geom.Rectangle(
                    fighter.sprite.x - 30, fighter.sprite.y - 55,
                    60, 110
                );

                if (Phaser.Geom.Rectangle.Overlaps(projBounds, fighterBounds)) {
                    const isBlocking = fighter.state === 'BLOCK';
                    const dmgMult = isBlocking ? 0.15 : 1;
                    const kbMult = isBlocking ? 0.3 : 1;

                    fighter.takeDamage(Math.round(proj.moveData.damage * dmgMult));

                    const dir = proj.body.velocity.x > 0 ? 1 : -1;
                    fighter.sprite.body.setVelocityX(dir * proj.moveData.knockback * kbMult);
                    if (!isBlocking) {
                        fighter.sprite.body.setVelocityY(-60);
                        fighter.enterHitstun(proj.moveData.hitstun);
                    }

                    this.spawnHitEffect(fighter.sprite.x, fighter.sprite.y - 10, isBlocking);
                    const sfx = this.scene.sfx;
                    if (sfx) {
                        if (isBlocking) sfx.playBlock();
                        else sfx.playHit();
                    }
                    if (!isBlocking) {
                        this.scene.cameras.main.shake(80, 0.005);
                    }
                    if (proj.glow) proj.glow.destroy();
                    proj.destroy();
                }
            });
        });

        // Update hit effects
        this.hitEffects = this.hitEffects.filter(e => {
            e.life -= delta;
            if (e.life <= 0) {
                e.graphic.destroy();
                return false;
            }
            e.graphic.setAlpha(e.life / 300);
            e.graphic.setScale(1 + (1 - e.life / 300) * 0.5);
            return true;
        });
    }

    spawnHitEffect(x, y, isBlock) {
        const color = isBlock ? 0x4488ff : 0xffffff;
        const size = isBlock ? 12 : 20;
        const g = this.scene.add.star(x, y, isBlock ? 4 : 5, size / 2, size, color);
        g.setDepth(10);
        this.hitEffects.push({ graphic: g, life: 300 });
    }

    clearProjectiles() {
        this.projectiles.getChildren().forEach(p => {
            if (p.glow) p.glow.destroy();
        });
        this.projectiles.clear(true, true);
    }

    destroy() {
        this.clearProjectiles();
        this.hitEffects.forEach(e => e.graphic.destroy());
        this.hitEffects = [];
    }
}
