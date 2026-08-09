// =============================================================================
//  HUD.js — All HUD elements and update logic
//  Call createHUD(scene) from create(), updateHUD(scene) from update()
// =============================================================================

function createHUD(scene) {

    // ── Total score from killig enemies ─────────────────────────────────────────────────────
        scene.hudPanel = scene.add.rectangle(750, 180, 450, 60, 0x000000, 0.6) //Score Box
        .setOrigin(0, 0).setScrollFactor(0).setDepth(20);

    scene.hudScore = scene.add.text(900, 195, 'Total Score: 0', {
        fontFamily: 'Pixelated', fontSize: '32px', color: '#ffffff'
    }).setScrollFactor(0).setDepth(23);

    // ── HP Bar (top-left) ─────────────────────────────────────────────────────
    // Panel is wider to fit the shield icon on the left.
    scene.hudPanel = scene.add.rectangle(250, 115.5, 450, 60, 0x000000, 0.6)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(20);

    scene.hudPanel = scene.add.rectangle(717, 115.5, 450, 60, 0x000000, 0.6)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(20);
    // ──────────────────────────────────────────────────────────────────────────────────
    // Logo next to the HP bar — shows whichever character is currently selected.
    const isMark = scene.selectedCharacter === 'mark';
    const binding = (action) => keyNameFromCode(scene.gameSettings.keybinds[action]);
    scene.eveHP = scene.add.image(255, 145, isMark ? 'markHPLogo' : 'eveHPLogo')
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(24)
        .setScale(0.8);

    // ──────────────────────────────────────────────────────────────────────────────────

    // HP bar shifted right to sit beside the icon
    scene.hudBarBG = scene.add.rectangle(315, 125, 280, 18, 0x550000)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(21);

    scene.hudBar = scene.add.rectangle(315, 125, 280, 18, 0xff44cc)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(22);

    // HP text shifted right inside the HP
    scene.hudText = scene.add.text(325, 125,
        (isMark ? 'MARK' : 'EVE') + '  HP: ' + scene.currentHP + ' / ' + scene.maxHP, {
        fontFamily: 'Pixelated', fontSize: '18px', color: '#ffffff'
    }).setScrollFactor(0).setDepth(23);
    // ──────────────────────────────────────────────────────────────────────────────────

    ///Energy Bar for Eve shifted below the HP Bar.
    scene.energyBarBG = scene.add.rectangle(315, 150, 280, 18, 0x00345C)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(21);

    scene.energyBar = scene.add.rectangle(315, 150, 280, 18, 0x008AFF)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(22);

    // Energy text shifted right inside the EnergyBar
    scene.energyText = scene.add.text(325, 150, 'Energy: 100 / 100', {
        fontFamily: 'Pixelated', fontSize: '18px', color: '#ffffff'
    }).setScrollFactor(0).setDepth(23);
    // ──────────────────────────────────────────────────────────────────────────────────

    // ── Volume Bar (top-right) ────────────────────────────────────────────────
    scene.volPanel = scene.add.rectangle(1650, 120, 260, 60, 0x000000, 0.6)
        .setOrigin(1, 0).setScrollFactor(0).setDepth(20);

    scene.volBarBG = scene.add.rectangle(1400, 145, 220, 14, 0x333333)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(21);

    scene.volBar = scene.add.rectangle(1400, 145, 220 * scene.musicVolume, 14, 0xffdd00)
        .setOrigin(0, 0).setScrollFactor(0).setDepth(22);

    scene.volText = scene.add.text(1400, 124,
        `VOL: ${binding('volUp')} / ${binding('volDown')} | ${binding('mute')}: mute`, {
        fontFamily: 'Pixelated', fontSize: '15px', color: '#ffffff'
    }).setScrollFactor(0).setDepth(23);
    // ──────────────────────────────────────────────────────────────────────────────────

    // ── Game Over Overlay (hidden until Eve dies) ─────────────────────────────
    scene.gameOverOverlay = scene.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.75)
        .setScrollFactor(0).setDepth(50).setVisible(false);

    scene.gameOverTitle = scene.add.text(960, 420, 'GAME OVER', {
        fontFamily: 'Pixelated',
        fontSize: '160px',
        color: '#ff1111',
        stroke: '#000000',
        strokeThickness: 12,
        align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setVisible(false);

    //Game Over Subtext — changes depending on which character is selected.
    scene.gameOverSubEve = scene.add.text(960, 590, 'Atom Eve has fallen.', {
        fontFamily: 'Pixelated', fontSize: '36px', color: '#ffaaaa', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setVisible(false);

    scene.gameOverSubMark = scene.add.text(960, 590, 'Invincible has fallen.', {
        fontFamily: 'Pixelated', fontSize: '36px', color: '#fbff00', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setVisible(false);

    // Total Score text on the Game Over screen
    scene.totalScoreEnd = scene.add.text(960, 630, 'Total Score: ' + scene.totalScore, {
        fontFamily: 'Pixelated', fontSize: '36px', color: '#ffaaaa', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setVisible(false);

    scene.gameOverHint = scene.add.text(960, 675, 'Press R or click the button', {
        fontFamily: 'Pixelated', fontSize: '28px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setVisible(false);

    scene.restartButton = scene.add.text(960, 760, '[ RESTART ]', {
        fontFamily: 'Pixelated', fontSize: '44px', color: '#ffffff',
        backgroundColor: '#991111', padding: { x: 34, y: 16 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setVisible(false)
      .setInteractive({ useHandCursor: true });
    scene.restartButton.on('pointerover', () => scene.restartButton.setStyle({ color: '#ffdd00' }));
    scene.restartButton.on('pointerout', () => scene.restartButton.setStyle({ color: '#ffffff' }));
    scene.restartButton.on('pointerdown', () => restartCurrentGame(scene));

    // ── Pause Overlay (hidden until P is pressed) ─────────────────────────────
    createPauseOverlay(scene);
}
    // ──────────────────────────────────────────────────────────────────────────────────

function createPauseOverlay(scene) {
    // This helper must live in this function because the move lists below are
    // constructed here, outside createHUD's local scope.
    const binding = (action) => keyNameFromCode(scene.gameSettings.keybinds[action]);

    scene.pauseOverlay = scene.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.82)
        .setScrollFactor(0).setDepth(60).setVisible(false);

    scene.pauseTitle = scene.add.text(960, 150, 'PAUSED', {
        fontFamily: 'Pixelated',
        fontSize: '110px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 10,
        align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setVisible(false);

    scene.pauseHint = scene.add.text(960, 990, `Press ${binding('pause')} to resume`, {
        fontFamily: 'Pixelated', fontSize: '30px', color: '#ffdd00', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setVisible(false);

    const isMark = scene.selectedCharacter === 'mark';

    scene.pauseEveTitle = scene.add.text(280, 260, 'ATOM EVE', {
        fontFamily: 'Pixelated', fontSize: '38px',
        color: isMark ? '#ff49ff' : '#ff49ff'
    }).setScrollFactor(0).setDepth(61).setVisible(false);

    const eveMoves =
        `${binding('up')}/${binding('left')}/${binding('down')}/${binding('right')}          Move\n` +
        `${binding('hit')}             Light Combo (3 hits)\n` +
        `${binding('heavy')}             Heavy Attack (fires a projectile)\n` +
        `2x-tap ${binding('left')}/${binding('right')}    Sprint Dodge\n` +
        `${binding('dodge')} + ${binding('up')}/${binding('down')}       Lane Dodge\n` +
        `${binding('shield')}             Shield  (unlocks at 100 score)\n` +
        `${binding('healing')}             Healing (unlocks at 200 score)\n` +
        `${binding('volUp')} / ${binding('volDown')}         Volume   ${binding('mute')}  Mute`;

    scene.pauseEveText = scene.add.text(280, 320, eveMoves, {
        fontFamily: 'Pixelated', fontSize: '22px', color: '#ffffff',
        align: 'left', lineSpacing: 14
    }).setScrollFactor(0).setDepth(61).setVisible(false);

    scene.pauseMarkTitle = scene.add.text(1280, 260, 'INVINCIBLE', {
        fontFamily: 'Pixelated', fontSize: '38px',
        color: isMark ? '#ffd900' : '#ffd900'
    }).setScrollFactor(0).setDepth(61).setVisible(false);

    const markMoves =
        `${binding('up')}/${binding('left')}/${binding('down')}/${binding('right')}          Move\n` +
        `${binding('hit')}             Light Combo (3 hits — must\n` +
        '              connect to continue the combo)\n' +
        `${binding('heavy')}             Heavy Attack (knockback,\n` +
        '              plays out fully, no canceling)\n' +
        `${binding('shield')} + ${binding('left')}/${binding('right')} held  Dash Attack (charges forward, unlocks at 100 score)\n` +
        `${binding('dodge')} (hold)      Block, release to stop\n` +
        `${binding('healing')}             Rage Mode — 10s, +5 damage dealt,\n` +
        '              -3 extra damage taken (unlocks at 200 score)\n' +
        `${binding('volUp')} / ${binding('volDown')}         Volume   ${binding('mute')}  Mute`;

    scene.pauseMarkText = scene.add.text(1280, 320, markMoves, {
        fontFamily: 'Pixelated', fontSize: '22px', color: '#ffffff',
        align: 'left', lineSpacing: 14
    }).setScrollFactor(0).setDepth(61).setVisible(false);
}

// Show/hide the pause overlay and its two move lists together
function showPauseOverlay(scene) {
    [scene.pauseOverlay, scene.pauseTitle, scene.pauseHint,
     scene.pauseEveTitle, scene.pauseEveText,
     scene.pauseMarkTitle, scene.pauseMarkText].forEach((el) => el.setVisible(true));
}

function hidePauseOverlay(scene) {
    [scene.pauseOverlay, scene.pauseTitle, scene.pauseHint,
     scene.pauseEveTitle, scene.pauseEveText,
     scene.pauseMarkTitle, scene.pauseMarkText].forEach((el) => el.setVisible(false));
}

// Called every frame from update()
function updateHUD(scene) {
    const pct = Phaser.Math.Clamp(scene.currentHP / scene.maxHP, 0, 1); //Calculates the current value to shrink the Bar.
    scene.hudBar.setSize(280 * pct, 18);

    const energy = Phaser.Math.Clamp(scene.currentEnergy / scene.maxEnergy, 0, 1); //Calculates the current value to shrink the Bar.
    scene.energyBar.setSize(280 * energy, 18);

    let scoreEnd = scene.totalScore; //Calculates the current value to shrink the Bar.
    scene.totalScoreEnd.setText('Total Score: ' + scene.totalScore); //Updates total Score.

    // Colour shifts pink → orange → red as HP drops
    if (pct > 0.6)      { scene.hudBar.setFillStyle(0xff44cc); }
    else if (pct > 0.3) { scene.hudBar.setFillStyle(0xff9900); }
    else                { scene.hudBar.setFillStyle(0xff2200); }

    const nameLabel = scene.selectedCharacter === 'mark' ? 'MARK' : 'EVE';
    scene.hudText.setText(nameLabel + '  HP: ' + scene.currentHP + ' / ' + scene.maxHP); //Updates current HP.

    scene.energyText.setText('Energy: ' + scene.currentEnergy + ' / ' + scene.maxEnergy); //Updates Eve's current Energy.

    scene.hudScore.setText('Total Score: ' + scene.totalScore); //Updates total Score.

    if (scene.currentHP > scene.maxHP) {
        scene.currentHP = scene.maxHP;
    }

    if (scene.totalScore == 100) {

    scene.hasShield = true;

        if (scene.selectedCharacter === 'mark') {
            scene.shieldIcon = scene.add.image(620, 140, 'dashLogo')
                .setOrigin(0, 0.5)
                .setScrollFactor(0)
                .setDepth(24)
                .setScale(0.5);
        } else {
            scene.shieldIcon = scene.add.image(620, 140, 'shieldLogo')
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setDepth(24)
            .setScale(0.5);
        }
    }

    if (scene.totalScore == 200) {

    scene.hasHealing = true;

        if (scene.selectedCharacter === 'mark') {
            scene.shieldIcon = scene.add.image(660, 140, 'rageLogo')
                .setOrigin(0, 0.5)
                .setScrollFactor(0)
                .setDepth(24)
                .setScale(0.5);
        } else {
            scene.shieldIcon = scene.add.image(660, 140, 'healingLogo')
                .setOrigin(0, 0.5)
                .setScrollFactor(0)
                .setDepth(24)
                .setScale(0.5);
        }
    }
}

// Called when volume changes
function updateVolHUD(scene) {
    const pct = Phaser.Math.Clamp(scene.musicVolume, 0, 1);
    scene.volBar.setSize(220 * pct, 14);
    scene.volBar.setFillStyle(pct === 0 ? 0x555555 : 0xffdd00);
}

// Show the game over screen and pulse the title
function showGameOver(scene) {
    scene.gameOverOverlay.setVisible(true);
    scene.gameOverTitle.setVisible(true);
    scene.totalScoreEnd.setVisible(true);
    scene.gameOverHint.setVisible(true);
    scene.restartButton.setVisible(true);

    if (scene.selectedCharacter === 'mark') {
        scene.gameOverSubMark.setVisible(true);
    } else {
        scene.gameOverSubEve.setVisible(true);
    }

    scene.tweens.add({
        targets: scene.gameOverTitle,
        scaleX: 1.05, scaleY: 1.05,
        yoyo: true, repeat: -1, duration: 600,
        ease: 'Sine.easeInOut'
    });
}
