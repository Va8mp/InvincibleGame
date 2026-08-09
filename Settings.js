// =============================================================================
//  Settings.js — persistent audio settings and remappable keyboard controls
// =============================================================================

const GAME_SETTINGS_KEY = 'invincibleGameSettingsV1';

const DEFAULT_GAME_SETTINGS = {
    musicVolume: 0.5,
    sfxVolume: 0.3,
    muted: false,
    keybinds: {
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        hit: Phaser.Input.Keyboard.KeyCodes.H,
        heavy: Phaser.Input.Keyboard.KeyCodes.U,
        shield: Phaser.Input.Keyboard.KeyCodes.Y,
        healing: Phaser.Input.Keyboard.KeyCodes.I,
        dodge: Phaser.Input.Keyboard.KeyCodes.K,
        pause: Phaser.Input.Keyboard.KeyCodes.P,
        volUp: Phaser.Input.Keyboard.KeyCodes.PLUS,
        volDown: Phaser.Input.Keyboard.KeyCodes.MINUS,
        mute: Phaser.Input.Keyboard.KeyCodes.M
    }
};

const GAME_BINDING_LABELS = {
    up: 'Move Up', down: 'Move Down', left: 'Move Left', right: 'Move Right',
    hit: 'Light Attack', heavy: 'Heavy Attack', shield: 'Shield / Dash',
    healing: 'Heal / Rage', dodge: 'Dodge / Block', pause: 'Pause',
    volUp: 'Volume Up', volDown: 'Volume Down', mute: 'Mute'
};

function cloneDefaultSettings() {
    return {
        musicVolume: DEFAULT_GAME_SETTINGS.musicVolume,
        sfxVolume: DEFAULT_GAME_SETTINGS.sfxVolume,
        muted: DEFAULT_GAME_SETTINGS.muted,
        keybinds: { ...DEFAULT_GAME_SETTINGS.keybinds }
    };
}

function loadGameSettings() {
    const defaults = cloneDefaultSettings();
    try {
        const saved = JSON.parse(localStorage.getItem(GAME_SETTINGS_KEY) || '{}');
        return {
            musicVolume: Phaser.Math.Clamp(Number(saved.musicVolume ?? defaults.musicVolume), 0, 1),
            sfxVolume: Phaser.Math.Clamp(Number(saved.sfxVolume ?? defaults.sfxVolume), 0, 1),
            muted: Boolean(saved.muted),
            keybinds: { ...defaults.keybinds, ...(saved.keybinds || {}) }
        };
    } catch (error) {
        return defaults;
    }
}

function saveGameSettings(settings) {
    try {
        localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        // The game still works when browser storage is unavailable.
    }
}

function keyNameFromCode(keyCode) {
    const names = Object.keys(Phaser.Input.Keyboard.KeyCodes);
    return names.find((name) => Phaser.Input.Keyboard.KeyCodes[name] === keyCode) || String(keyCode);
}

function applyGlobalAudioSettings(scene, settings) {
    scene.sound.mute = settings.muted;
}

class OptionsMenu extends Phaser.Scene {
    constructor() {
        super('OptionsMenu');
        this.activeTab = 'audio';
        this.tabContent = [];
        this.waitingForBinding = null;
    }

