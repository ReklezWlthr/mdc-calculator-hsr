import _ from 'lodash'
import BladeBase from './characters/Blade_B'
import JingliuBase from './characters/Jingliu_B'
import KafkaBase from './characters/Kafka_B'
import SilverWolfBase from './characters/SilverWolf_B'
import SparkleBase from './characters/Sparkle_B'
import BlackSwanBase from './characters/BlackSwan_B'
import WeltBase from './characters/Welt_B'
import FireflyBase from './characters/Firefly_B'
import SeeleBase from './characters/Seele_B'
import HuohuoBase from './characters/Huohuo_B'

const baseConditional = [
  { id: '1004', conditionals: WeltBase },
  { id: '1005', conditionals: KafkaBase },
  { id: '1006', conditionals: SilverWolfBase },
  { id: '1102', conditionals: SeeleBase },
  { id: '1205', conditionals: BladeBase },
  { id: '1212', conditionals: JingliuBase },
  { id: '1217', conditionals: HuohuoBase },
  { id: '1306', conditionals: SparkleBase },
  { id: '1307', conditionals: BlackSwanBase },
  { id: '1310', conditionals: FireflyBase },
]

export const buffedList = _.map(baseConditional, (item) => item.id)

export default baseConditional
