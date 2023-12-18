const fs = require('fs/promises')
const path = require('path')

async function parseTimeZoneData (filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  const lines = content.split('\n')

  const zones = {}
  let currentZone = ''
  let currentZoneData = []

  for (const line of lines) {
    if (line.startsWith('Zone')) {
      // Procesar las líneas acumuladas de la zona anterior
      processCurrentZone()
      currentZone = line.split(/\s+/)[1]
      currentZoneData = [line]
    } else if (line.startsWith('\t') && currentZone) {
      // Acumular líneas de la zona actual
      currentZoneData.push(line)
    }
  }

  // Procesar la última zona acumulada
  processCurrentZone()

  function processCurrentZone () {
    if (currentZone && currentZoneData.length) {
      const lastLine = currentZoneData[currentZoneData.length - 1]
      const parts = lastLine.trim().split(/\s+/).filter(Boolean)

      // Asegurarse de que la línea contiene la información de offset
      if (parts[0] === 'Zone' || parts[0].match(/^[\+\-]?\d+(:\d+)?$/)) {
        zones[currentZone] = {
          offset: parts[0] === 'Zone' ? parts[2] : parts[0],
          format: parts.length > 3 ? parts[3] : null,
          until: parts.length > 4 ? parts.slice(4).join(' ') : null
        }
      }
    }
  }

  return zones
}

async function processDirectory (directoryPath) {
  const files = await fs.readdir(directoryPath)
  const allZones = {}

  for (const file of files) {
    const filePath = path.join(directoryPath, file)
    const fileStats = await fs.stat(filePath)

    if (fileStats.isFile()) {
      const zones = await parseTimeZoneData(filePath)
      Object.assign(allZones, zones)
    }
  }

  return allZones
}

async function main () {
  const directoryPath = path.join(__dirname, 'tzfiles') // Cambia a la ruta de tu directorio
  const zones = await processDirectory(directoryPath)
  await fs.writeFile(path.join(__dirname, 'combined_zones.json'), JSON.stringify(zones, null, 2))
  console.log('Combined zones data written to combined_zones.json')
}

main().catch(console.error)
