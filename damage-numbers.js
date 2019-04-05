/* Damage Numbers script
* Generates Final Fantasy-style damage numbers whenever a token's health increases or decreases.
* Works for any system.
* 
* Created by Quinn Gordon
* Roll20: https://app.roll20.net/users/42042/prof
* Github: https://github.com/ProfessorProf
*/

on('ready', () => {
    // Config:
    const config = {
        enabled: true,              // Set to false to disable script
        font: 'Contrail One',       // Choices: 'Arial', 'Patrick Hand', 'Contrail One', 'Shadows Into Light', 'Candal'
        fontSize: 16,               // Font size of damage numbers
        damageColor: 'black',       // Color of damage numbers
        healingColor: 'green',      // Color of healing numbers
        healthBar: 1,               // Which bar is the health bar?
        displayHealing: true,       // Show green numbers when health increases
        requireMaxHealth: false,    // Only show damage numbers if the token has a maximum health
        requirePlayerPage: true     // Only show damage numbers on the active player page
    }
    
    const barValueKey = `bar${config.healthBar}_value`;
    const barMaxKey = `bar${config.healthBar}_max`;
    
    const getActivePages = () => [
        ...new Set([
            Campaign().get('playerpageid'),
            ...Object.values(Campaign().get('playerspecificpages')),
            ...findObjs({
                type: 'player',
                online: true
            })
            .filter((p)=>playerIsGM(p.id))
            .map((p)=>p.get('lastpage'))
        ])
    ];
    
    // Generate damage/healing numbers
    on('change:graphic', function(obj, prev) {
        if(config.enabled) {
            if(config.requirePlayerPage) {
                // Do nothing if it was a token on another page
                let activePages = getActivePages();

                if(!activePages.includes(obj.get('_pageid'))) {
                    return;
                }
            }
            
            const oldHp = parseInt(prev[barValueKey]);
            const oldHpMax = parseInt(prev[barMaxKey]);
            const newHp = parseInt(obj.get(barValueKey));
            const newHpMax = parseInt(obj.get(barMaxKey));
            
            // Do nothing if the bar value didn't change
            if(oldHp && newHp && oldHp == newHp) {
                return;
            }
            
            damageNumber(obj, oldHp, newHp, oldHpMax, newHpMax);
        }
    });
    
    // Display damage number for a token
    function damageNumber(token, oldHp, newHp, oldHpMax, newHpMax) {
        if(oldHp != oldHp || newHp != newHp || 
            (oldHpMax == oldHpMax && newHpMax == newHpMax && oldHpMax != newHpMax) || 
            oldHp - newHp == oldHpMax - newHpMax) {
            // NaN values or max HP changed, don't show a number
            return;
        }
    
        let hpChange = newHp - oldHp;
    
        if(!config.displayHealing && hpChange > 0) {
            // Do nothing if it's a healing value and healing numbers are disabled
            return;
        }
    
        if(config.requireMaxHealth && !newHpMax) {
            // Do nothing if there's no max HP and require max health is enabled
            return;
        }
    
        let number = createObj('text', {
            _pageid: token.get('_pageid'),
            layer: token.get('layer'),
            left: token.get('left') - token.get('width') * 0.4 + Math.floor(Math.random() * (token.get('width') * 0.8)),
            top: token.get('top') - token.get('height') / 2 + Math.floor(Math.random() * 20),
            text: Math.abs(hpChange).toString(),
            font_family: config.font,
            font_size: config.fontSize,
            color: hpChange > 0 ? config.healingColor : config.damageColor
        });
    
        log(`Created damage number for ${Math.abs(hpChange)} ${hpChange > 0 ? 'healing' : 'damage'} to token ${token.get('name') ? token.get('name') : token.get('_id')}.`);
    
        updateDamageNumber(number, number.get('top') - 50, 20)
    }
    
    // Move the number upwards slightly every 50ms, then delete it
    function updateDamageNumber(number, targetTop, steps) {
        if(steps <= 0) {
            number.remove();
            return;
        }
    
        let top = number.get('top');
        top += (targetTop - top) * 0.3;
        number.set('top', top);
        setTimeout(function () {
            updateDamageNumber(number, targetTop, steps - 1);
        }, 50);
    }
});