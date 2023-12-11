/* eslint-disable no-case-declarations */
const tokens = require('./utils/tokens')
const { units } = require('./utils/units')
const util = require('node:util')
const fs = require('node:fs')
const path = require('node:path')

const SECONDS_IN_MILLISENCONDS = 1000
const MINUTES_IN_MILLISENCONDS = 60000
const HOURS_IN_MILLISENCONDS = 3600000
const DAYS_IN_MILLISENCONDS = 86400000
let ZONES = {}

const formatDate = (date, format, zone) => {
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

(() => {
  const zones = fs.readFileSync(path.join(__dirname, './zones/zones.json'), 'utf-8')
  const parsedZones = JSON.parse(zones)
  ZONES = parsedZones.zones
})()

class ChronoQuilt {
  constructor (date = new Date()) {
    this.date = parseDate(date)
    this.zone = ChronoQuilt.zone
    this.setZone(this.zone)
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

  setZone (zone) {
    if (!zone) return
    ChronoQuilt.zone = zone
    this.zone = zone
    const zoneInfo = ZONES[zone]

    if (!zoneInfo) throw new Error('Invalid zone')
    const { offset } = zoneInfo
    const [hours = 0, minutes = 0, seconds = 0] = offset.split(':').map(Number)

    if (hours < 0) {
      const offset = Math.abs(hours)
      this.date.setHours(this.date.getHours() - offset)
      this.date.setMinutes(this.date.getMinutes() - minutes)
      this.date.setSeconds(this.date.getSeconds() - seconds)
    }

    if (hours > 0) {
      this.date.setHours(this.date.getHours() + hours)
      this.date.setMinutes(this.date.getMinutes() + minutes)
      this.date.setSeconds(this.date.getSeconds() + seconds)
    }

    return this
  }

  diff (date, unit) {
    const diffTime = Math.abs(this.date - date)

    switch (unit) {
      case 'MILLISENCONDS':
        return diffTime
      case 'second':
        return Math.floor(diffTime / SECONDS_IN_MILLISENCONDS)
      case 'minute':
        return Math.floor(diffTime / MINUTES_IN_MILLISENCONDS)
      case 'hour':
        return Math.floor(diffTime / HOURS_IN_MILLISENCONDS)
      case 'day':
        return Math.floor(diffTime / DAYS_IN_MILLISENCONDS)
      case 'month':
        let months
        months = (this.date.getFullYear() - date.getFullYear()) * 12
        months -= date.getMonth()
        months += this.date.getMonth()
        return months <= 0 ? 0 : months
      default:
        throw new Error('Invalid unit')
    }
  }

  format (format) {
    const date = this.date
    return formatDate(date, format)
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

  hours () {
    return this.date.getHours()
  }

  minutes () {
    return this.date.getMinutes()
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

function chronoquilt (date) {
  return new ChronoQuilt(date)
}

module.exports = chronoquilt
