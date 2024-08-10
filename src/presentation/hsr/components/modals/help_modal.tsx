import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import { observer } from 'mobx-react-lite'

export const HelpModal = observer(() => {
  return (
    <div className="w-[50vw] bg-primary-dark rounded-lg p-3 space-y-2">
      <p className="text-lg font-bold text-white">Quick Guide</p>
      <Collapsible label="Terms and Descriptions">
        <p>
          <b className="text-desc">Damage Properties</b>:
        </p>
        <BulletPoint>
          <b>Normal</b> - A default damage type. Can be affected by every type of DMG Boost.
        </BulletPoint>
        <BulletPoint>
          <b>Additional DMG</b> - A single instance of damage dealt at the end of the main attack. Not considered a hit
          nor an attack. Usually only benefits from All-Type and Elemental DMG Boost.
        </BulletPoint>
        <BulletPoint>
          <b>Frozen</b> - A sub-type of Additional DMG dealt when a <b className="text-hsr-ice">Frozen</b> unit is
          unfrozen. Frozen DMG triggered by abilities can CRIT; those triggered by Weakness Break cannot.
        </BulletPoint>
        <BulletPoint>
          <b>Pure DMG</b> - A sub-type of Additional DMG dealt that is not affected by any of the attacker's buffs. As
          of now, the only source of Pure DMG is the Light Cone <b>Time Waits for No One</b>.
          <BulletPoint color="text-red">
            The calculation is still a bit janky because I can't really find how many things are taken into account when
            calculating this type of DMG and I sadly don't own one.
          </BulletPoint>
        </BulletPoint>
        <BulletPoint>
          <b>DoT</b> - Damage dealt by DoT debuffs at the start of a unit's turn or when detonated. Can be affected by
          DMG Boost but <i>cannot</i> CRIT. Break DoT does not benefit from DMG Boost.
        </BulletPoint>
        <BulletPoint>
          <b>Follow-Up DMG</b> - Damage dealt by <u>follow-up attacks</u> triggered by certain abilities or summons.{' '}
          <u>Counters</u> are also considered <u>follow-up attacks</u>.
        </BulletPoint>
        <BulletPoint>
          <b>Break DMG</b> - Damage dealt via breaking enemy Weakness or certain abilities. Scales with the attacker's
          Break Effect and the target's Max Toughness. Does not benefit from DMG Boost and <i>cannot</i> CRIT.
        </BulletPoint>
        <BulletPoint>
          <b>Super Break DMG</b> - A sub-type of Break DMG dealt by certain abilities while the target is Weakness
          Broken. Scales with the attacker's Break Effect and the attack's Toughness DMG instead. Affected by Hit Split.
        </BulletPoint>
      </Collapsible>
      <Collapsible label="Team Setup">
        <p>This page contains 3 main sections:</p>
        <p>
          1. <b className="text-desc">Character</b>: allows you to select your character for the slot, as well as
          specifying their level, ascension, Eidolon, and talent levels.
        </p>
        <BulletPoint>
          To change your character, click the box below <span className="text-desc">Name</span>. This will bring up a
          modal for character selection. Inputs for character's level, ascension and Eidolon are right below, and will
          be disabled until a character is chosen.
        </BulletPoint>
        <BulletPoint>
          Once a character is chosen, you may additionally change their talent levels. Please note that this level does
          not include additional level gained through Eidolon.
        </BulletPoint>
        <BulletPoint>
          Character's stats are also displayed below. These values does not take any conditional effects into account.
          To view the character's final stats after conditionals, please head to the{' '}
          <b className="text-red">Damage Calculator</b> page.
        </BulletPoint>
        <BulletPoint>
          You can save builds for each character and assign one of them as your default build. Once set, every time you
          select the character, the app will automatically equips them with the weapon and artifacts from the default
          build.
        </BulletPoint>
        <p className="pt-1">
          2. <b className="text-desc">Light Cone</b>: allows you to select your character's Light Cone.
        </p>
        <BulletPoint>
          You can hover the <i className="fa-regular fa-question-circle indent-0" /> icon for the Light Cone's passive
          at the chosen refinement.
        </BulletPoint>
        <p className="pt-1">
          3. <b className="text-desc">Traces</b>: allows you to customize your character's ability levels, ascension
          passives and minor traces.
        </p>
        <BulletPoint>
          Ability levels and ascension passives are tied to your character's ascension level. Minor traces are not tied
          to anything, so only toggle those you want to take effect.
        </BulletPoint>
        <p className="pt-1">
          4. <b className="text-desc">Relics</b>: allows you to customize your character's relics.
        </p>
        <BulletPoint>
          Adding a new relic will create it in your <b className="text-red">Relic Inventory</b> while equipping an relic
          will instead allow you to choose any existing ones from there.
        </BulletPoint>
        <BulletPoint>
          Once equipped, hover over the relic card for options to edit, swap, unequip or delete the relic.
        </BulletPoint>
        <BulletPoint>
          The set bonus for equipped relics and the team's elemental resonance can be found at the bottom. Hover their
          name to display the effects.
        </BulletPoint>
        <BulletPoint>
          You may save a set of relics as build using the button on the bottom right of the page. You can also
          fast-equip a saved build from there as well.
        </BulletPoint>
      </Collapsible>
      <Collapsible label="Damage Calculator">
        <p>
          You can see the damage each character deals here, including those from Reactions. Hover over each number for a
          formula breakdown.
        </p>
        <BulletPoint>
          Toggle the checkbox at the end of each damage row to include it in the Total row down below. Some are toggled
          on by default. Adjust as you see fit.
        </BulletPoint>
        <BulletPoint>
          The <span className="text-desc">Modifiers</span> tab on the right allows you to toggle the character's
          conditional effects that can take effect on them. Hover the name for the detail on the effect's source.
        </BulletPoint>
        <BulletPoint>
          The calculator calculates the stats for every character in the team at once. Effects that are dependent on a
          character's stats (e.g. Fu Xuan's skill or Robin's ultimate) will automatically use the calculated amount. You
          only have to toggle it.
        </BulletPoint>
        <BulletPoint>
          Character's stats displayed here are the final value that includes all the applicable buffs. For a breakdown
          of where these numbers come from, they can be accessed in the{' '}
          <span className="text-desc">Stats Breakdown</span> menu in the <span className="text-desc">Stats</span> tab.
        </BulletPoint>
        <BulletPoint>
          You can also quickly swap your Light Cone and relics in the <span className="text-desc">Loadout</span> tab.
          Changes made there will not be reflected on any other page.
        </BulletPoint>
        <BulletPoint>
          Target enemy's stats can be set in <span className="text-desc">Enemy Setting</span> menu. Next to it is the{' '}
          <span className="text-desc">Debuff</span> menu that displays all current debuffs the enemy target is
          sustaining.
        </BulletPoint>
      </Collapsible>
      <Collapsible label="Account Data">
        <BulletPoint>
          Your account data is saved in <span className="text-desc">My Characters</span>,{' '}
          <span className="text-desc">My Builds</span> and <span className="text-desc">Relic Inventory</span>. You can
          check and modify them in each respective section.
        </BulletPoint>
        <BulletPoint>
          You may manually input your data or alternatively import it from either an{' '}
          <span className="text-desc">Exported JSON File</span> or with <span className="text-desc">UID</span>.
        </BulletPoint>
        <BulletPoint>
          Changes made in <span className="text-desc">Team Setup</span> Page will not affect your account data.
        </BulletPoint>
        <BulletPoint>
          Your data on this app is <span className="text-red">temporary</span> and will be lost once you close or
          refresh the app. You may toggle on the{' '}
          <span className="text-desc">Automatically save my account data to the browser's local storage</span> option in
          the <span className="text-desc">Settings</span>.
        </BulletPoint>
      </Collapsible>
    </div>
  )
})
