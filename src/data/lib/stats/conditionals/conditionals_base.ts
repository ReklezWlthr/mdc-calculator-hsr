import _ from 'lodash'
import BladeBase from './characters/Blade_B'
import JingliuBase from './characters/Jingliu_B'
import KafkaBase from './characters/Kafka_B'
import SilverWolfBase from './characters/SilverWolf_B'
import SparkleBase from './characters/Sparkle_B'
import BlackSwanBase from './characters/BlackSwan_B'

const baseConditional = [
  { id: '1005', conditionals: KafkaBase },
  { id: '1006', conditionals: SilverWolfBase },
  { id: '1205', conditionals: BladeBase },
  { id: '1212', conditionals: JingliuBase },
  { id: '1306', conditionals: SparkleBase },
  { id: '1307', conditionals: BlackSwanBase },
]

export const buffedList = _.map(baseConditional, (item) => item.id)

export default baseConditional
