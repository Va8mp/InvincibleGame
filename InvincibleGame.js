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
    create() {
        // Resolve the selected character before resetting stats so each fighter
        // starts with the correct maximum HP on both first launch and restart.
        this.selectedCharacter = this.registry.get('selectedCharacter') || 'eve';

        // scene.restart() reuses this scene instance, so reset every per-run value.
        this.resetRunState();

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
        this.gameSettings = loadGameSettings();
        applyGlobalAudioSettings(this, this.gameSettings);
        this.musicVolume = this.gameSettings.musicVolume;
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: this.musicVolume });
        this.bgMusic.play();

        // ── Sound Effects ─────────────────────────────────────────────────────────────
        const sfxVolume = this.gameSettings.sfxVolume;
        this.sdAbility = this.sound.add('sdAbility', { volume: sfxVolume });
        this.sdRocket = this.sound.add('sdRocket', { volume: sfxVolume });
        this.sdExplosion = this.sound.add('sdExplosion', { volume: sfxVolume });
        this.sdExplosion02 = this.sound.add('sdExplosion02', { volume: sfxVolume });
        this.sdEnemyDie = this.sound.add('sdEnemyDie', { volume: sfxVolume });
        this.sdFail = this.sound.add('sdFail', { volume: sfxVolume });
        this.sdBoxBreak = this.sound.add('sdBoxBreak', { volume: sfxVolume });
        this.sdSound = this.sound.add('sdSound', { volume: sfxVolume });

        // Sound objects use Phaser's game-wide sound manager, so release this
        // run's instances during scene shutdown after restart has been queued.
        const runSounds = [
            this.bgMusic, this.sdAbility, this.sdRocket, this.sdExplosion,
            this.sdExplosion02, this.sdEnemyDie, this.sdFail,
            this.sdBoxBreak, this.sdSound
        ];
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            runSounds.forEach((sound) => {
                if (sound && sound.destroy) sound.destroy();
            });
        });

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
        this.keys = this.input.keyboard.addKeys(this.gameSettings.keybinds);

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

        // Polling a scene-owned key avoids accumulating global keyboard
        // listeners each time this scene restarts.
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    resetRunState() {
        this.totalScore = 0;
        this.maxHP = this.selectedCharacter === 'mark' ? 120 : 100;
        this.currentHP = this.maxHP;
        this.currentEnergy = this.maxEnergy;
        this.comboStage = 0;
        this.lastHitTime = 0;
        this.isHeavyAttacking = false;
        this.isRecovering = false;
        this.isHealing = false;
        this.isShielding = false;
        this.isDodging = false;
        this.isGameOver = false;
        this.isRestarting = false;
        this.isPaused = false;
        this.isBlocking = false;
        this.isDashAttacking = false;
        this.isRaging = false;
        this.markComboLocked = false;
        this.hasShield = false;
        this.isShieldActive = false;
        this.hasHealing = false;
        this.lastLeftPressTime = 0;
        this.lastRightPressTime = 0;
        this.isSprinting = false;
        this.sprintDirection = '';
        this.nextLordBugScore = 10;
        this.nextEnergyRestoreScore = 500;
        this.nextWaveNoticeScore = 250;
        this.nextSupplyDropScore = 250;
        this.lordBugBoss = null;
        this.nextWaveText = null;
        this.enemyGroup = null;
        this.enemyProjectiles = null;
        this.projectiles = null;
        this.itemPickups = null;
    }

    // -------------------------------------------------------------------------
    update(time, delta) {
        // Cloud scroll (do not change)
        this.cloud.tilePositionX += 0.5;

        if (this.isGameOver && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            restartCurrentGame(this);
            return;
        }

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

function restartCurrentGame(scene) {
    if (!scene.isGameOver || scene.isRestarting) return;
    scene.isRestarting = true;
    scene.isGameOver = true;

    // Prevent two pointer/key events from scheduling overlapping restarts.
    if (scene.restartButton) scene.restartButton.disableInteractive();

    // Stop old-run activity. Phaser's scene shutdown owns the destruction of
    // timers, sounds, display objects, and physics bodies; destroying those
    // manually during a pointer callback could leave a half-shut-down scene.
    scene.tweens.killAll();
    scene.time.paused = false;
    scene.physics.resume();
    scene.sound.stopAll();

    // Leave the current input dispatch before restarting. This makes mouse and
    // keyboard restarts follow the same safe path and prevents the freeze.
    window.setTimeout(() => {
        if (scene.scene) scene.scene.restart();
    }, 0);
}
