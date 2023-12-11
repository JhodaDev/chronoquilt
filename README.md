# ChronoQuilt

## Descripción

ChronoQuilt es una biblioteca de JavaScript diseñada para facilitar la manipulación y el manejo de fechas. Ofrece una variedad de funciones útiles para realizar operaciones como agregar o restar tiempo, comparar fechas, establecer o cambiar zonas horarias y mucho más.

## Características

- Operaciones de fecha como agregar, restar y comparar.
- Manipulación de zonas horarias.
- Conversión de formatos de fecha.
- Manejo de diferentes unidades de tiempo (milisegundos, segundos, minutos, horas, días, meses).
- Incluye una función personalizada para dar formato a las fechas.

## Instalación

Para instalar ChronoQuilt, asegúrate de tener Node.js instalado en tu sistema. Luego, puedes instalarlo mediante npm:

```bash
npm install chronoquilt
```

## Uso básico

```javascript
const chronoquilt = require("chronoquilt");

// Crear una nueva instancia de fecha
let fecha = chronoquilt(new Date());

// Agregar tiempo
fecha.add(1, "day");

// Restar tiempo
fecha.subtract(1, "month");

// Formatear fecha
console.log(fecha.format("YYYY-MM-DD"));

// Comparar fechas
let otraFecha = chronoquilt(new Date("2023-01-01"));
console.log(fecha.gt(otraFecha)); // true si fecha es mayor que otraFecha
```

## API

### Métodos

- _add (cantidad, unidad)_ - Agrega tiempo a la fecha.
- _subtract (cantidad, unidad)_ - Resta tiempo a la fecha.
- _format (formato)_ - Formatea la fecha.
- _setZone (zonaHoraria)_ - Establece la zona horaria.
- _startOf (unidad)_ - Establece la fecha al inicio de la unidad especificada.
- _endOf (unidad)_ - Establece la fecha al final de la unidad especificada.
- _diff (fecha, unidad)_ - Devuelve la diferencia entre dos fechas.


## Contribución

Para contribuir al proyecto, por favor visite el repositorio en GitHub: 

[ChronoQuilt en GitHub](https://github.com/JhodaDev/datejs)

## Licencia
ChronoQuilt está licenciado bajo la licencia MIT. Para más información, por favor visite el archivo LICENSE.

## Creditos

[JhodaDev](https://github.com/JhodaDev)
