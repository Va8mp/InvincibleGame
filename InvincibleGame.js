// =============================================================================
//  InvincibleGame.js — Main scene: wires together all modules
//
//  Load order in index.html (scripts must appear in this order):
//    Preload.js  →  HUD.js  →  Eve.js  →  EnemyAI.js  →  InvincibleGame.js
// =============================================================================

class InvincibleGame extends Phaser.Scene {

    constructor() {
        super('InvincibleGame');

        //Scoreboard and the current Character
        this.totalScore = 0;
        this.currentCharacter = "";

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
        this.isPaused         = false;
        this.isBlocking       = false;   // Mark — holding K
        this.isDashAttacking  = false;   // Mark — dash attack in progress
        this.isRaging         = false;   // Mark — Rage mode active
        this.markComboLocked  = false;   // Mark — 500ms gap enforced between combo hits

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
        // Which character was picked on the CharacterSelect screen ('eve' | 'mark').
        // Falls back to Eve if the scene was ever started without going through select.
        this.selectedCharacter = this.registry.get('selectedCharacter') || 'eve';

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
        if (this.selectedCharacter === 'mark') {
            createMarkAnims(this); // Mark.js
        } else {
            createEveAnims(this);  // Eve.js
        }
        createEnemyAnims(this);  // EnemyAI.js

        // ── Player character ─────────────────────────────────────────────────
        if (this.selectedCharacter === 'mark') {
            createMark(this);     // Mark.js
        } else {
            createEve(this);      // Eve.js
        }

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
            pause:   Phaser.Input.Keyboard.KeyCodes.P,
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

        // P → toggle pause (not available once the game is over)
        if (!this.isGameOver && Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
            this.togglePause();
        }

        if (this.isGameOver || this.isPaused) { return; }

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

        if (this.selectedCharacter === 'mark') {
            updateMark(this, time);    // Mark.js
        } else {
            updateEve(this, time);     // Eve.js
        }
    }

    // -------------------------------------------------------------------------
    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.time.paused = true;
            this.tweens.pauseAll();
            if (this.bgMusic) { this.bgMusic.pause(); }
            showPauseOverlay(this);   // HUD.js
        } else {
            this.physics.resume();
            this.time.paused = false;
            this.tweens.resumeAll();
            if (this.bgMusic) { this.bgMusic.resume(); }
            hidePauseOverlay(this);   // HUD.js
        }
    }
}

// ── Shared game-over handling — called by eveTakeDamage() and markTakeDamage() ──
function triggerGameOver(scene) {
    scene.isGameOver = true;
    scene.character.setVelocity(0);
    scene.character.setTint(0xff0000);
    scene.enemyGroup.getChildren().forEach((e) => { if (e.active) { e.setVelocity(0); } });
    scene.sdFail.play();

    // Fade music out
    scene.tweens.add({
        targets: scene.bgMusic,
        volume: 0,
        duration: 2000,
        onComplete: () => { scene.bgMusic.stop(); }
    });

    showGameOver(scene); // defined in HUD.js
}
