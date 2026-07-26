// =============================================================================
//  InvincibleGame.js — Main scene: wires together all modules
//
//  Load order in index.html (scripts must appear in this order):
//    Preload.js  →  HUD.js  →  Eve.js  →  EnemyAI.js  →  InvincibleGame.js
// =============================================================================

class InvincibleGame extends Phaser.Scene {

    constructor() {
        super('InvincibleGame');

        //Scoreboard
        this.totalScore = 0;

        // Combo
        this.comboStage   = 0;
        this.lastHitTime  = 0;
        this.comboTimeout = 500;

        // Stats
        this.maxHP = 100;
        this.currentHP = 100;

        this.maxEnergy = 100;
        this.currentEnergy = 100;

        this.damageReduction = 3;

        // State flags
        this.isHeavyAttacking = false;
        this.isRecovering     = false;
        this.isHealing     = false;
        this.isShielding     = false;
        this.isDodging        = false;
        this.isGameOver       = false;

        //Skills Unlocked
        this.hasShield = false;
        this.isShieldActive = false;
        this.hasHealing    = false;

        // Double-tap sprint
        this.lastLeftPressTime  = 0;
        this.lastRightPressTime = 0;
        this.doubleTapTimeout   = 250;

        this.isSprinting     = false;
        this.sprintDirection = '';
    }

    // -------------------------------------------------------------------------
    preload() {
        scenePreload(this); // Preload.js
    }

    // -------------------------------------------------------------------------
    create() {
        this.physics.world.setBounds(-300, 330, 2500, 730); // ← world bounds for Eve and enemies

        // ── Background (do not change) ────────────────────────────────────────
        this.background = this.add.image(960, 540, 'subwayBG');
        this.blinkLight = this.add.image(960, 540, 'blinkLight');
        this.cloud      = this.add.tileSprite(960, 540, 1920, 1080, 'cloudMoving');

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => { this.blinkLight.setVisible(!this.blinkLight.visible); }
        });

        // ── Music ─────────────────────────────────────────────────────────────
        this.musicVolume = 0.5; // change starting volume here (0.0 – 1.0)
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: this.musicVolume });
        this.bgMusic.play();

        // ── Sound Effects ─────────────────────────────────────────────────────────────
        this.sdAbility = this.sound.add('sdAbility', { volume: 0.3 });
        this.sdRocket = this.sound.add('sdRocket', { volume: 0.3 });
        this.sdExplosion = this.sound.add('sdExplosion', { volume: 0.3 });
        this.sdExplosion02 = this.sound.add('sdExplosion02', { volume: 0.3 });
        this.sdEnemyDie = this.sound.add('sdEnemyDie', { volume: 0.3 });
        this.sdFail = this.sound.add('sdFail', { volume: 0.3 });
        this.sdBoxBreak = this.sound.add('sdBoxBreak', { volume: 0.3 });
        this.sdSound = this.sound.add('sdSound', { volume: 0.3 });

        // ── Animations ────────────────────────────────────────────────────────
        createEveAnims(this);    // Eve.js
        createEnemyAnims(this);  // EnemyAI.js

        // ── Eve ───────────────────────────────────────────────────────────────
        createEve(this);         // Eve.js

        // ── Keyboard bindings ─────────────────────────────────────────────────
        this.keys = this.input.keyboard.addKeys({
            up:      Phaser.Input.Keyboard.KeyCodes.W,
            down:    Phaser.Input.Keyboard.KeyCodes.S,
            left:    Phaser.Input.Keyboard.KeyCodes.A,
            right:   Phaser.Input.Keyboard.KeyCodes.D,
            hit:     Phaser.Input.Keyboard.KeyCodes.H,
            heavy:   Phaser.Input.Keyboard.KeyCodes.U,
            shield:   Phaser.Input.Keyboard.KeyCodes.Y,
            healing:   Phaser.Input.Keyboard.KeyCodes.I,
            dodge:   Phaser.Input.Keyboard.KeyCodes.K,
            volUp:   Phaser.Input.Keyboard.KeyCodes.PLUS,
            volDown: Phaser.Input.Keyboard.KeyCodes.MINUS,
            mute:    Phaser.Input.Keyboard.KeyCodes.M
        });

        // ── Physics groups ────────────────────────────────────────────────────
        this.projectiles = this.physics.add.group({ allowGravity: false });
        this.enemyGroup  = this.physics.add.group({ allowGravity: false });

        // ── Initial enemies ───────────────────────────────────────────────────
        spawnThug(this, 100,  800);  // EnemyAI.js
        spawnThug(this, 1800, 720);

        // ── Wave spawn timer ──────────────────────────────────────────────────
        this.time.addEvent({
            delay: 6000,        // ← spawn cooldown in ms (6000 = 6 seconds)
            loop: true,
            callback: () => { spawnWave(this); },  // EnemyAI.js
            callbackScope: this
        });

        // ── HUD ───────────────────────────────────────────────────────────────
        createHUD(this);         // HUD.js

        // ── Restart key ───────────────────────────────────────────────────────
        this.input.keyboard.on('keydown-R', () => {
            if (this.isGameOver) {
                this.bgMusic.stop();
                this.scene.restart();
            }
        });
    }

    // -------------------------------------------------------------------------
    update(time, delta) {
        // Cloud scroll (do not change)
        this.cloud.tilePositionX += 0.5;

        if (this.isGameOver) { return; }

        // Volume controls
        if (Phaser.Input.Keyboard.JustDown(this.keys.volUp)) {
            eveSetVolume(this, Math.min(1.0, this.musicVolume + 0.1));  // Eve.js
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.volDown)) {
            eveSetVolume(this, Math.max(0.0, this.musicVolume - 0.1));
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.mute)) {
            eveToggleMute(this);  // Eve.js
        }

        updateHUD(this);               // HUD.js
        updateEnemies(this, time);     // EnemyAI.js
        cleanProjectiles(this);        // EnemyAI.js

        if (this.isRecovering) { return; }

        updateEve(this, time);         // Eve.js
    }
}
