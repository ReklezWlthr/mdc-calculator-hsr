import Archeron from './characters/Archeron'
import Argenti from './characters/Argenti'
import BlackSwan from './characters/BlackSwan'
import DanHeng from './characters/DanHeng'
import DrRatio from './characters/DrRatio'
import FuXuan from './characters/FuXuan'
import Gallagher from './characters/Gallagher'
import Himeko from './characters/Himeko'
import Kafka from './characters/Kafka'
import Luocha from './characters/Luocha'
import March from './characters/March'
import Seele from './characters/Seele'
import SilverWolf from './characters/SilverWolf'
import Sparkle from './characters/Sparkle'
import Welt from './characters/Welt'

export default [
  { id: '1001', conditionals: March },
  { id: '1002', conditionals: DanHeng },
  { id: '1003', conditionals: Himeko },
  { id: '1004', conditionals: Welt },
  { id: '1005', conditionals: Kafka },
  { id: '1006', conditionals: SilverWolf },
  { id: '1102', conditionals: Seele },
  { id: '1203', conditionals: Luocha },
  { id: '1208', conditionals: FuXuan },
  { id: '1301', conditionals: Gallagher },
  { id: '1302', conditionals: Argenti },
  { id: '1305', conditionals: DrRatio },
  { id: '1306', conditionals: Sparkle },
  { id: '1307', conditionals: BlackSwan },
  { id: '1308', conditionals: Archeron },
  // { id: '10000067', conditionals: Collei },
  // { id: '10000071', conditionals: Cyno },
  // { id: '10000079', conditionals: Dehya },
  // { id: '10000016', conditionals: Diluc },
  // { id: '10000039', conditionals: Diona },
  // { id: '10000068', conditionals: Dori },
  // { id: '10000051', conditionals: Eula },
  // { id: '10000076', conditionals: Faruzan },
  // { id: '10000031', conditionals: Fischl },
  // { id: '10000085', conditionals: Freminet },
  // { id: '10000089', conditionals: Furina },
  // { id: '10000092', conditionals: Gaming },
  // { id: '10000037', conditionals: Ganyu },
  // { id: '10000055', conditionals: Gorou },
  // { id: '10000046', conditionals: Hutao },
  // { id: '10000003', conditionals: Jean },
  // { id: '10000047', conditionals: Kazuha },
  // { id: '10000015', conditionals: Kaeya },
  // { id: '10000002', conditionals: Ayaka },
  // { id: '10000066', conditionals: Ayato },
  // { id: '10000081', conditionals: Kaveh },
  // { id: '10000042', conditionals: Keqing },
  // { id: '10000061', conditionals: Kirara },
  // { id: '10000029', conditionals: Klee },
  // { id: '10000056', conditionals: Sara },
  // { id: '10000065', conditionals: Kuki },
  // { id: '10000074', conditionals: Layla },
  // { id: '10000006', conditionals: Lisa },
  // { id: '10000083', conditionals: Lynette },
  // { id: '10000084', conditionals: Lyney },
  // { id: '10000080', conditionals: Mika },
  // { id: '10000041', conditionals: Mona },
  // { id: '10000073', conditionals: Nahida },
  // { id: '10000091', conditionals: Navia },
  // { id: '10000087', conditionals: Neuvillette },
  // { id: '10000070', conditionals: Nilou },
  // { id: '10000027', conditionals: Ningguang },
  // { id: '10000034', conditionals: Noelle },
  // { id: '10000035', conditionals: Qiqi },
  // { id: '10000052', conditionals: Raiden },
  // { id: '10000020', conditionals: Razor },
  // { id: '10000045', conditionals: Rosaria },
  // { id: '10000053', conditionals: Sayu },
  // { id: '10000054', conditionals: Kokomi },
  // { id: '10000063', conditionals: Shenhe },
  // { id: '10000059', conditionals: Heizou },
  // { id: '10000043', conditionals: Sucrose },
  // { id: '10000033', conditionals: Childe },
  // { id: '10000050', conditionals: Thoma },
  // { id: '10000069', conditionals: Tighnari },
  // { id: '10000022', conditionals: Venti },
  // { id: '10000075', conditionals: Wanderer },
  // { id: '10000086', conditionals: Wriothesley },
  // { id: '10000023', conditionals: Xiangling },
  // { id: '10000093', conditionals: Xianyun },
  // { id: '10000026', conditionals: Xiao },
  // { id: '10000025', conditionals: Xingqiu },
  // { id: '10000044', conditionals: Xinyan },
  // { id: '10000058', conditionals: Yae },
  // { id: '10000048', conditionals: Yanfei },
  // { id: '10000077', conditionals: Yaoyao },
  // { id: '10000060', conditionals: Yelan },
  // { id: '10000049', conditionals: Yoimiya },
  // { id: '10000064', conditionals: Yunjin },
  // { id: '10000030', conditionals: Zhongli },
  // { id: '10000095', conditionals: Sigewinne },
  // { id: '10000097', conditionals: Sethos },
  // { id: '10000098', conditionals: Clorinde },
  // // Travelers
  // { id: '10000005-504', conditionals: TravelerWind },
  // { id: '10000005-506', conditionals: TravelerRock },
  // { id: '10000005-507', conditionals: TravelerElectric },
  // { id: '10000005-508', conditionals: TravelerGrass },
  // { id: '10000005-503', conditionals: TravelerWater },
]

