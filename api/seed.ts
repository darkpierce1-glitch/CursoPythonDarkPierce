/**
 * POST/GET /api/seed
 * Crea las tablas e inserta el contenido inicial.
 * Idempotente: se puede llamar múltiples veces sin duplicar datos.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

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

const SEED_SECTIONS = [
  {
    slug: 'instalacion', title: 'Instalación y Configuración', subtitle: 'Tu primer paso con Python',
    description: 'Aprende a instalar Python en Windows, macOS y Linux. Configura tu editor de código y escribe tu primer programa.',
    icon: 'Download', gradient: 'from-emerald-400 to-cyan-400', lesson_label: 'Lección 0', order: 0,
    theory: [
      { title: '¿Qué es Python?', content: 'Python es un lenguaje de programación de alto nivel, interpretado y de propósito general. Creado por Guido van Rossum en 1991. Se usa en desarrollo web, ciencia de datos, IA y automatización.', icon: 'Book' },
      { title: '¿Por qué aprender Python?', content: 'Curva de aprendizaje suave, comunidad enorme y alta demanda laboral. Google, Netflix, Instagram, Spotify y NASA lo usan. Es el lenguaje #1 en ciencia de datos.', icon: 'Sparkles' },
      { title: 'Descargar e instalar', content: 'Visita python.org/downloads y descarga la versión 3.12+. En Windows marca "Add Python to PATH". En macOS usa el instalador o Homebrew. En Linux instálalo con apt, dnf o pacman.', icon: 'Download' },
    ],
    examples: [
      { title: 'Verificar instalación', description: 'Abre la terminal y ejecuta:', code: 'python --version\n# o\npython3 --version', result: 'Python 3.12.1' },
      { title: 'Hola Mundo', description: 'Crea hola.py y ejecútalo:', code: 'print("¡Hola, Python Friends!")\nnombre = "María"\nprint(f"Hola, {nombre}. Bienvenida al curso.")', result: '¡Hola, Python Friends!\nHola, María. Bienvenida al curso.' },
    ],
  },
  {
    slug: 'variables', title: 'Variables y Tipos de Datos', subtitle: 'Los bloques básicos de todo programa',
    description: 'Aprende a almacenar y manipular información: texto, números, booleanos y más.',
    icon: 'FileCode', gradient: 'from-purple-400 to-pink-400', lesson_label: 'Lección 1', order: 1,
    theory: [
      { title: '¿Qué son las variables?', content: 'Una variable es un nombre que apunta a un valor en memoria. En Python no declaras el tipo: el intérprete lo infiere automáticamente. Para asignar se usa =. Usa snake_case por convención.', icon: 'Book' },
      { title: 'Tipos de datos primitivos', content: 'Los tipos básicos son: str (texto), int (enteros), float (decimales), bool (True/False) y None (ausencia de valor). Verifica el tipo con type(valor).', icon: 'Cog' },
      { title: 'Reglas y buenas prácticas', content: 'Los nombres deben empezar con letra o guión bajo, no pueden ser palabras reservadas y distinguen mayúsculas/minúsculas. Usa snake_case y nombres descriptivos.', icon: 'Sparkles' },
    ],
    examples: [
      { title: 'Declarar variables', description: 'Python infiere el tipo:', code: 'nombre = "Ana"\nedad = 28\naltura = 1.72\nes_estudiante = True\nprint(f"{nombre} tiene {edad} años")\nprint(type(edad).__name__)', result: 'Ana tiene 28 años\nint' },
      { title: 'Casting', description: 'Convertir entre tipos:', code: 'precio = float("99.50")\ncantidad = int("5")\nprint(precio * cantidad)\nprint(bool(0), bool("hola"))', result: '497.5\nFalse True' },
    ],
  },
  {
    slug: 'operadores', title: 'Operadores y Expresiones', subtitle: 'Aritmética, comparación y lógica',
    description: 'Combina valores con operadores para crear expresiones útiles.',
    icon: 'Calculator', gradient: 'from-cyan-400 to-blue-400', lesson_label: 'Lección 2', order: 2,
    theory: [
      { title: 'Operadores aritméticos', content: 'Suma (+), resta (-), multiplicación (*), división (/), división entera (//), módulo (%) y potencia (**). La división / siempre devuelve float en Python 3.', icon: 'Calculator' },
      { title: 'Operadores de comparación', content: 'Devuelven bool: == (igual), != (distinto), <, >, <=, >=. Se usan en condiciones if y while.', icon: 'GitCompare' },
      { title: 'Operadores lógicos', content: 'and (ambos True), or (al menos uno True), not (negación). Valores falsy: 0, "", [], None, {}. El resto es truthy.', icon: 'Zap' },
    ],
    examples: [
      { title: 'Aritmética', description: 'Operaciones matemáticas:', code: 'a, b = 17, 5\nprint(a + b, a - b, a * b)\nprint(a / b, a // b, a % b, a ** b)', result: '22 12 85\n3.4 3 2 1419857' },
      { title: 'Comparaciones y lógica', description: 'Condiciones combinadas:', code: 'edad = 20\ntiene_licencia = True\nprint(edad >= 18)\nprint(edad >= 18 and tiene_licencia)\nestado = "adulto" if edad >= 18 else "menor"\nprint(estado)', result: 'True\nTrue\nadulto' },
    ],
  },
  {
    slug: 'condicionales', title: 'Condicionales: if, elif, else', subtitle: 'Tus programas toman decisiones',
    description: 'Haz que tu código ejecute distintos caminos según condiciones.',
    icon: 'GitBranch', gradient: 'from-yellow-400 to-orange-400', lesson_label: 'Lección 3', order: 3,
    theory: [
      { title: 'La estructura if', content: 'Sintaxis: if condición: seguido de bloque indentado. Python usa indentación (4 espacios) en lugar de llaves {}. El bloque se ejecuta solo si la condición es True.', icon: 'GitBranch' },
      { title: 'if / elif / else', content: 'elif evalúa condiciones adicionales si la anterior fue False. else captura todo lo demás. Se ejecutan en orden y solo entra al primero que sea True.', icon: 'ListTree' },
      { title: 'Pattern matching (Python 3.10+)', content: 'match/case es más potente que if/elif para comparar un valor contra múltiples patrones. Útil para menús y parseo de comandos.', icon: 'Sparkles' },
    ],
    examples: [
      { title: 'if / elif / else', description: 'Sistema de calificaciones:', code: 'nota = 87\nif nota >= 90:\n    cal = "A"\nelif nota >= 80:\n    cal = "B"\nelif nota >= 70:\n    cal = "C"\nelse:\n    cal = "F"\nprint(f"Nota {nota} → {cal}")', result: 'Nota 87 → B' },
      { title: 'match / case', description: 'Pattern matching:', code: 'comando = "guardar"\nmatch comando:\n    case "crear":\n        print("Creando")\n    case "guardar":\n        print("Guardando")\n    case _:\n        print("Desconocido")', result: 'Guardando' },
    ],
  },
  {
    slug: 'bucles', title: 'Bucles: for y while', subtitle: 'Repetir tareas sin copiar y pegar',
    description: 'Recorre secuencias, repite acciones y rompe el flujo cuando lo necesites.',
    icon: 'Repeat', gradient: 'from-pink-400 to-rose-400', lesson_label: 'Lección 4', order: 4,
    theory: [
      { title: 'for: recorrer secuencias', content: 'for itera sobre cualquier iterable (listas, strings, rangos...). range(inicio, fin, paso) genera secuencias numéricas. Es el bucle más usado en Python.', icon: 'Repeat' },
      { title: 'while: repetir mientras sea True', content: 'while condición: ejecuta el bloque mientras sea True. Úsalo cuando no sabes cuántas iteraciones necesitas. Asegúrate de que la condición eventualmente sea False.', icon: 'Infinity' },
      { title: 'break, continue, else', content: 'break termina el bucle. continue salta a la siguiente iteración. else se ejecuta SOLO si el bucle terminó sin break.', icon: 'Cog' },
    ],
    examples: [
      { title: 'for y range()', description: 'Recorrer rangos:', code: 'for i in range(5):\n    print(i, end=" ")\nprint()\nfrutas = ["manzana", "banana", "naranja"]\nfor i, f in enumerate(frutas, 1):\n    print(f"{i}. {f}")', result: '0 1 2 3 4\n1. manzana\n2. banana\n3. naranja' },
      { title: 'break y continue', description: 'Control de flujo:', code: 'for n in range(1, 11):\n    if n == 5:\n        continue\n    if n > 8:\n        break\n    print(n, end=" ")', result: '1 2 3 4 6 7 8' },
    ],
  },
  {
    slug: 'funciones', title: 'Funciones', subtitle: 'Código reutilizable y bien organizado',
    description: 'Empaqueta lógica en bloques con nombre que puedes llamar una y otra vez.',
    icon: 'FunctionSquare', gradient: 'from-orange-400 to-yellow-400', lesson_label: 'Lección 5', order: 5,
    theory: [
      { title: 'Definir y llamar', content: 'Se define con def nombre(params): y un bloque indentado. return devuelve un valor. Sin return devuelve None. Las funciones son objetos de primera clase en Python.', icon: 'FunctionSquare' },
      { title: 'Parámetros y argumentos', content: 'Posicionales, por keyword, con valores por defecto, *args (posicionales variables) y **kwargs (keyword variables). Lo verás en casi todas las librerías.', icon: 'Cog' },
      { title: 'Funciones lambda', content: 'Función anónima de una línea: lambda x: x * 2. Útil para sort, map, filter. Para lógica compleja usa def normal.', icon: 'Sparkles' },
    ],
    examples: [
      { title: 'Funciones básicas', description: 'Definir y llamar:', code: 'def saludar(nombre, saludo="Hola"):\n    return f"{saludo}, {nombre}!"\n\nprint(saludar("Ana"))\nprint(saludar("Carlos", saludo="Buenos días"))', result: 'Hola, Ana!\nBuenos días, Carlos!' },
      { title: '*args y **kwargs', description: 'Argumentos variables:', code: 'def sumar(*nums):\n    return sum(nums)\n\ndef perfil(**datos):\n    return datos\n\nprint(sumar(1, 2, 3, 4))\nprint(perfil(nombre="Ana", edad=30))', result: '10\n{\'nombre\': \'Ana\', \'edad\': 30}' },
    ],
  },
  {
    slug: 'estructuras-datos', title: 'Estructuras de Datos', subtitle: 'Listas, tuplas, sets y diccionarios',
    description: 'Colecciones para organizar grandes volúmenes de información.',
    icon: 'Database', gradient: 'from-violet-400 to-purple-400', lesson_label: 'Lección 6', order: 6,
    theory: [
      { title: 'Listas: ordenadas y mutables', content: 'Las listas [] son colecciones ordenadas y mutables. Permiten duplicados y mantienen orden de inserción. Métodos clave: append, insert, pop, sort, reverse.', icon: 'List' },
      { title: 'Tuplas: ordenadas e inmutables', content: 'Las tuplas () son inmutables: no se pueden modificar. Más rápidas que las listas. Se usan para datos fijos y como claves de diccionarios.', icon: 'Lock' },
      { title: 'Sets y diccionarios', content: 'Sets {} son colecciones sin duplicados, ideales para pertenencia. Diccionarios {clave: valor} mapean claves únicas a valores: la estructura más importante para datos estructurados.', icon: 'Hash' },
    ],
    examples: [
      { title: 'Listas', description: 'Crear y manipular:', code: 'frutas = ["manzana", "banana"]\nfrutas.append("naranja")\nprint(frutas)\npares = [n for n in range(10) if n % 2 == 0]\nprint(pares)', result: "['manzana', 'banana', 'naranja']\n[0, 2, 4, 6, 8]" },
      { title: 'Diccionarios', description: 'Clave-valor:', code: 'usuario = {"nombre": "Ana", "edad": 30}\nusuario["ciudad"] = "Lima"\nfor k, v in usuario.items():\n    print(f"{k}: {v}")', result: 'nombre: Ana\nedad: 30\nciudad: Lima' },
    ],
  },
  {
    slug: 'poo', title: 'Programación Orientada a Objetos', subtitle: 'Modela el mundo con clases y objetos',
    description: 'Encapsula datos y comportamiento en clases reutilizables.',
    icon: 'Box', gradient: 'from-indigo-400 to-blue-400', lesson_label: 'Lección 7', order: 7,
    theory: [
      { title: 'Clases y objetos', content: 'Una clase es un plano para crear objetos. Define atributos (datos) y métodos (funciones). Un objeto es una instancia concreta. En Python todo es un objeto.', icon: 'Box' },
      { title: 'Herencia y polimorfismo', content: 'Herencia: clases hijas reutilizan y extienden la clase padre. Polimorfismo: clases distintas responden al mismo método de forma diferente. Usa super() para llamar al padre.', icon: 'GitFork' },
      { title: 'Métodos mágicos (dunder)', content: '__init__, __str__, __repr__, __eq__ personalizan el comportamiento con operadores y funciones built-in. Son la razón por la que puedes hacer len(obj) o obj == otro.', icon: 'Sparkles' },
    ],
    examples: [
      { title: 'Clase básica', description: 'Crear e instanciar:', code: 'class Perro:\n    def __init__(self, nombre, raza):\n        self.nombre = nombre\n        self.raza = raza\n    def ladrar(self):\n        return f"¡Guau! Soy {self.nombre}"\n\nperro = Perro("Firulais", "Labrador")\nprint(perro.ladrar())', result: '¡Guau! Soy Firulais' },
      { title: 'Herencia', description: 'Extender una clase:', code: 'class Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def hablar(self):\n        return "..."\n\nclass Gato(Animal):\n    def hablar(self):\n        return f"{self.nombre} dice Miau"\n\nprint(Gato("Mishi").hablar())', result: 'Mishi dice Miau' },
    ],
  },
  {
    slug: 'modulos', title: 'Módulos y Entornos Virtuales', subtitle: 'Organiza tu proyecto y reutiliza código',
    description: 'Aprende a estructurar proyectos grandes y usar librerías de terceros.',
    icon: 'Package', gradient: 'from-teal-400 to-green-400', lesson_label: 'Lección 8', order: 8,
    theory: [
      { title: 'Módulos y paquetes', content: 'Un módulo es cualquier archivo .py. Un paquete es una carpeta con __init__.py. Importa con import, from ... import, y alias con as. La librería estándar tiene cientos de módulos.', icon: 'Package' },
      { title: 'pip y entornos virtuales', content: 'pip instala paquetes de PyPI. Un entorno virtual aísla dependencias por proyecto con venv. Nunca instales paquetes globalmente.', icon: 'Layers' },
      { title: 'requirements.txt', content: 'Lista dependencias para reproducir el entorno: pip install -r requirements.txt. El formato moderno es pyproject.toml (PEP 621).', icon: 'FileText' },
    ],
    examples: [
      { title: 'Módulos estándar', description: 'Librería estándar:', code: 'import math\nimport random\nfrom datetime import datetime\n\nprint(f"π = {math.pi:.4f}")\nprint(random.randint(1, 100))\nprint(datetime.now().strftime("%Y-%m-%d"))', result: 'π = 3.1416\n42\n2024-12-15' },
      { title: 'Módulo propio', description: 'Crear y usar módulos:', code: '# operaciones.py\ndef sumar(*nums):\n    return sum(nums)\n\ndef area_circulo(radio):\n    return 3.14159 * radio ** 2\n\n# main.py\n# from operaciones import sumar, area_circulo\n# print(sumar(1,2,3))      # 6\n# print(area_circulo(5))   # 78.54', result: '6\n78.54' },
    ],
  },
  {
    slug: 'errores', title: 'Manejo de Errores y Excepciones', subtitle: 'Programas robustos que no se rompen',
    description: 'Anticípate a los fallos y manéjalos con elegancia.',
    icon: 'ShieldAlert', gradient: 'from-red-400 to-pink-400', lesson_label: 'Lección 9', order: 9,
    theory: [
      { title: '¿Qué es una excepción?', content: 'Una excepción interrumpe el flujo normal. Casi todo error en tiempo de ejecución es una excepción (ValueError, TypeError, KeyError...). Sin manejo, el programa termina con traceback.', icon: 'ShieldAlert' },
      { title: 'try / except / finally', content: 'try envuelve código riesgoso. except captura excepciones (puedes capturar tipos específicos). finally se ejecuta SIEMPRE. else solo si NO hubo error.', icon: 'Cog' },
      { title: 'Excepciones propias', content: 'Usa raise para lanzar excepciones cuando algo no cumple una condición. Crea excepciones heredando de Exception para comunicar errores claramente.', icon: 'Sparkles' },
    ],
    examples: [
      { title: 'try / except', description: 'Manejo básico:', code: 'def dividir(a, b):\n    if b == 0:\n        raise ValueError("No se puede dividir entre cero")\n    return a / b\n\ntry:\n    print(dividir(10, 2))\n    print(dividir(10, 0))\nexcept ValueError as e:\n    print(f"Error: {e}")', result: '5.0\nError: No se puede dividir entre cero' },
      { title: 'Excepción personalizada', description: 'Tu propia jerarquía:', code: 'class SaldoInsuficiente(Exception):\n    pass\n\ndef retirar(saldo, monto):\n    if monto > saldo:\n        raise SaldoInsuficiente(f"Saldo {saldo} < {monto}")\n    return saldo - monto\n\ntry:\n    retirar(100, 200)\nexcept SaldoInsuficiente as e:\n    print(f"❌ {e}")', result: '❌ Saldo 100 < 200' },
    ],
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL no configurada' });
  }

  const sql = neon(DATABASE_URL);
  const log: string[] = [];

  try {
    // Crear tablas
    for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
      await sql(stmt);
    }
    log.push('✅ Esquema creado');

    // Admin
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await sql(
      `INSERT INTO users (email, password, role) VALUES ($1, $2, 'admin') ON CONFLICT (email) DO NOTHING`,
      [ADMIN_EMAIL, hash]
    );
    log.push(`✅ Admin: ${ADMIN_EMAIL}`);

    // Secciones
    for (const s of SEED_SECTIONS) {
      const existing = await sql(`SELECT id FROM sections WHERE slug = $1`, [s.slug]);
      const rows = Array.isArray(existing) ? existing : (existing as any).rows ?? [];

      let sectionId: number;

      if (rows.length > 0) {
        sectionId = rows[0].id;
        await sql(
          `UPDATE sections SET title=$1, subtitle=$2, description=$3, icon=$4, gradient=$5,
           lesson_label=$6, order_index=$7, published=TRUE, updated_at=NOW() WHERE id=$8`,
          [s.title, s.subtitle, s.description, s.icon, s.gradient, s.lesson_label, s.order, sectionId]
        );
        await sql(`DELETE FROM theory_cards WHERE section_id=$1`, [sectionId]);
        await sql(`DELETE FROM examples WHERE section_id=$1`, [sectionId]);
      } else {
        const result = await sql(
          `INSERT INTO sections (slug,title,subtitle,description,icon,gradient,lesson_label,order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [s.slug, s.title, s.subtitle, s.description, s.icon, s.gradient, s.lesson_label, s.order]
        );
        const inserted = Array.isArray(result) ? result : (result as any).rows ?? [];
        sectionId = inserted[0].id;
      }

      for (let i = 0; i < s.theory.length; i++) {
        const t = s.theory[i];
        await sql(
          `INSERT INTO theory_cards (section_id,title,content,icon,order_index) VALUES ($1,$2,$3,$4,$5)`,
          [sectionId, t.title, t.content, t.icon, i]
        );
      }
      for (let i = 0; i < s.examples.length; i++) {
        const e = s.examples[i];
        await sql(
          `INSERT INTO examples (section_id,title,description,code,result,order_index) VALUES ($1,$2,$3,$4,$5,$6)`,
          [sectionId, e.title, e.description, e.code, e.result, i]
        );
      }
      log.push(`✅ ${s.title}`);
    }

    return res.status(200).json({ ok: true, log });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, log });
  }
}
