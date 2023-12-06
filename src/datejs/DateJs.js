import tokens from './utils/tokens.js'
import { units } from './utils/units.js'
import util from 'node:util'

const funcFormat = (date, format, zone) => {
  Object.keys(tokens).forEach(token => {
    format = format.split(token).join(tokens[token](date, zone))
  })

  return format
}

const parseDate = (date) => {
  if (typeof date === 'string' || typeof date === 'number') {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate)) {
      throw new Error('Invalid Date')
    }
    return parsedDate
  } else if (date instanceof Date) {
    return date
  }
  throw new Error('Invalid Date')
}

class DateJs {
  constructor (date = new Date()) {
    this.date = parseDate(date)
  }

  #adjustDate (amount, unit, add) {
    if (!units[unit]) {
      throw new Error('Invalid unit')
    }

    const dateMethod = `get${units[unit]}`
    const newDateMethod = `set${units[unit]}`
    const newValue = this.date[dateMethod]() + (add ? amount : -amount)

    this.date[newDateMethod](newValue)
  }

  #adjustToUnitBoundary (unit, isEnd) {
    const setToStartOfDay = () => this.date.setHours(0, 0, 0, 0)
    const setToEndOfDay = () => this.date.setHours(23, 59, 59, 999)

    switch (unit) {
      case 'day':
        isEnd ? setToEndOfDay() : setToStartOfDay()
        break
      case 'month':
        if (isEnd) {
          this.date.setMonth(this.date.getMonth() + 1, 0)
          setToEndOfDay()
        } else {
          this.date.setDate(1)
          setToStartOfDay()
        }
        break
      case 'year':
        if (isEnd) {
          this.date.setFullYear(this.date.getFullYear() + 1, 0, 0)
          setToEndOfDay()
        } else {
          this.date.setMonth(0, 1)
          setToStartOfDay()
        }
        break
      default:
        throw new Error('Invalid unit')
    }
  }

  format (format) {
    const date = this.date
    return funcFormat(date, format)
  }

  add (amount, unit) {
    this.#adjustDate(amount, unit, true)
    return this
  }

  subtract (amount, unit) {
    this.#adjustDate(amount, unit, false)
    return this
  }

  startOf (unit) {
    this.#adjustToUnitBoundary(unit, false)
    return this
  }

  endOf (unit) {
    this.#adjustToUnitBoundary(unit, true)
    return this
  }

  gt (date) {
    return this.date > date
  }

  lt (date) {
    return this.date < date
  }

  eq (date) {
    return this.date.getTime() === date.getTime()
  }

  gte (date) {
    return this.date >= date
  }

  lte (date) {
    return this.date <= date
  }

  valueOf () {
    return this.date.valueOf()
  }

  [util.inspect.custom] () {
    return this.date
  }
}

function datejs (date) {
  return new DateJs(date)
}

export default datejs
