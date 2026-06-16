/**
 * scripts/init-db.mjs
 *
 * Script de inicialización y sembrado de la base de datos Neon.
 *
 * EJECUTAR UNA SOLA VEZ antes del primer deploy:
 *   $ export DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
 *   $ npm run init-db
 *
 * Idempotente: si lo corres otra vez no duplica datos, solo actualiza
 * las secciones que vienen en el seed.
 */
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ Falta DATABASE_URL. Ejemplo:');
  console.error('   set DATABASE_URL=postgresql://user:pass@host/db?sslmode=require');
  console.error('   npm run init-db');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  icon          TEXT,
  gradient      TEXT,
  lesson_label  TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS theory_cards (
  id          SERIAL PRIMARY KEY,
  section_id  INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  icon        TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS examples (
  id          SERIAL PRIMARY KEY,
  section_id  INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  code        TEXT NOT NULL,
  result      TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_theory_section ON theory_cards(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_examples_section ON examples(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(order_index);
`;

const ADMIN_EMAIL = 'darkpierce@gmail.com';
const ADMIN_PASSWORD = 'Regalo2025@';

/* ===========================================================
   Contenido inicial del curso (seed).
   Si añades secciones nuevas desde el admin, no se duplican
   porque el script chequea por slug.
   =========================================================== */
const SEED_SECTIONS = [
  {
    slug: 'instalacion',
    title: 'Instalación y Configuración',
    subtitle: 'Tu primer paso con Python',
    description: 'Aprende a instalar Python en Windows, macOS y Linux. Configura tu editor de código y escribe tu primer programa.',
    icon: 'Download',
    gradient: 'from-emerald-400 to-cyan-400',
    lesson_label: 'Lección 0',
    order: 0,
    theory: [
      {
        title: '¿Qué es Python?',
        content: 'Python es un lenguaje de programación de alto nivel, interpretado, de propósito general y con una sintaxis que prioriza la legibilidad. Fue creado por Guido van Rossum y su primera versión es de 1991. Es uno de los lenguajes más populares del mundo y se usa en desarrollo web, ciencia de datos, inteligencia artificial, automatización, scripting y mucho más.',
        icon: 'Book'
      },
      {
        title: '¿Por qué aprender Python?',
        content: 'Python tiene una curva de aprendizaje suave (parecido al inglés), una comunidad enorme, miles de librerías listas para usar y demanda laboral alta. Empresas como Google, Netflix, Instagram, Spotify y NASA lo usan a diario. Es el lenguaje #1 en ciencia de datos y machine learning.',
        icon: 'Sparkles'
      },
      {
        title: 'Descargar e instalar',
        content: 'Visita python.org/downloads y descarga la última versión estable (3.12+). En Windows, marca la casilla "Add Python to PATH" antes de instalar. En macOS puedes usar el instalador o Homebrew. En Linux viene preinstalado en muchas distros; si no, instálalo con apt, dnf o pacman según corresponda.',
        icon: 'Download'
      }
    ],
    examples: [
      {
        title: 'Verificar instalación en terminal',
        description: 'Abre la terminal (cmd en Windows, Terminal en macOS/Linux) y ejecuta:',
        code: `# Windows / macOS / Linux
python --version
# o en algunos sistemas:
python3 --version

# Ver dónde está instalado
which python        # macOS/Linux
where python        # Windows`,
        result: `Python 3.12.1
/usr/bin/python3`
      },
      {
        title: 'Tu primer programa: Hola Mundo',
        description: 'Crea un archivo hola.py y ejecútalo desde la terminal:',
        code: `# hola.py
print("¡Hola, Python Friends!")
print("Estoy aprendiendo Python 🚀")

# También puedes usar variables
nombre = "María"
print(f"Hola, {nombre}. Bienvenida al curso.")`,
        result: `¡Hola, Python Friends!
Estoy aprendiendo Python 🚀
Hola, María. Bienvenida al curso.`
      },
      {
        title: 'Usar el REPL interactivo',
        description: 'Python trae una consola interactiva. Escríbela en tu terminal:',
        code: `$ python
Python 3.12.1 (main, Dec  7 2023, 00:00:00)
>>> 2 + 2
4
>>> "Hola" * 3
'HolaHolaHola'
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
...
>>> exit()`,
        result: `>>> 2 + 2
4
>>> "Hola" * 3
'HolaHolaHola'`
      }
    ]
  },
  {
    slug: 'variables',
    title: 'Variables y Tipos de Datos',
    subtitle: 'Los bloques básicos de todo programa',
    description: 'Aprende a almacenar y manipular información: texto, números, booleanos y más.',
    icon: 'FileCode',
    gradient: 'from-purple-400 to-pink-400',
    lesson_label: 'Lección 1',
    order: 1,
    theory: [
      {
        title: '¿Qué son las variables?',
        content: 'Una variable es un nombre que apunta a un valor en memoria. En Python no declaras el tipo: el intérprete lo infiere automáticamente según el valor que le asignas. Para asignar se usa el signo =. El nombre debe ser descriptivo y seguir las convenciones del lenguaje (snake_case para variables y funciones).',
        icon: 'Book'
      },
      {
        title: 'Tipos de datos primitivos',
        content: 'Los tipos básicos son: str (cadenas de texto, entre comillas), int (enteros, sin punto decimal), float (decimales, con punto), bool (True o False, con mayúscula inicial) y None (ausencia de valor). Puedes verificar el tipo con type(valor).',
        icon: 'Cog'
      },
      {
        title: 'Reglas y buenas prácticas',
        content: 'Los nombres deben empezar con letra o guión bajo, pueden contener letras, números y guiones bajos, distinguen mayúsculas/minúsculas y NO pueden ser palabras reservadas (if, for, class, etc.). Usa snake_case, nombres en minúsculas y evita nombres de una sola letra salvo en contadores de bucles.',
        icon: 'Sparkles'
      }
    ],
    examples: [
      {
        title: 'Declarar variables básicas',
        description: 'Python infiere el tipo automáticamente:',
        code: `# Tipos primitivos
nombre = "Ana"           # str
edad = 28                # int
altura = 1.72            # float
es_estudiante = True     # bool
tiene_mascota = None     # NoneType (ausencia de valor)

print(f"{nombre} tiene {edad} años y mide {altura}m")
print(f"¿Estudia? {es_estudiante}")
print(f"¿Tiene mascota? {tiene_mascota}")
print(f"Tipo de 'edad': {type(edad).__name__}")`,
        result: `Ana tiene 28 años y mide 1.72m
¿EsEstudia? True
¿Tiene mascota? None
Tipo de 'edad': int`
      },
      {
        title: 'Conversión entre tipos (casting)',
        description: 'A veces necesitas convertir de un tipo a otro:',
        code: `# De string a número
precio_texto = "99.50"
precio = float(precio_texto)
cantidad = int("5")
print(f"Total: {precio * cantidad}")

# De número a string
edad = 30
mensaje = "Tengo " + str(edad) + " años"
# Mejor con f-strings (forma moderna):
mensaje_moderno = f"Tengo {edad} años"
print(mensaje)
print(mensaje_moderno)

# Convertir a bool
print(bool(0))       # False
print(bool(""))      # False
print(bool("hola"))  # True
print(bool(42))      # True`,
        result: `Total: 497.5
Tengo 30 años
Tengo 30 años
False
False
True
True`
      },
      {
        title: 'Strings: comillas y operaciones',
        description: 'Las cadenas admiten comillas simples, dobles y triples:',
        code: `# Comillas simples y dobles son equivalentes
saludo1 = 'Hola'
saludo2 = "Hola"
print(saludo1 == saludo2)  # True

# Comillas triples para multilínea o docstrings
texto_largo = """Esta es una
cadena de varias
líneas."""
print(texto_largo)

# Concatenación y repetición
print("Py" + "thon")        # Python
print("-" * 20)             # --------------------

# Métodos útiles
frase = "  Hola Mundo  "
print(frase.strip())        # "Hola Mundo"
print(frase.lower())        # "  hola mundo  "
print(frase.upper())        # "  HOLA MUNDO  "
print(frase.replace("Mundo", "Python"))`,
        result: `True
Esta es una
cadena de varias
líneas.
Python
--------------------
Hola Mundo
  hola mundo
  HOLA MUNDO
  Hola Python`
      }
    ]
  },
  {
    slug: 'operadores',
    title: 'Operadores y Expresiones',
    subtitle: 'Aritmética, comparación y lógica',
    description: 'Combina valores con operadores para crear expresiones útiles.',
    icon: 'Calculator',
    gradient: 'from-cyan-400 to-blue-400',
    lesson_label: 'Lección 2',
    order: 2,
    theory: [
      {
        title: 'Operadores aritméticos',
        content: 'Suma (+), resta (-), multiplicación (*), división (/), división entera (//), módulo (%) y potencia (**). Cuidado: en Python 3, la división / siempre devuelve float, aunque los operandos sean enteros.',
        icon: 'Calculator'
      },
      {
        title: 'Operadores de comparación',
        content: 'Devuelven un bool: == (igual), != (distinto), <, >, <=, >=. Sirven para construir condiciones y se usan muchísimo en if y while.',
        icon: 'GitCompare'
      },
      {
        title: 'Operadores lógicos',
        content: 'and (y lógico, ambos True), or (o lógico, al menos uno True), not (negación). Python también evalúa valores en contexto booleano: 0, "", [], None y {} son falsy; el resto es truthy.',
        icon: 'Zap'
      }
    ],
    examples: [
      {
        title: 'Aritmética básica',
        description: 'Las operaciones matemáticas en Python:',
        code: `a = 17
b = 5

print(f"a + b = {a + b}")      # 22
print(f"a - b = {a - b}")      # 12
print(f"a * b = {a * b}")      # 85
print(f"a / b = {a / b}")      # 3.4 (siempre float)
print(f"a // b = {a // b}")    # 3 (división entera)
print(f"a % b = {a % b}")      # 2 (resto)
print(f"a ** b = {a ** b}")    # 1419857 (potencia)

# Precedencia (usar paréntesis si hay duda)
resultado = 2 + 3 * 4          # 14, no 20
resultado2 = (2 + 3) * 4       # 20
print(resultado, resultado2)`,
        result: `a + b = 22
a - b = 12
a * b = 85
a / b = 3.4
a // b = 3
a % b = 2
a ** b = 1419857
14 20`
      },
      {
        title: 'Comparaciones y lógica',
        description: 'Construir condiciones complejas:',
        code: `edad = 20
tiene_licencia = True
es_estudiante = False

# Comparación simple
mayor_edad = edad >= 18
print(f"¿Mayor de edad? {mayor_edad}")

# Combinando con and / or
puede_conducir = edad >= 18 and tiene_licencia
print(f"¿Puede conducir? {puede_conducir}")

# Descuentos
descuento = (edad < 25) or es_estudiante
print(f"¿Tiene descuento? {descuento}")

# Operador ternario
estado = "adulto" if edad >= 18 else "menor"
print(estado)

# Valores truthy / falsy
print(bool(0), bool(""), bool([]), bool(None))  # False False False False
print(bool(1), bool("a"), bool([0]), bool(" "))  # True True True True`,
        result: `¿Mayor de edad? True
¿Puede conducir? True
¿Tiene descuento? True
adulto
False False False False
True True True True`
      }
    ]
  },
  {
    slug: 'condicionales',
    title: 'Condicionales: if, elif, else',
    subtitle: 'Tus programas toman decisiones',
    description: 'Haz que tu código ejecute distintos caminos según condiciones.',
    icon: 'GitBranch',
    gradient: 'from-yellow-400 to-orange-400',
    lesson_label: 'Lección 3',
    order: 3,
    theory: [
      {
        title: 'La estructura if',
        content: 'La sintaxis es if condición: seguido de un bloque indentado. Python NO usa llaves {} para delimitar bloques: la indentación (4 espacios por convención) ES la sintaxis. El bloque se ejecuta solo si la condición es True.',
        icon: 'GitBranch'
      },
      {
        title: 'if / elif / else',
        content: 'elif (contracción de else if) evalúa condiciones adicionales si la anterior fue False. else captura todo lo demás. Puedes tener tantos elif como necesites; se ejecutan en orden y solo entra al primero que sea True.',
        icon: 'ListTree'
      },
      {
        title: 'Pattern matching (Python 3.10+)',
        content: 'match/case es una alternativa más potente a las cadenas de if/elif cuando comparas un valor contra varios patrones. Útil para menús, parseo de comandos y validación de formas.',
        icon: 'Sparkles'
      }
    ],
    examples: [
      {
        title: 'if / elif / else clásico',
        description: 'Un sistema de calificaciones simple:',
        code: `nota = 87

if nota >= 90:
    calificacion = "A"
elif nota >= 80:
    calificacion = "B"
elif nota >= 70:
    calificacion = "C"
elif nota >= 60:
    calificacion = "D"
else:
    calificacion = "F"

print(f"Nota: {nota} → Calificación: {calificacion}")

# Anidado: descuentos por edad y membresía
edad = 25
es_miembro = True
compra = 100

if es_miembro:
    if edad < 18:
        descuento = 0.20
    elif edad >= 65:
        descuento = 0.30
    else:
        descuento = 0.10
else:
    descuento = 0

total = compra * (1 - descuento)
print(f"Descuento: {descuento*100:.0f}% → Total: \\$90.00")`,
        result: `Nota: 87 → Calificación: B
Descuento: 10% → Total: $90.00`
      },
      {
        title: 'match / case (Python 3.10+)',
        description: 'Pattern matching para menús o comandos:',
        code: `comando = "guardar"

match comando:
    case "crear" | "nuevo":
        accion = "Creando nuevo archivo"
    case "guardar":
        accion = "Guardando cambios"
    case "salir" | "exit" | "quit":
        accion = "Cerrando programa"
    case _:
        accion = f"Comando desconocido: {comando}"

print(accion)

# Con patrones más complejos
punto = (0, 5)
match punto:
    case (0, 0):
        lugar = "origen"
    case (0, y):
        lugar = f"eje Y en y={y}"
    case (x, 0):
        lugar = f"eje X en x={x}"
    case (x, y):
        lugar = f"punto ({x}, {y})"

print(lugar)`,
        result: `Guardando cambios
eje Y en y=5`
      }
    ]
  },
  {
    slug: 'bucles',
    title: 'Bucles: for y while',
    subtitle: 'Repetir tareas sin copiar y pegar',
    description: 'Recorre secuencias, repite acciones y rompe el flujo cuando lo necesites.',
    icon: 'Repeat',
    gradient: 'from-pink-400 to-rose-400',
    lesson_label: 'Lección 4',
    order: 4,
    theory: [
      {
        title: 'for: recorrer secuencias',
        content: 'El bucle for itera sobre cualquier iterable (listas, strings, diccionarios, rangos, archivos...). La sintaxis es for variable in secuencia:. range(inicio, fin, paso) genera secuencias numéricas. Es el bucle más usado en Python.',
        icon: 'Repeat'
      },
      {
        title: 'while: repetir mientras se cumpla algo',
        content: 'while condición: ejecuta el bloque mientras la condición sea True. Úsalo cuando no sabes cuántas iteraciones necesitas. Cuidado con los bucles infinitos: asegúrate de que la condición eventualmente sea False.',
        icon: 'Infinity'
      },
      {
        title: 'break, continue, else',
        content: 'break termina el bucle inmediatamente. continue salta a la siguiente iteración. La cláusula else (poco conocida) se ejecuta SOLO si el bucle terminó sin break.',
        icon: 'Cog'
      }
    ],
    examples: [
      {
        title: 'for y range()',
        description: 'Recorrer rangos y colecciones:',
        code: `# range genera: 0, 1, 2, 3, 4
for i in range(5):
    print(f"Iteración {i}")

# range con inicio y fin
for i in range(2, 11, 2):
    print(i, end=" ")  # 2 4 6 8 10
print()

# Recorrer strings
palabra = "Python"
for letra in palabra:
    print(letra, end="-")
print()

# enumerate para tener índice y valor
frutas = ["manzana", "banana", "naranja"]
for indice, fruta in enumerate(frutas, start=1):
    print(f"{indice}. {fruta}")`,
        result: `Iteración 0
Iteración 1
Iteración 2
Iteración 3
Iteración 4
2 4 6 8 10
P-y-t-h-o-n-
1. manzana
2. banana
3. naranja`
      },
      {
        title: 'while con condición',
        description: 'Un menú interactivo que termina con "salir":',
        code: `opcion = ""
intentos = 0

while opcion != "salir" and intentos < 3:
    opcion = input("Escribe 'hola', 'hora' o 'salir': ").lower()
    if opcion == "hola":
        print("¡Hola! ¿Cómo estás?")
    elif opcion == "hora":
        from datetime import datetime
        print(f"Son las {datetime.now().strftime('%H:%M')}")
    elif opcion == "salir":
        print("¡Hasta luego!")
    else:
        print("Opción no válida")
        intentos += 1

# break y continue
print("\\nNúmeros del 1 al 10, saltando el 5:")
for n in range(1, 11):
    if n == 5:
        continue
    if n > 8:
        break
    print(n, end=" ")
print()`,
        result: `Escribe 'hola', 'hora' o 'salir': hola
¡Hola! ¿Cómo estás?
...
Números del 1 al 10, saltando el 5:
1 2 3 4 6 7 8`
      }
    ]
  },
  {
    slug: 'funciones',
    title: 'Funciones',
    subtitle: 'Código reutilizable y bien organizado',
    description: 'Empaqueta lógica en bloques con nombre que puedes llamar una y otra vez.',
    icon: 'FunctionSquare',
    gradient: 'from-orange-400 to-yellow-400',
    lesson_label: 'Lección 5',
    order: 5,
    theory: [
      {
        title: 'Definir y llamar',
        content: 'Una función se define con def nombre(parametros): y un bloque indentado. Si devuelve algo, usa return. Si no tiene return, devuelve None. Las funciones son objetos de primera clase: puedes pasarlas como argumento, guardarlas en variables y devolverlas desde otras funciones.',
        icon: 'FunctionSquare'
      },
      {
        title: 'Parámetros y argumentos',
        content: 'Parámetros posicionales, argumentos por palabra clave (keyword), valores por defecto (default), *args para argumentos posicionales variables y **kwargs para keyword arguments variables. Esto último es lo que verás en muchas librerías.',
        icon: 'Cog'
      },
      {
        title: 'Funciones lambda',
        content: 'Una lambda es una función anónima de una sola línea: lambda x: x * 2. Útil para callbacks cortos, sort, map, filter. Para lógica compleja, prefiere def normal: las lambdas anidadas son ilegibles.',
        icon: 'Sparkles'
      }
    ],
    examples: [
      {
        title: 'Funciones básicas',
        description: 'Definir, llamar y devolver valores:',
        code: `# Definición
def saludar(nombre, saludo="Hola"):
    """Devuelve un saludo personalizado."""
    return f"{saludo}, {nombre}!"

# Llamadas
print(saludar("Ana"))
print(saludar("Carlos", saludo="Buenos días"))
print(saludar("Lucía", "Buenas tardes"))

# Múltiples retornos (tupla)
def estadisticas(numeros):
    return min(numeros), max(numeros), sum(numeros)/len(numeros)

datos = [4, 8, 15, 16, 23, 42]
mini, maxi, media = estadisticas(datos)
print(f"min={mini}, max={maxi}, media={media:.2f}")

# Documentación (docstring)
def area_rectangulo(base, altura):
    """Calcula el área de un rectángulo.
    Args:
        base (float): base en metros.
        altura (float): altura en metros.
    Returns:
        float: área en m².
    """
    return base * altura

print(area_rectangulo(5, 3))`,
        result: `Hola, Ana!
Buenos días, Carlos!
Buenas tardes, Lucía!
min=4, max=42, media=18.00
15`
      },
      {
        title: '*args, **kwargs y lambdas',
        description: 'Funciones flexibles y anónimas:',
        code: `# *args: argumentos posicionales variables (tupla)
def sumar_todo(*numeros):
    return sum(numeros)

print(sumar_todo(1, 2, 3, 4))  # 10

# **kwargs: argumentos por nombre variables (dict)
def crear_perfil(**datos):
    return datos

perfil = crear_perfil(nombre="Ana", edad=30, ciudad="Lima")
print(perfil)

# Combinados
def registrar(evento, *tags, **meta):
    return {"evento": evento, "tags": tags, "meta": meta}

print(registrar("login", "auth", "user", user_id=42, ip="1.2.3.4"))

# Lambdas
cuadrado = lambda x: x ** 2
print(cuadrado(7))

numeros = [3, 1, 4, 1, 5, 9, 2, 6]
ordenados = sorted(numeros, key=lambda x: -x)  # descendente
print(ordenados)`,
        result: `10
{'nombre': 'Ana', 'edad': 30, 'ciudad': 'Lima'}
{'evento': 'login', 'tags': ('auth', 'user'), 'meta': {'user_id': 42, 'ip': '1.2.3.4'}}
49
[9, 6, 5, 4, 3, 2, 1, 1]`
      }
    ]
  },
  {
    slug: 'estructuras-datos',
    title: 'Estructuras de Datos',
    subtitle: 'Listas, tuplas, sets y diccionarios',
    description: 'Colecciones para organizar grandes volúmenes de información.',
    icon: 'Database',
    gradient: 'from-violet-400 to-purple-400',
    lesson_label: 'Lección 6',
    order: 6,
    theory: [
      {
        title: 'Listas: ordenadas y mutables',
        content: 'Las listas [] son colecciones ordenadas y mutables: puedes añadir, eliminar y modificar elementos. Se crean con corchetes o list(). Permiten duplicados y mantienen el orden de inserción. Son la estructura más versátil.',
        icon: 'List'
      },
      {
        title: 'Tuplas: ordenadas e inmutables',
        content: 'Las tuplas () son como listas pero inmutables: una vez creadas no puedes cambiarlas. Se usan para datos que no deben modificarse (coordenadas, días de la semana) y como claves de diccionarios (las listas no pueden). Más rápidas y seguras que las listas.',
        icon: 'Lock'
      },
      {
        title: 'Sets y diccionarios',
        content: 'Los sets {} son colecciones no ordenadas sin duplicados, ideales para pertenencia y operaciones de conjuntos. Los diccionarios {clave: valor} mapean claves únicas a valores: la estructura reina para datos estructurados.',
        icon: 'Hash'
      }
    ],
    examples: [
      {
        title: 'Listas: la estructura más usada',
        description: 'Crear, modificar y manipular listas:',
        code: `frutas = ["manzana", "banana", "naranja"]
frutas.append("uva")           # añadir al final
frutas.insert(1, "pera")       # insertar en posición
print(frutas)                  # ['manzana', 'pera', 'banana', 'naranja', 'uva']

ultima = frutas.pop()          # sacar último
print(f"Sacamos: {ultima}, queda: {frutas}")

# Slicing (rebanadas)
print(frutas[0:2])             # ['manzana', 'pera']
print(frutas[::-1])            # invertido

# Comprensión de listas
numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pares = [n for n in numeros if n % 2 == 0]
cuadrados = [n**2 for n in numeros]
print(f"Pares: {pares}")
print(f"Cuadrados: {cuadrados}")

# Métodos útiles
print(len(frutas))             # 4
print("pera" in frutas)        # True
frutas.sort()
print(frutas)`,
        result: `['manzana', 'pera', 'banana', 'naranja', 'uva']
Sacamos: uva, queda: ['manzana', 'pera', 'banana', 'naranja']
['manzana', 'pera']
['naranja', 'banana', 'pera', 'manzana']
Pares: [2, 4, 6, 8, 10]
Cuadrados: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
4
True
['banana', 'manzana', 'naranja', 'pera']`
      },
      {
        title: 'Diccionarios: clave-valor',
        description: 'La estructura más importante después de las listas:',
        code: `usuario = {
    "nombre": "Ana",
    "edad": 30,
    "email": "ana@example.com",
    "activo": True,
    "skills": ["Python", "SQL", "React"]
}

# Acceder y modificar
print(usuario["nombre"])
print(usuario.get("telefono", "no especificado"))  # default seguro

usuario["edad"] = 31
usuario["ciudad"] = "Lima"     # añadir

# Iterar
for clave, valor in usuario.items():
    print(f"{clave}: {valor}")

# Diccionarios anidados
empresa = {
    "tech": {"Ana": 30, "Luis": 25},
    "ventas": {"Sofía": 28}
}
print(empresa["tech"]["Ana"])

# Comprehensions
nombres = ["ana", "luis", "sofía"]
longitudes = {n: len(n) for n in nombres}
print(longitudes)  # {'ana': 3, 'luis': 4, 'sofía': 5}`,
        result: `Ana
no especificado
nombre: Ana
edad: 31
email: ana@example.com
activo: True
skills: ['Python', 'SQL', 'React']
ciudad: Lima
30
{'ana': 3, 'luis': 4, 'sofía': 5}`
      },
      {
        title: 'Sets: sin duplicados',
        description: 'Cuando no quieres repetir elementos:',
        code: `# Eliminar duplicados de una lista
numeros = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unicos = set(numeros)
print(unicos)  # {1, 2, 3, 4}

# Operaciones de conjuntos
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(f"Unión: {a | b}")           # {1, 2, 3, 4, 5, 6}
print(f"Intersección: {a & b}")    # {3, 4}
print(f"Diferencia: {a - b}")      # {1, 2}
print(f"Simétrica: {a ^ b}")       # {1, 2, 5, 6}

# Pertenencia rápida
invitados = {"Ana", "Luis", "Sofía"}
print("¿Carlos está invitado?", "Carlos" in invitados)
print("¿Ana está invitada?", "Ana" in invitados)`,
        result: `{1, 2, 3, 4}
Unión: {1, 2, 3, 4, 5, 6}
Intersección: {3, 4}
Diferencia: {1, 2}
Simétrica: {1, 2, 5, 6}
¿Carlos está invitado? False
¿Ana está invitada? True`
      }
    ]
  },
  {
    slug: 'poo',
    title: 'Programación Orientada a Objetos',
    subtitle: 'Modela el mundo con clases y objetos',
    description: 'Encapsula datos y comportamiento en clases reutilizables.',
    icon: 'Box',
    gradient: 'from-indigo-400 to-blue-400',
    lesson_label: 'Lección 7',
    order: 7,
    theory: [
      {
        title: 'Clases y objetos',
        content: 'Una clase es un plano (blueprint) para crear objetos. Define atributos (datos) y métodos (funciones). Un objeto es una instancia concreta de la clase. En Python todo es un objeto: las clases también.',
        icon: 'Box'
      },
      {
        title: 'Herencia y polimorfismo',
        content: 'La herencia permite crear clases hijas que reutilizan y extienden una clase padre. El polimorfismo permite que clases distintas respondan al mismo método de forma diferente. Usa super() para llamar al constructor o métodos de la clase padre.',
        icon: 'GitFork'
      },
      {
        title: 'Métodos mágicos (dunder)',
        content: 'Los métodos con doble guión bajo (__init__, __str__, __repr__, __len__, __eq__) personalizan cómo se comporta tu clase con operadores y funciones built-in. Son la razón por la que puedes hacer len(obj) o obj == otro en clases bien diseñadas.',
        icon: 'Sparkles'
      }
    ],
    examples: [
      {
        title: 'Clase básica',
        description: 'Crear una clase, instanciarla y usar métodos:',
        code: `class Perro:
    # Atributo de clase (compartido)
    especie = "Canis familiaris"

    # Constructor
    def __init__(self, nombre, edad, raza="Mestizo"):
        self.nombre = nombre
        self.edad = edad
        self.raza = raza

    # Método de instancia
    def ladrar(self):
        return f"¡Guau! Soy {self.nombre}"

    def descripcion(self):
        return f"{self.nombre} ({self.raza}, {self.edad} años)"

    # Método estático (no usa self ni cls)
    @staticmethod
    def sonido():
        return "Guau guau"

# Instanciar
mi_perro = Perro("Firulais", 5, "Labrador")
print(mi_perro.descripcion())
print(mi_perro.ladrar())
print(f"Especie: {Perro.especie}")
print(Perro.sonido())`,
        result: `Firulais (Labrador, 5 años)
¡Guau! Soy Firulais
Especie: Canis familiaris
Guau guau`
      },
      {
        title: 'Herencia y métodos mágicos',
        description: 'Reutilizar código y personalizar el comportamiento:',
        code: `class Animal:
    def __init__(self, nombre, sonido):
        self.nombre = nombre
        self.sonido = sonido

    def hablar(self):
        return f"{self.nombre} dice {self.sonido}"

    def __str__(self):
        return f"{self.__class__.__name__}({self.nombre})"

    def __repr__(self):
        return self.__str__()

    def __eq__(self, otro):
        return isinstance(otro, Animal) and self.nombre == otro.nombre

class Gato(Animal):
    def __init__(self, nombre, raza):
        super().__init__(nombre, "Miau")
        self.raza = raza

    # Polimorfismo: sobrescribimos hablar
    def hablar(self):
        return f"🐱 {self.nombre} ronronea: {self.sonido}"

# Uso
gato = Gato("Mishi", "Siamés")
perro = Animal("Firulais", "Guau")
print(gato.hablar())
print(perro.hablar())
print(str(gato))         # __str__
print(gato == Animal("Mishi", "..."))  # __eq__ → True`,
        result: `🐱 Mishi ronronea: Miau
Firulais dice Guau
Gato(Mishi)
True`
      }
    ]
  },
  {
    slug: 'modulos',
    title: 'Módulos, Paquetes y Entornos Virtuales',
    subtitle: 'Organiza tu proyecto y reutiliza código',
    description: 'Aprende a estructurar proyectos grandes y usar librerías de terceros.',
    icon: 'Package',
    gradient: 'from-teal-400 to-green-400',
    lesson_label: 'Lección 8',
    order: 8,
    theory: [
      {
        title: 'Módulos y paquetes',
        content: 'Un módulo es cualquier archivo .py. Un paquete es una carpeta con un __init__.py que agrupa módulos relacionados. Puedes importar con import, from ... import, y usar as para alias. El estándar de Python tiene cientos de módulos (math, os, json, datetime, random, collections…).',
        icon: 'Package'
      },
      {
        title: 'pip y entornos virtuales',
        content: 'pip instala paquetes de PyPI (el repositorio de Python). Un entorno virtual aísla dependencias por proyecto: venv (built-in) o virtualenv. NUNCA instales paquetes globalmente: cada proyecto debe tener su propio venv.',
        icon: 'Layers'
      },
      {
        title: 'requirements.txt y pyproject.toml',
        content: 'requirements.txt lista dependencias para reproducir el entorno (pip install -r requirements.txt). El formato moderno es pyproject.toml (estándar PEP 621) usado por Poetry, Hatch, pdm, uv. Para proyectos nuevos se recomienda pyproject.toml.',
        icon: 'FileText'
      }
    ],
    examples: [
      {
        title: 'Importar y usar módulos estándar',
        description: 'La librería estándar de Python es enorme:',
        code: `import math
import random
import json
from datetime import datetime, timedelta
from collections import Counter

# math
print(f"π = {math.pi:.4f}")
print(f"√144 = {math.sqrt(144)}")
print(f"factorial(5) = {math.factorial(5)}")

# random
numeros = [random.randint(1, 100) for _ in range(5)]
print(f"Aleatorios: {numeros}")
print(f"Elijo uno: {random.choice(['🍎', '🍌', '🍇'])}")

# json
datos = {"nombre": "Ana", "edad": 30, "skills": ["Python", "SQL"]}
json_str = json.dumps(datos, indent=2, ensure_ascii=False)
print(json_str)
recuperado = json.loads(json_str)
print(f"Tipo: {type(recuperado).__name__}")

# datetime
ahora = datetime.now()
futuro = ahora + timedelta(days=7)
print(f"Ahora: {ahora:%Y-%m-%d %H:%M}")
print(f"En 7 días: {futuro:%Y-%m-%d}")

# Counter
palabras = ["python", "es", "genial", "python", "rocks", "es"]
conteo = Counter(palabras)
print(f"Top 2: {conteo.most_common(2)}")`,
        result: `π = 3.1416
√144 = 12.0
factorial(5) = 120
Aleatorios: [42, 87, 13, 95, 28]
Elijo uno: 🍎
{
  "nombre": "Ana",
  "edad": 30,
  "skills": ["Python", "SQL"]
}
Tipo: dict
Ahora: 2024-12-15 14:30
En 7 días: 2024-12-22
Top 2: [('python', 2), ('es', 2)]`
      },
      {
        title: 'Crear y usar un módulo propio',
        description: 'Estructura un proyecto con tus propios módulos:',
        code: `# Archivo: mi_proyecto/operaciones.py
"""
Módulo de operaciones matemáticas.
"""
PI = 3.14159

def sumar(*nums):
    return sum(nums)

def area_circulo(radio):
    return PI * radio ** 2

class Calculadora:
    def __init__(self, inicial=0):
        self.valor = inicial

    def sumar(self, n):
        self.valor += n
        return self

    def resultado(self):
        return self.valor


# Archivo: mi_proyecto/main.py
# from operaciones import sumar, area_circulo, Calculadora

# Si lo ejecutas directamente (no como import)
# if __name__ == "__main__":
#     print(sumar(1, 2, 3, 4))           # 10
#     print(f"Área: {area_circulo(5):.2f}")  # 78.54
#     calc = Calculadora(10).sumar(5).sumar(3)
#     print(calc.resultado())            # 18`,
        result: `# Salida esperada al ejecutar main.py:
10
Área: 78.54
18`
      }
    ]
  },
  {
    slug: 'errores',
    title: 'Manejo de Errores y Excepciones',
    subtitle: 'Programas robustos que no se rompen',
    description: 'Anticípate a los fallos y manéjalos con elegancia.',
    icon: 'ShieldAlert',
    gradient: 'from-red-400 to-pink-400',
    lesson_label: 'Lección 9',
    order: 9,
    theory: [
      {
        title: '¿Qué es una excepción?',
        content: 'Una excepción es un evento que interrumpe el flujo normal del programa. En Python casi todo error en tiempo de ejecución es una excepción (ValueError, TypeError, KeyError, FileNotFoundError, etc.). Si no la manejas, el programa termina y muestra un traceback.',
        icon: 'ShieldAlert'
      },
      {
        title: 'try / except / finally',
        content: 'Envuelve el código riesgoso en try. Si ocurre una excepción, except la captura (puedes capturar tipos específicos). finally se ejecuta SIEMPRE, haya error o no (útil para cerrar archivos o conexiones). else se ejecuta solo si NO hubo error.',
        icon: 'Cog'
      },
      {
        title: 'Levantar tus propias excepciones',
        content: 'Usa raise para lanzar excepciones cuando algo no cumple una condición esperada. Crea excepciones personalizadas heredando de Exception. Esto es mejor que devolver None o False para errores: comunica el problema claramente.',
        icon: 'Sparkles'
      }
    ],
    examples: [
      {
        title: 'try / except básico',
        description: 'Manejo robusto de entradas del usuario:',
        code: `def dividir(a, b):
    if b == 0:
        raise ValueError("No se puede dividir entre cero")
    return a / b

# Forma segura de pedir números al usuario
def pedir_numero(mensaje):
    while True:
        try:
            return float(input(mensaje))
        except ValueError:
            print("⚠️ Eso no es un número válido. Intenta de nuevo.")

# Manejo múltiple
try:
    archivo = open("datos.txt", "r")
    contenido = archivo.read()
except FileNotFoundError:
    print("❌ El archivo no existe")
except PermissionError:
    print("❌ No tienes permisos para leerlo")
except Exception as e:
    print(f"❌ Error inesperado: {e}")
else:
    print(f"✅ Leído: {contenido[:50]}...")
finally:
    try:
        archivo.close()
        print("Archivo cerrado")
    except NameError:
        pass  # el archivo nunca se abrió

# División segura
try:
    resultado = dividir(10, 0)
except ValueError as e:
    print(f"Error: {e}")
else:
    print(f"Resultado: {resultado}")`,
        result: `❌ El archivo no existe
Error: No se puede dividir entre cero`
      },
      {
        title: 'Excepciones personalizadas',
        description: 'Crea tu propia jerarquía de errores:',
        code: `class SaldoInsuficienteError(Exception):
    """Se lanza cuando no hay saldo para una operación."""
    def __init__(self, saldo, monto):
        self.saldo = saldo
        self.monto = monto
        super().__init__(
            f"Saldo ${'${saldo}'} insuficiente para retirar ${'${monto}'}"
        )

class CuentaBancaria:
    def __init__(self, titular, saldo=0):
        if saldo < 0:
            raise ValueError("El saldo inicial no puede ser negativo")
        self.titular = titular
        self.saldo = saldo

    def depositar(self, monto):
        if monto <= 0:
            raise ValueError("El monto debe ser positivo")
        self.saldo += monto

    def retirar(self, monto):
        if monto <= 0:
            raise ValueError("El monto debe ser positivo")
        if monto > self.saldo:
            raise SaldoInsuficienteError(self.saldo, monto)
        self.saldo -= monto

# Uso
cuenta = CuentaBancaria("Ana", 1000)
cuenta.depositar(500)

try:
    cuenta.retirar(2000)
except SaldoInsuficienteError as e:
    print(f"❌ {e}")
            print(f"   Saldo actual: ${'${e.saldo}'}")
else:
                print(f"✅ Retiro exitoso. Saldo: ${'${cuenta.saldo}'}")`,
        result: `❌ Saldo $1500 insuficiente para retirar $2000
   Saldo actual: $1500`
      }
    ]
  }
];