export const UtilTalentOverride = {
  Albedo: 'S_Alhatham_07',
  Wriothesley: 'S_Alhatham_07',
  Ayaka: 'S_Alhatham_07',
  Qin: 'Cook_Heal',
  Diona: 'Cook_Heal',
  Barbara: 'Cook_Heal',
  Hutao: 'Cook_ExtraFailedItem',
  Xiangling: 'Cook_Attack',
  Noel: 'Cook_Defense',
  Xinyan: 'Cook_Defense',
  Nilou: 'S_Yunjin_07',
  Ambor: 'Explosion_Glide',
  Collei: 'Explosion_Glide',
  Venti: 'Explosion_Glide',
  Sucrose: 'Combine_Material',
  Eula: 'Eula_Combine',
  Layla: 'Eula_Combine',
  Xingqiu: 'Combine_Talent',
  Lisa: 'Combine_Potion',
  Mona: 'Combine_Weapon',
  Diluc: 'Forge_Claymore',
  Ganyu: 'Forge_Bow',
  Zhongli: 'Forge_Pole',
  Candace: 'Explosion_Climb',
  Xiao: 'Explosion_Climb',
  Kazuha: 'Explosion_Sprint',
  Chevreuse: 'Explosion_Sprint',
  Kaeya: 'Explosion_Sprint',
  Heizo: 'Explosion_Sprint',
  Razor: 'Explosion_Sprint',
  Kokomi: 'Explosion_Swim',
  Beidou: 'Explosion_Swim',
  Rosaria: 'Rosaria_NightRunner',
  Gaming: 'S_Dehya_07',
  Chongyun: 'Expedition_Liyue',
  Keqing: 'Expedition_Liyue',
  Yelan: 'Expedition_Liyue',
  Shenhe: 'Expedition_Liyue',
  Fischl: 'Expedition_Mengde',
  Bennett: 'Expedition_Mengde',
  Faruzan: 'S_Cyno_07',
  Klee: 'Collect_Local_Mengde',
  Mika: 'Collect_Local_Mengde',
  Feiyan: 'Collect_Local_Liyue',
  Qiqi: 'Collect_Local_Liyue',
  Ningguang: 'Collect_Ore',
  Momoka: 'S_Aloy_07',
  Clorinde: 'S_Liney_07',
}

export const ReverseConsList = [
  'Ambor',
  'Furina',
  'Shougun',
  'Barbara',
  'Collei',
  'Dori',
  'Qin',
  'Ayaka',
  'Ayato',
  'Kaveh',
  'Sara',
  'Lisa',
  'Ningguang',
  'Razor',
  'Kokomi',
  'Venti',
  'Wanderer',
  'Xiangling',
  'Liuyun',
  'Clorinde',
  'PlayerRock',
  'PlayerWind',
]
