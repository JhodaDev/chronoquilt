/* eslint-disable no-case-declarations */
const tokens = require('./utils/tokens')
const { units } = require('./utils/units')
const util = require('util')
const fs = require('fs')
const path = require('path')

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

/**
 * Clase ChronoQuilt para manejar fechas y zonas horarias en JavaScript.
 */
class ChronoQuilt {
  /**
   * Crea una instancia de ChronoQuilt.
   * @param {Date|string|number} [date=new Date()] - La fecha inicial para la instancia, puede ser un objeto Date, una cadena o un número.
   */
  constructor (date = new Date()) {
    this.date = parseDate(date)
    this.zone = ChronoQuilt.zone
    this.setZone(this.zone)
  }

  /**
   * Método privado para ajustar la fecha actual de la instancia.
   * @param {number} amount - La cantidad para ajustar.
   * @param {string} unit - La unidad de tiempo para el ajuste ('day', 'month', 'year', etc.).
   * @param {boolean} add - Especifica si se debe sumar (true) o restar (false) la cantidad.
   * @private
   */
  #adjustDate (amount, unit, add) {
    if (!units[unit]) {
      throw new Error('Invalid unit')
    }

    const dateMethod = `get${units[unit]}`
    const newDateMethod = `set${units[unit]}`
    const newValue = this.date[dateMethod]() + (add ? amount : -amount)
    this.date[newDateMethod](newValue)
  }

  /**
   * Método privado para ajustar la fecha actual a los límites de la unidad de tiempo especificada (por ejemplo, inicio o fin de mes).
   * @param {string} unit - La unidad de tiempo para el ajuste ('day', 'month', 'year', etc.).
   * @param {boolean} isEnd - Especifica si se debe ajustar al final (true) o al inicio (false) de la unidad de tiempo.
   * @private
   */
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

  /**
   * Establece la zona horaria para la instancia.
   * @param {string} zone - La zona horaria a establecer.
   * @returns {ChronoQuilt} Retorna la instancia para encadenar métodos.
   */
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

  /**
   * Calcula la diferencia entre la fecha de la instancia y otra fecha, en la unidad especificada.
   * @param {Date|string|number} date - La fecha con la que comparar.
   * @param {string} unit - La unidad en la que se desea la diferencia ('seconds', 'minutes', 'hours', etc.).
   * @returns {number} La diferencia en la unidad especificada.
   */
  diff (date, unit) {
    date = new Date(date)
    const diffTime = Math.abs(this.date - date)

    switch (unit) {
      case 'milliseconds':
        return diffTime
      case 'seconds':
        return Math.floor(diffTime / SECONDS_IN_MILLISENCONDS)
      case 'minutes':
        return Math.floor(diffTime / MINUTES_IN_MILLISENCONDS)
      case 'hours':
        return Math.floor(diffTime / HOURS_IN_MILLISENCONDS)
      case 'days':
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

  /**
   * Formatea la fecha actual de la instancia según el formato proporcionado.
   * @param {string} format - El formato en el que se desea representar la fecha.
   * @returns {string} La fecha formateada como una cadena.
  */
  format (format) {
    const date = this.date
    return formatDate(date, format)
  }

  /**
   * Añade una cantidad específica de tiempo a la fecha de la instancia.
   * @param {number} amount - La cantidad a añadir.
   * @param {string} unit - La unidad de tiempo para el ajuste ('seconds', 'minutes', 'hours', etc.).
   * @returns {ChronoQuilt} Retorna la instancia para encadenar métodos.
  */
  add (amount, unit) {
    this.#adjustDate(amount, unit, true)
    return this
  }

  /**
   * Obtiene el año completo de la fecha de la instancia.
   * @returns {number} El año completo.
  */
  getFullYear () {
    return this.date.getFullYear()
  }

  /**
   * Resta una cantidad específica de tiempo de la fecha de la instancia.
   * @param {number} amount - La cantidad a restar.
   * @param {string} unit - La unidad de tiempo para el ajuste ('seconds', 'minutes', 'hours', etc.).
   * @returns {ChronoQuilt} Retorna la instancia para encadenar métodos.
  */
  subtract (amount, unit) {
    this.#adjustDate(amount, unit, false)
    return this
  }

  /**
   * Ajusta la fecha de la instancia al inicio de la unidad de tiempo especificada.
   * @param {string} unit - La unidad de tiempo para el ajuste ('day', 'month', 'year', etc.).
   * @returns {ChronoQuilt} Retorna la instancia para encadenar métodos.
  */
  startOf (unit) {
    this.#adjustToUnitBoundary(unit, false)
    return this
  }

  /**
    * Obtiene las horas de la fecha de la instancia.
    * @returns {number} Las horas.
  */
  hours () {
    return this.date.getHours()
  }

  /**
   * Obtiene los minutos de la fecha de la instancia.
   * @returns {number} Los minutos.
  */
  minutes () {
    return this.date.getMinutes()
  }

  /**
   * Obtiene el mes de la fecha de la instancia.
   * @returns {number} El mes (0-11).
  */
  month () {
    return this.date.getMonth()
  }

  /**
   * Obtiene el día del mes de la fecha de la instancia.
   * @returns {number} El día del mes.
  */
  getDate () {
    return this.date.getDate()
  }

  /**
    * Ajusta la fecha de la instancia al final de la unidad de tiempo especificada.
    * @param {string} unit - La unidad de tiempo para el ajuste ('day', 'month', 'year', etc.).
    * @returns {ChronoQuilt} Retorna la instancia para encadenar métodos.
  */
  endOf (unit) {
    this.#adjustToUnitBoundary(unit, true)
    return this
  }

  /**
   * Compara si la fecha de la instancia es mayor que otra fecha.
   * @param {Date|string|number} date - La fecha con la que comparar.
   * @returns {boolean} Verdadero si la fecha de la instancia es mayor.
  */
  gt (date) {
    return this.date > date
  }

  /**
   * Compara si la fecha de la instancia es menor que otra fecha.
   * @param {Date|string|number} date - La fecha con la que comparar.
   * @returns {boolean} Verdadero si la fecha de la instancia es menor.
  */
  lt (date) {
    return this.date < date
  }

  /**
   * Compara si la fecha de la instancia es igual a otra fecha.
   * @param {Date|string|number} date - La fecha con la que comparar.
   * @returns {boolean} Verdadero si las fechas son iguales.
  */
  eq (date) {
    return this.date.getTime() === date.getTime()
  }

  /**
   * Compara si la fecha de la instancia es mayor o igual que otra fecha.
   * @param {Date|string|number} date - La fecha con la que comparar.
   * @returns {boolean} Verdadero si la fecha de la instancia es mayor o igual.
  */
  gte (date) {
    return this.date >= date
  }

  /**
   * Compara si la fecha de la instancia es menor o igual que otra fecha.
   * @param {Date|string|number} date - La fecha con la que comparar.
   * @returns {boolean} Verdadero si la fecha de la instancia es menor o igual.
  */
  lte (date) {
    return this.date <= date
  }

  /**
   * Obtiene el valor numérico de la fecha de la instancia.
   * @returns {number} El valor numérico de la fecha.
   */
  valueOf () {
    return this.date.valueOf()
  }

  /**
   * Método personalizado para util.inspect de Node.js.
   * @returns {Date} La fecha de la instancia.
   */
  [util.inspect.custom] () {
    return this.date
  }
}

/**
 * Función para crear una nueva instancia de ChronoQuilt.
 * @param {Date|string|number} date - La fecha para la nueva instancia.
 * @returns {ChronoQuilt} Una nueva instancia de ChronoQuilt.
 */
function chronoquilt (date) {
  return new ChronoQuilt(date)
}

module.exports = chronoquilt
