import { BulletPoint, Collapsible } from '@src/presentation/components/collapsible'
import _ from 'lodash'
import { observer } from 'mobx-react-lite'
import changelog from '@src/data/db/changelog.json'

export const IntroModal = observer(() => {
  return (
    <div className="w-[50vw] bg-primary-dark rounded-lg p-3 space-y-2">
      <p className="text-lg font-bold text-white">About</p>
      <Collapsible
        label="Changelogs"
        childRight={<div className="px-2 py-1 font-bold rounded-md bg-primary whitespace-nowrap">v{_.head(changelog).version}</div>}
      >
        <div className="space-y-2">
          {_.map(changelog, (item) => (
            <div className="space-y-1" key={item.version}>
              <p className="ml-3 text-amber-200">
                <b className="text-desc">v{item.version}</b> - {item.date}
              </p>
              {_.map(item.desc, (desc) => (
                <BulletPoint key={desc}>
                  <span dangerouslySetInnerHTML={{ __html: desc }} />
                </BulletPoint>
              ))}
            </div>
          ))}
        </div>
      </Collapsible>
      <Collapsible label="Notes & Limitations">
        <BulletPoint>
          This calculator only calculates an instance of damage at a point of time against a single target enemy which
          may not reflect the character's or team's true potential (e.g. AoE characters or Turn/Energy manipulation).
          This makes a really good Light Cones like <b>Multiplication</b> seems weaker than they actually are. Take it
          with a grain of salt.
        </BulletPoint>
        <BulletPoint>
          The resulting stats/damage may be slightly off due to hidden decimals and some programming wizardry, but the
          differences should be negligible. SPD subs should be confirmed or imported for an accurate decimal value. The
          calculator will actively try to round the value to the nearest possible value.
        </BulletPoint>
        <BulletPoint>
          Some buffs that may take effect recursively or rely on each other (e.g. Tingyun's skill and Robin's ultimate)
          may require ordering the character in the right order to work properly. This is because the calculator
          calculates the characters' stats from left to right. It also does not support recursive calculation since the
          performance will drop significantly, and it requires a complete overhaul of the infrastructure.
        </BulletPoint>
        <BulletPoint>
          To add to the point above, some buffs like Tingyun's or Lynx's skill <u>snapshot</u> its value while others
          like Robin's ultimate does not. Be wary that the calculator assumes that all buffs are applied
          near-simultaneously. For example, normally, if Tingyun applies her skill to a DPS before Robin uses her
          ultimate, the skill will not be affected by the ultimate. However, if you toggle on both buffs in the
          calculator, Tingyun's skill will always be affected by Robin's ultimate. Finding a workaround to this issue
          could result in a very messy interface since it needs to determine which buffs is applied at what time.
        </BulletPoint>
        <BulletPoint>
          It is not recommended to use this app on mobiles or vertical screens. This is partly due to most information
          being presented in tooltips.
        </BulletPoint>
      </Collapsible>
      <div className="p-3 space-y-1 text-sm transition-all duration-200 rounded-lg bg-primary-darker text-gray">
        <p className="text-sm font-bold text-white">
          Hi, <span className="text-desc">MourningDew</span> Here...
        </p>
        <div className="space-y-1 overflow-hidden transition-all duration-200">
          <BulletPoint>
            Welcome to my little calculator project! As the name suggests, this calculator allows you to calculate the
            damage of each character in your team.
          </BulletPoint>
          <BulletPoint>
            If you encounter bugs, or have questions or suggestions, do not hesitate to contact me via:
          </BulletPoint>
          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-2 pl-4">
              <i className="w-5 fa-brands fa-discord" />
              <a>mourningdew</a>
            </div>
            <div className="flex items-center gap-2 pl-4">
              <i className="w-5 fa-brands fa-reddit-alien" />
              <a
                className="cursor-pointer focus:outline-none text-blue"
                href="https://www.reddit.com/user/ReklezWLTHR/"
                target="_blank"
              >
                u/ReklezWLTHR
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-1 text-sm transition-all duration-200 rounded-lg bg-primary-darker text-gray">
        <p className="text-sm font-bold text-white">Credits</p>
        <div className="space-y-1 overflow-hidden transition-all duration-200">
          <BulletPoint>
            <a
              className="cursor-pointer focus:outline-none text-desc"
              href="https://honkai-star-rail.fandom.com/wiki/Honkai:_Star_Rail_Wiki"
              target="_blank"
            >
              Honkai: Star Rail Wiki
            </a>{' '}
            - Formulas and Descriptions
          </BulletPoint>
          <BulletPoint>
            <a className="cursor-pointer focus:outline-none text-desc" href="https://enka.network" target="_blank">
              EnkaNetwork
            </a>{' '}
            - Stats Icons and Data Import API
          </BulletPoint>
          <BulletPoint>
            <a className="cursor-pointer focus:outline-none text-desc" href="https://wanderer.moe" target="_blank">
              Wanderer.moe
            </a>{' '}
            - Emotes
          </BulletPoint>
          <BulletPoint>
            <a className="cursor-pointer focus:outline-none text-desc" href="https://hsr17.hakush.in/" target="_blank">
              Hakush.in
            </a>{' '}
            and{' '}
            <a className="cursor-pointer focus:outline-none text-desc" href="https://homdgcat.wiki/sr/" target="_blank">
              Homdgcat.wiki
            </a>{' '}
            - Images and Information on Beta Contents
          </BulletPoint>
        </div>
      </div>
    </div>
  )
})
