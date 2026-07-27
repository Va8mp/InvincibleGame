// =============================================================================
//  Preload.js — All asset loading for the Invincible Fan Game
//  Called from InvincibleGame.js preload() as:  scenePreload(this);
// =============================================================================

function scenePreload(scene) {
    //Main Menu assets.
    scene.load.image('menuSKY', 'Assets/Background/MainMenu/Sky.png');

    //The Pictures that you can choose between Mark or Eve.
    scene.load.image('eveSelectImg', 'Assets/PlayableLogos/EveSelect.png');
    scene.load.image('markSelectImg', 'Assets/PlayableLogos/MarkSelect.png');

    //The items that you can heal with.
    scene.load.image('Milkshake', 'Assets/Items/ASTEAK.png');
    scene.load.image('Steak', 'Assets/Items/BananaMilkshake.png');

    //INVINCIBLE ASSETS
    //----------------------------------------------------------------------------------------------------------------

    // Mark — Idle
    scene.load.image('Markidle1', 'MarkSprites/Idle/Idle_00.png');
    scene.load.image('Markidle2', 'MarkSprites/Idle/Idle_01.png');
    scene.load.image('Markidle3', 'MarkSprites/Idle/Idle_02.png');
 
    // Mark — Walk
    scene.load.image('Markwalk1', 'MarkSprites/Move/Walk_00.png');
    scene.load.image('Markwalk2', 'MarkSprites/Move/Walk_01.png');
    scene.load.image('Markwalk3', 'MarkSprites/Move/Walk_02.png');

    // Mark — Light Attack Combo (3-hit: H, H, H)
    scene.load.image('Markhit1', 'MarkSprites/Hit/FirstAttack_00.png');
    scene.load.image('Markhit2', 'MarkSprites/Hit/FirstAttack_01.png');

    scene.load.image('Markhit3', 'MarkSprites/Hit/SecondAttack_01.png');
    scene.load.image('Markhit4', 'MarkSprites/Hit/SecondAttack_02.png');

    scene.load.image('Markhit5', 'MarkSprites/Hit/ThirdAttack_01.png');
    scene.load.image('Markhit6', 'MarkSprites/Hit/ThirdAttack_02.png');

    // Mark — Heavy Attack (unused for now, loaded for future use)
    scene.load.image('Markheavy1', 'MarkSprites/Hit/HeavyUAttack_00.png');
    scene.load.image('Markheavy2', 'MarkSprites/Hit/HeavyUAttack_01.png');
    scene.load.image('Markheavy3', 'MarkSprites/Hit/HeavyUAttack_02.png');

    // Mark — Dash Attack
    scene.load.image('Markdash1', 'MarkSprites/Hit/DashAttack_00.png');
    scene.load.image('Markdash2', 'MarkSprites/Hit/DashAttack_01.png');

    // Mark — Block
    scene.load.image('Markblock1', 'MarkSprites/Block/Block_01.png');

    // Mark — Rage Attack
    scene.load.image('Markrage1', 'MarkSprites/Effects/Rage_00.png');
    scene.load.image('Markrage2', 'MarkSprites/Effects/Rage_01.png');
    scene.load.image('Markrage3', 'MarkSprites/Effects/Rage_02.png');

    // Power and HP logos for Mark
    scene.load.image('markHPLogo', 'Assets/PlayableLogos/MarkHP.png');
    scene.load.image('dashLogo', 'Assets/PowerLogos/MarkDash.png');
    scene.load.image('rageLogo', 'Assets/PowerLogos/MarkRage.png');

    //ATOM EVE ASSETS
    //----------------------------------------------------------------------------------------------------------------

    // Eve — Idle
    scene.load.image('idle1', 'EveSprites/Idle/Idle_00.png');
    scene.load.image('idle2', 'EveSprites/Idle/Idle_01.png');
    scene.load.image('idle3', 'EveSprites/Idle/Idle_02.png');
 
    // Eve — Walk
    scene.load.image('walk1', 'EveSprites/Move/Walk_00.png');
    scene.load.image('walk2', 'EveSprites/Move/Walk_01.png');
    scene.load.image('walk3', 'EveSprites/Move/Walk_02.png');
    
    // Eve — Light Attack Combo
    scene.load.image('hit1', 'EveSprites/Hit/FirstCombo_00.png');
    scene.load.image('hit2', 'EveSprites/Hit/FirstCombo_01.png');
    scene.load.image('hit3', 'EveSprites/Hit/FirstCombo_011.png');
    scene.load.image('hit4', 'EveSprites/Hit/FirstCombo_012.png');

    // Eve — Heavy Attack
    scene.load.image('heavy1', 'EveSprites/Hit/HeavyAttack_00.png');
    scene.load.image('heavy2', 'EveSprites/Hit/HeavyAttack_01.png');

    // Eve — Dodge / Sprint
    scene.load.image('dodge1', 'EveSprites/Dodge/Sprint_00.png');
    scene.load.image('dodge2', 'EveSprites/Dodge/Sprint_01.png');
    scene.load.image('dodge3', 'EveSprites/Dodge/Sprint_02.png');

    // Eve — Projectile
    scene.load.image('pro1', 'EveSprites/Effects/Projectile_01.png');
    scene.load.image('pro2', 'EveSprites/Effects/Projectile_02.png');
    scene.load.image('pro3', 'EveSprites/Effects/Projectile_03.png');

    // Eve — Shield
    scene.load.image('shield1', 'EveSprites/Effects/Shield_01.png');
    scene.load.image('shield2', 'EveSprites/Effects/Shield_02.png');
    scene.load.image('shield3', 'EveSprites/Effects/Shield_03.png');

    // Eve — Heal
    scene.load.image('heal1', 'EveSprites/Effects/Heal_01.png');
    scene.load.image('heal2', 'EveSprites/Effects/Heal_02.png');
    scene.load.image('heal3', 'EveSprites/Effects/Heal_03.png');

    // Background
    scene.load.image('subwayBG',    'Assets/Background/Subway.jpg');
    scene.load.image('blinkLight',  'Assets/Background/Lights.png');
    scene.load.image('cloudMoving', 'Assets/Background/Cloud.png');

    // Power and HP logos for EVE
    scene.load.image('eveHPLogo', 'Assets/PlayableLogos/EveHP.png');
    scene.load.image('shieldLogo', 'Assets/PowerLogos/EveShield.png');
    scene.load.image('healingLogo', 'Assets/PowerLogos/EveHealing.png');

    // Thug_01 — Idle
    scene.load.image('thug_idle1', 'Enemies/Thug_01/Idle_00.png');
    scene.load.image('thug_idle2', 'Enemies/Thug_01/Idle_01.png');

    // Thug_01 — Walk
    scene.load.image('thug_walk1', 'Enemies/Thug_01/Walk_00.png');
    scene.load.image('thug_walk2', 'Enemies/Thug_01/Walk_01.png');
    scene.load.image('thug_walk3', 'Enemies/Thug_01/Walk_02.png');
    scene.load.image('thug_walk4', 'Enemies/Thug_01/Walk_03.png');

    // Thug_01 — Hit / Stun
    scene.load.image('thug_hit1',  'Enemies/Thug_01/Hit_00.png');
    scene.load.image('thug_hit2',  'Enemies/Thug_01/Hit_01.png');
    scene.load.image('thug_hit3',  'Enemies/Thug_01/Hit_02.png');
    scene.load.image('thug_stun1', 'Enemies/Thug_01/Kd_00.png');
    scene.load.image('thug_stun2', 'Enemies/Thug_01/Kd_01.png');

    // ── Thug_02 — Idle ─────────────────────────────────────────────────────────────
    scene.load.image('thug02_idle1', 'Enemies/Thug_02/Idle_00.png');
    scene.load.image('thug02_idle2', 'Enemies/Thug_02/Idle_01.png');
    scene.load.image('thug02_idle3', 'Enemies/Thug_02/Idle_02.png');

    // ── Thug_02 — Walk ─────────────────────────────────────────────────────────────
    scene.load.image('thug02_walk1', 'Enemies/Thug_02/Walk_00.png');
    scene.load.image('thug02_walk2', 'Enemies/Thug_02/Walk_01.png');
    scene.load.image('thug02_walk3', 'Enemies/Thug_02/Walk_02.png');

    // ── Thug_02 — Hit / Stun ───────────────────────────────────────────────────────
    scene.load.image('thug02_hit1', 'Enemies/Thug_02/Hit_00.png');
    scene.load.image('thug02_hit2', 'Enemies/Thug_02/Hit_01.png');
    scene.load.image('thug02_hit3', 'Enemies/Thug_02/Hit_05.png');

    scene.load.image('thug02_stun1', 'Enemies/Thug_02/Kd_00.png');
    scene.load.image('thug02_stun2', 'Enemies/Thug_02/Kd_01.png');

    // ── Thug_02 — Projectile ───────────────────────────────────────────────────────
    scene.load.image('thug02_pro1', 'Enemies/Thug_02/Projectile_01.png');
    scene.load.image('thug02_pro2', 'Enemies/Thug_02/Projectile_02.png');
    scene.load.image('thug02_pro3', 'Enemies/Thug_02/Projectile_03.png');

    scene.load.image('thug02_blast1', 'Enemies/Thug_02/ProjBlast_00.png');
    scene.load.image('thug02_blast2', 'Enemies/Thug_02/ProjBlast_01.png');
    scene.load.image('thug02_blast3', 'Enemies/Thug_02/ProjBlast_02.png');

    // Music — update path to match your file
    scene.load.audio('bgMusic', 'Assets/Music/Invincible_Street_01.mp3');
    scene.load.audio('menuMusic', 'Assets/Music/MainMenu.mp3');

    //Sound Effects
    scene.load.audio('sdAbility', 'Assets/Sound/Ability.mp3');
    scene.load.audio('sdBoxBreak', 'Assets/Sound/BoxBreak_01.mp3');
    scene.load.audio('sdEnemyDie', 'Assets/Sound/Enemy_Die.mp3');
    scene.load.audio('sdExplosion', 'Assets/Sound/Explosion_Small_01.mp3');
    scene.load.audio('sdExplosion02', 'Assets/Sound/Explosion_Small_02.mp3');
    scene.load.audio('sdFail', 'Assets/Sound/Level_Fail.mp3');
    scene.load.audio('sdRocket', 'Assets/Sound/Rocket.mp3');
    scene.load.audio('sdSound', 'Assets/Sound/Sound_01.mp3');
}
