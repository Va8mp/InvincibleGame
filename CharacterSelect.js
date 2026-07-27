// =============================================================================
//  CharacterSelect.js — shown after pressing Start on the Main Menu.
//  Lets the player pick Eve or Mark, then launches InvincibleGame with that
//  choice stored in the scene registry (readable as this.registry.get('selectedCharacter')).
// =============================================================================

class CharacterSelect extends Phaser.Scene {
    constructor() {
        super('CharacterSelect');
    }

    create() {
        // Background — same sky, reused from MainMenu's preload
        let bg = this.add.image(960, 540, 'menuSKY');
        bg.setTint(0x444444);
        bg.setScale(4);

        this.add.text(960, 220, 'CHOOSE YOUR CHARACTER', {
            fontSize: '64px',
            fontFamily: 'Pixelated',
            fontWeight: 'bold',
            fill: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.createCharacterOption(650, 560, 'eveSelectImg', 'EVE', 'eve');
        this.createCharacterOption(1270, 560, 'markSelectImg', 'MARK', 'mark');
    }

    createCharacterOption(x, y, textureKey, label, characterId) {
        const portrait = this.add.image(x, y, textureKey)
            .setInteractive({ useHandCursor: true })
            .setScale(0.8);

        const nameText = this.add.text(x, y + 260, label, {
            fontSize: '42px',
            fontFamily: 'Pixelated',
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        portrait.on('pointerover', () => {
            portrait.setScale(0.86);
            nameText.setStyle({ fill: '#ffcc00' });
        });

        portrait.on('pointerout', () => {
            portrait.setScale(0.8);
            nameText.setStyle({ fill: '#ffffff' });
        });

        portrait.on('pointerdown', () => {
            this.registry.set('selectedCharacter', characterId);
            this.scene.start('InvincibleGame');
        });
    }
}