async function init() {
  console.log('⏳ Conectando a Neon...');
  await sql`SELECT 1`;
  console.log('✅ Conectado');

  console.log('⏳ Creando esquema...');
  for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await sql(stmt);
  }
  console.log('✅ Esquema listo');

  console.log('⏳ Sembrando admin...');
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await sql`
      INSERT INTO users (email, password, role)
      VALUES (${ADMIN_EMAIL}, ${hash}, 'admin')
      ON CONFLICT (email) DO NOTHING
    `;
  console.log(`✅ Admin: ${ADMIN_EMAIL}`);

  console.log('⏳ Sembrando contenido del curso...');
  for (const s of SEED_SECTIONS) {
    const existing = await sql`SELECT id FROM sections WHERE slug = ${s.slug}`;

    let sectionId;
    if (existing?.length > 0) {
      sectionId = existing[0].id;
      console.log(`   ↻ Sección "${s.title}" ya existe, actualizando...`);
await sql`
          UPDATE sections
          SET title = ${s.title}, subtitle = ${s.subtitle}, description = ${s.description},
              icon = ${s.icon}, gradient = ${s.gradient}, lesson_label = ${s.lesson_label},
              order_index = ${s.order}, published = TRUE, updated_at = NOW()
          WHERE id = ${sectionId}`;
      await sql`DELETE FROM theory_cards WHERE section_id = ${sectionId}`;
      await sql`DELETE FROM examples WHERE section_id = ${sectionId}`;
    } else {
const result = await sql`
          INSERT INTO sections (slug, title, subtitle, description, icon, gradient, lesson_label, order_index)
          VALUES (${s.slug}, ${s.title}, ${s.subtitle}, ${s.description}, ${s.icon}, ${s.gradient}, ${s.lesson_label}, ${s.order})
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            gradient = EXCLUDED.gradient,
            lesson_label = EXCLUDED.lesson_label,
            order_index = EXCLUDED.order_index,
            updated_at = NOW()
          RETURNING id`;
        sectionId = result[0].id;
        console.log(`   ✓ Sección "${s.title}"`);
    }

    if (s.theory?.length) { for (let i = 0; i < s.theory.length; i++) {
      const t = s.theory[i];
await sql`
           INSERT INTO theory_cards (section_id, title, content, icon, order_index)
           VALUES (${sectionId}, ${t.title}, ${t.content}, ${t.icon}, ${i})`;
    }
    }
if (s.examples?.length) { for (let i = 0; i < s.examples.length; i++) {
      const e = s.examples[i];
       await sql`INSERT INTO examples (section_id, title, description, code, result, order_index)
         VALUES (${sectionId}, ${e.title}, ${e.description}, ${e.code}, ${e.result}, ${i})`;
     }
   }
   }

  console.log('\\n🎉 Inicialización completa');
  console.log(`\\n📝 Credenciales admin:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  process.exit(0);
}

init().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
