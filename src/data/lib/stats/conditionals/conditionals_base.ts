import _ from 'lodash'
import BladeBase from './characters/Blade_B'
import JingliuBase from './characters/Jingliu_B'
import KafkaBase from './characters/Kafka_B'
import SilverWolfBase from './characters/SilverWolf_B'

const baseConditional = [
  { id: '1005', conditionals: KafkaBase },
  { id: '1006', conditionals: SilverWolfBase },
  { id: '1205', conditionals: BladeBase },
  { id: '1212', conditionals: JingliuBase },
]

export const buffedList = _.map(baseConditional, (item) => item.id)

export default baseConditional