    create() {
        this.settings = loadGameSettings();
        applyGlobalAudioSettings(this, this.settings);

        const bg = this.add.image(960, 540, 'menuSKY').setScale(4).setTint(0x333333);
        bg.setDepth(0);
        this.add.rectangle(960, 540, 1320, 820, 0x080808, 0.9).setDepth(1);

        this.add.text(960, 155, 'OPTIONS', {
            fontFamily: 'Pixelated', fontSize: '82px', color: '#ffdd00',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(2);

        this.audioTab = this.makeButton(710, 255, '[ AUDIO ]', () => this.showTab('audio'), 34);
        this.controlsTab = this.makeButton(1210, 255, '[ CONTROLS ]', () => this.showTab('controls'), 34);
        this.makeButton(960, 945, '[ BACK ]', () => this.scene.start('MainMenu'), 34);

        this.showTab('audio');
    }

    makeButton(x, y, label, callback, fontSize = 28) {
        const button = this.add.text(x, y, label, {
            fontFamily: 'Pixelated', fontSize: `${fontSize}px`, color: '#ffffff',
            backgroundColor: '#171717', padding: { x: 18, y: 10 }
        }).setOrigin(0.5).setDepth(3).setInteractive({ useHandCursor: true });
        button.on('pointerover', () => button.setStyle({ color: '#ffdd00' }));
        button.on('pointerout', () => button.setStyle({ color: '#ffffff' }));
        button.on('pointerdown', callback);
        return button;
    }

    clearTab() {
        this.tabContent.forEach((item) => item.destroy());
        this.tabContent = [];
        this.waitingForBinding = null;
        this.input.keyboard.removeAllListeners('keydown');
    }

    addTabItem(item) {
        this.tabContent.push(item);
        return item;
    }

    showTab(tab) {
        this.clearTab();
        this.activeTab = tab;
        this.audioTab.setStyle({ color: tab === 'audio' ? '#ffdd00' : '#ffffff' });
        this.controlsTab.setStyle({ color: tab === 'controls' ? '#ffdd00' : '#ffffff' });
        if (tab === 'audio') this.showAudioTab();
        else this.showControlsTab();
    }

    showAudioTab() {
        this.createVolumeRow(420, 'MUSIC', 'musicVolume');
        this.createVolumeRow(570, 'SOUND EFFECTS', 'sfxVolume');

        const muteText = this.addTabItem(this.add.text(960, 725, '', {
            fontFamily: 'Pixelated', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(3));

        const refreshMute = () => muteText.setText(`MUTE: ${this.settings.muted ? 'ON' : 'OFF'}`);
        refreshMute();
        this.addTabItem(this.makeButton(960, 790, '[ TOGGLE MUTE ]', () => {
            this.settings.muted = !this.settings.muted;
            applyGlobalAudioSettings(this, this.settings);
            saveGameSettings(this.settings);
            refreshMute();
        }));
    }

    createVolumeRow(y, label, settingName) {
        const labelText = this.addTabItem(this.add.text(590, y, label, {
            fontFamily: 'Pixelated', fontSize: '30px', color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(3));
        const valueText = this.addTabItem(this.add.text(1190, y, '', {
            fontFamily: 'Pixelated', fontSize: '30px', color: '#ffdd00'
        }).setOrigin(0.5).setDepth(3));
        const refresh = () => valueText.setText(`${Math.round(this.settings[settingName] * 100)}%`);
        refresh();

        this.addTabItem(this.makeButton(1080, y, '[ - ]', () => {
            this.settings[settingName] = Math.max(0, Math.round((this.settings[settingName] - 0.1) * 10) / 10);
            saveGameSettings(this.settings);
            refresh();
        }));
        this.addTabItem(this.makeButton(1300, y, '[ + ]', () => {
            this.settings[settingName] = Math.min(1, Math.round((this.settings[settingName] + 0.1) * 10) / 10);
            saveGameSettings(this.settings);
            refresh();
            if (settingName === 'sfxVolume' && !this.settings.muted) {
                this.sound.play('sdSound', { volume: this.settings.sfxVolume });
            }
        }));
    }

    showControlsTab() {
        this.addTabItem(this.add.text(960, 315, 'Click a binding, then press a new key', {
            fontFamily: 'Pixelated', fontSize: '24px', color: '#bbbbbb'
        }).setOrigin(0.5).setDepth(3));

        const actions = Object.keys(GAME_BINDING_LABELS);
        actions.forEach((action, index) => {
            const column = index < 7 ? 0 : 1;
            const row = index % 7;
            const x = column === 0 ? 600 : 1200;
            const y = 385 + row * 70;
            this.addTabItem(this.add.text(x - 220, y, GAME_BINDING_LABELS[action], {
                fontFamily: 'Pixelated', fontSize: '23px', color: '#ffffff'
            }).setOrigin(0, 0.5).setDepth(3));

            let bindButton;
            const refresh = () => bindButton.setText(`[ ${keyNameFromCode(this.settings.keybinds[action])} ]`);
            bindButton = this.addTabItem(this.makeButton(x + 190, y, '', () => {
                this.waitingForBinding = action;
                bindButton.setText('[ PRESS KEY ]').setStyle({ color: '#ffdd00' });
                this.input.keyboard.once('keydown', (event) => {
                    const duplicate = Object.keys(this.settings.keybinds).find(
                        (name) => name !== action && this.settings.keybinds[name] === event.keyCode
                    );
                    if (duplicate) this.settings.keybinds[duplicate] = this.settings.keybinds[action];
                    this.settings.keybinds[action] = event.keyCode;
                    this.waitingForBinding = null;
                    saveGameSettings(this.settings);
                    this.showControlsTab();
                });
            }, 23));
            refresh();
        });

        this.addTabItem(this.makeButton(960, 890, '[ RESET DEFAULT KEYS ]', () => {
            this.settings.keybinds = { ...DEFAULT_GAME_SETTINGS.keybinds };
            saveGameSettings(this.settings);
            this.showControlsTab();
        }, 24));
    }
}
