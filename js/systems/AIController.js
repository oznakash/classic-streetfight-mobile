class AIController {
    constructor(fighter, opponent, difficulty) {
        this.me = fighter;
        this.opp = opponent;
        this.difficulty = difficulty || 'normal';
        this.thinkTimer = 0;
        this.moveDir = 0;
        this.pendingJump = false;
        this.pendingPunch = false;
        this.pendingKick = false;
        this.pendingSpecial = false;
        this.holdDown = false;
        this.blockHold = false;
        this.blockUntil = 0;
    }

    think() {
        this.moveDir = 0;
        this.pendingJump = false;
        this.pendingPunch = false;
        this.pendingKick = false;
        this.pendingSpecial = false;
        this.holdDown = false;

        const myX = this.me.sprite.x;
        const oppX = this.opp.sprite.x;
        const dx = oppX - myX;
        const dist = Math.abs(dx);
        const dir = dx < 0 ? -1 : 1;

        if (this.me.state === 'KO' || this.me.state === 'HIT' ||
            this.opp.state === 'KO' || this.opp.state === 'VICTORY') {
            return;
        }

        const oppAttacking = ['PUNCH', 'KICK', 'SPECIAL1', 'SPECIAL2'].includes(this.opp.state);
        if (oppAttacking && dist < 120 && Math.random() < 0.45) {
            this.blockUntil = 320;
            return;
        }

        const r = Math.random();
        if (dist < 85) {
            if (r < 0.5) this.pendingPunch = true;
            else if (r < 0.82) this.pendingKick = true;
            else {
                this.pendingSpecial = true;
                if (Math.random() < 0.35) this.holdDown = true;
            }
        } else if (dist < 220) {
            if (r < 0.12) {
                this.pendingSpecial = true;
            } else if (r < 0.22) {
                this.pendingJump = true;
                this.moveDir = dir;
            } else {
                this.moveDir = dir;
            }
        } else {
            if (r < 0.2) this.pendingSpecial = true;
            else this.moveDir = dir;
        }
    }

    getInput(delta) {
        this.thinkTimer -= delta;
        this.blockUntil -= delta;

        if (this.blockUntil > 0) {
            this.blockHold = true;
        } else {
            this.blockHold = false;
            if (this.thinkTimer <= 0) {
                this.thinkTimer = 280 + Math.random() * 380;
                this.think();
            }
        }

        const input = {
            left: this.moveDir === -1 && !this.blockHold,
            right: this.moveDir === 1 && !this.blockHold,
            up: false,
            down: this.holdDown || this.blockHold,
            punch: false,
            kick: false,
            special: false,
            holdLeft: this.moveDir === -1,
            holdRight: this.moveDir === 1,
            block: this.blockHold
        };

        if (this.pendingJump)    { input.up = true;      this.pendingJump = false; }
        if (this.pendingPunch)   { input.punch = true;   this.pendingPunch = false; }
        if (this.pendingKick)    { input.kick = true;    this.pendingKick = false; }
        if (this.pendingSpecial) { input.special = true; this.pendingSpecial = false; }

        return input;
    }
}
