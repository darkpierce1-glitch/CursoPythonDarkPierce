import { useState, useEffect, useRef } from 'react';
import { Instagram, Twitter, Youtube, Mail, ChevronDown, Code, Book, Play, CheckCircle, Terminal, Coffee, Users, Sparkles, Heart, ArrowUp, Copy, Check, Menu, X, FileCode, Cog, FunctionSquare } from 'lucide-react';

// Floating background shapes component
const FloatingShapes = () => {
  const shapes = [
    { id: 1, x: 10, y: 20, size: 80, duration: 20, color: 'from-purple-400/20 to-pink-400/20' },
    { id: 2, x: 80, y: 30, size: 120, duration: 25, color: 'from-blue-400/15 to-cyan-400/15' },
    { id: 3, x: 50, y: 70, size: 60, duration: 18, color: 'from-green-400/15 to-emerald-400/15' },
    { id: 4, x: 20, y: 60, size: 100, duration: 22, color: 'from-yellow-400/15 to-amber-400/15' },
    { id: 5, x: 70, y: 80, size: 70, duration: 24, color: 'from-rose-400/15 to-red-400/15' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-3xl`}
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
            animation: `float ${shape.duration}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
};

// Code block component with copy functionality
const CodeBlock = ({ code, language = 'python' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-xs text-gray-400 uppercase">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copiar
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
};

// Theory card component
const TheoryCard = ({ title, content, icon: Icon }: { title: string; content: string; icon: any }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
      </div>
      <p className="text-gray-400 leading-relaxed">{content}</p>
    </div>
  );
};

// Interactive example component
const InteractiveExample = ({
  title,
  description,
  code,
  result
}: {
  title: string;
  description: string;
  code: string;
  result: string;
}) => {
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <div className="p-6">
        <CodeBlock code={code} />
        <button
          onClick={() => setShowResult(!showResult)}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
        >
          <Play className="w-4 h-4" />
          {showResult ? 'Ocultar resultado' : 'Ver resultado'}
        </button>
        {showResult && (
          <div className="mt-4 p-4 rounded-lg bg-black/50 border border-green-500/30">
            <p className="text-green-400 font-mono text-sm whitespace-pre-line">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Navigation component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Variables', href: '#variables' },
    { label: 'Métodos', href: '#metodos' },
    { label: 'Funciones', href: '#funciones' },
    { label: 'Comunidad', href: '#comunidad' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Python Friends</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#comunidad"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Comenzar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block py-2 text-gray-400 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

// Main App component
function App() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Python Variables content
  const variablesContent = {
    theory: [
      {
        title: '¿Qué son las variables?',
        content: 'Las variables son contenedores para almacenar datos. En Python, no necesitas declarar el tipo de variable, Python lo infiere automáticamente. El nombre de la variable debe ser descriptivo y seguir ciertas reglas.',
        icon: Book
      },
      {
        title: 'Tipos de datos básicos',
        content: 'Python tiene varios tipos de datos integrados: str (texto), int (enteros), float (decimales), bool (verdadero/falso), list (listas), dict (diccionarios), tuple (tuplas) y set (conjuntos).',
        icon: Cog
      },
      {
        title: 'Reglas de nomenclatura',
        content: 'Los nombres de variables deben comenzar con una letra o guión bajo, pueden contener letras, números y guiones bajos, son sensibles a mayúsculas/minúsculas, y no pueden ser palabras reservadas.',
        icon: FileCode
      }
    ],
    examples: [
      {
        title: 'Variables básicas',
        description: 'Ejemplo simple de declaración de variables en Python',
        code: `# Variables en Python
nombre = "María"
edad = 25
altura = 1.65
es_estudiante = True

print(f"Hola, me llamo {nombre}")
print(f"Tengo {edad} años")
print(f"Mido {altura} metros")
print(f"¿Soy estudiante? {es_estudiante}")`,
        result: `Hola, me llamo María
Tengo 25 años
Mido 1.65 metros
¿Soy estudiante? True`
      },
      {
        title: 'Tipos de datos',
        description: 'Verificación de tipos de datos con la función type()',
        code: `# Verificando tipos de datos
mensaje = "Hola Python"
numero = 42
decimal = 3.14
es_activo = False
colores = ["rojo", "verde", "azul"]

print(type(mensaje))    # <class 'str'>
print(type(numero))     # <class 'int'>
print(type(decimal))    # <class 'float'>
print(type(es_activo))  # <class 'bool'>
print(type(colores))    # <class 'list'>`,
        result: `<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
<class 'list'>`
      },
      {
        title: 'Conversión de tipos',
        description: 'Convertir entre diferentes tipos de datos',
        code: `# Conversión de tipos (casting)
numero_str = "100"
numero_int = int(numero_str)
numero_float = float(numero_str)

print(f"String: {numero_str} (tipo: {type(numero_str).__name__})")
print(f"Entero: {numero_int} (tipo: {type(numero_int).__name__})")
print(f"Float: {numero_float} (tipo: {type(numero_float).__name__})")

# De número a string
edad = 30
edad_str = str(edad)
print(f"\\nEdad como string: {edad_str}")`,
        result: `String: 100 (tipo: str)
Entero: 100 (tipo: int)
Float: 100.0 (tipo: float)

Edad como string: 30`
      }
    ]
  };

  // Python Methods content
  const methodsContent = {
    theory: [
      {
        title: '¿Qué son los métodos?',
        content: 'Los métodos son funciones que están asociadas a un objeto. Se llaman usando la sintaxis objeto.método(). Los métodos pueden modificar el objeto o devolver información sobre él.',
        icon: Cog
      },
      {
        title: 'Métodos de cadenas',
        content: 'Las cadenas (str) tienen muchos métodos útiles: upper(), lower(), strip(), replace(), split(), join(), find(), startswith(), endswith(), entre muchos otros.',
        icon: FileCode
      },
      {
        title: 'Métodos de listas',
        content: 'Las listas tienen métodos para añadir elementos (append, insert, extend), eliminar (pop, remove, clear), ordenar (sort, reverse) y buscar (index, count).',
        icon: Book
      }
    ],
    examples: [
      {
        title: 'Métodos de cadenas',
        description: 'Manipulación de texto con métodos de strings',
        code: `# Métodos de cadenas (strings)
texto = "   Hola, Python Friends School!   "

print(f"Original: '{texto}'")
print(f"Strip: '{texto.strip()}'")
print(f"Upper: '{texto.upper()}'")
print(f"Lower: '{texto.lower()}'")
print(f"Replace: '{texto.replace('Friends', 'Amigos')}'")

# Dividir y unir
palabras = texto.strip().split(" ")
print(f"Split: {palabras}")
print(f"Join: {'-'.join(palabras)}")`,
        result: `Original: '   Hola, Python Friends School!   '
Strip: 'Hola, Python Friends School!'
Upper: '   HOLA, PYTHON FRIENDS SCHOOL!   '
Lower: '   hola, python friends school!   '
Replace: '   Hola, Python Amigos School!   '
Split: ['Hola,', 'Python', 'Friends', 'School!']
Join: Hola,-Python-Friends-School!`
      },
      {
        title: 'Métodos de listas',
        description: 'Trabajando con listas y sus métodos',
        code: `# Métodos de listas
frutas = ["manzana", "banana", "naranja"]

# Añadir elementos
frutas.append("uva")
frutas.insert(1, "pera")
print(f"Después de añadir: {frutas}")

# Eliminar elementos
frutas.pop()
frutas.remove("banana")
print(f"Después de eliminar: {frutas}")

# Ordenar
numeros = [3, 1, 4, 1, 5, 9, 2, 6]
numeros.sort()
print(f"Ordenado: {numeros}")

# Buscar
print(f"¿'pera' está en la lista? {'pera' in frutas}")`,
        result: `Después de añadir: ['manzana', 'pera', 'banana', 'naranja', 'uva']
Después de eliminar: ['manzana', 'pera', 'naranja']
Ordenado: [1, 1, 2, 3, 4, 5, 6, 9]
¿'pera' está en la lista? True`
      },
      {
        title: 'Métodos de diccionarios',
        description: 'Operaciones con diccionarios',
        code: `# Métodos de diccionarios
estudiante = {
    "nombre": "Carlos",
    "edad": 22,
    "carrera": "Ingeniería"
}

# Ver claves y valores
print(f"Claves: {estudiante.keys()}")
print(f"Valores: {estudiante.values()}")
print(f"Items: {estudiante.items()}")

# Obtener y establecer valores
print(f"Get nombre: {estudiante.get('nombre')}")
estudiante.update({"edad": 23, "semestre": 5})
print(f"After update: {estudiante}")

# Eliminar
del estudiante["carrera"]
print(f"After del: {estudiante}")`,
        result: `Claves: dict_keys(['nombre', 'edad', 'carrera'])
Valores: dict_values(['Carlos', 22, 'Ingeniería'])
Items: dict_items([('nombre', 'Carlos'), ('edad', 22), ('carrera', 'Ingeniería')])
Get nombre: Carlos
After update: {'nombre': 'Carlos', 'edad': 23, 'semestre': 5}
After del: {'nombre': 'Carlos', 'edad': 23, 'semestre': 5}`
      }
    ]
  };

  // Python Functions content
  const functionsContent = {
    theory: [
      {
        title: '¿Qué son las funciones?',
        content: 'Las funciones son bloques de código reutilizable que realizan una tarea específica. Se definen con la palabra clave def, pueden recibir parámetros y pueden devolver valores.',
        icon: FunctionSquare
      },
      {
        title: 'Parámetros y argumentos',
        content: 'Las funciones pueden tener parámetros obligatorios, parámetros con valores por defecto, parámetros variables (*args, **kwargs). Los argumentos pueden pasarse por posición o por nombre.',
        icon: Cog
      },
      {
        title: 'Funciones lambda',
        content: 'Las funciones lambda son funciones anónimas de una sola línea. Son útiles para operaciones simples y se usan frecuentemente con funciones como map(), filter() y sorted().',
        icon: FileCode
      }
    ],
    examples: [
      {
        title: 'Función básica',
        description: 'Creando tu primera función en Python',
        code: `# Definición de funciones
def saludar(nombre):
    """Función que saluda a una persona"""
    return f"¡Hola, {nombre}! Bienvenido a Python Friends"

# Llamar a la función
mensaje = saludar("María")
print(mensaje)

# Función con múltiples parámetros
def calcular_area(base, altura):
    """Calcula el área de un triángulo"""
    area = (base * altura) / 2
    return area

resultado = calcular_area(10, 5)
print(f"El área del triángulo es: {resultado}")`,
        result: `¡Hola, María! Bienvenido a Python Friends
El área del triángulo es: 25.0`
      },
      {
        title: 'Parámetros por defecto',
        description: 'Usando valores predeterminados en funciones',
        code: `# Parámetros con valores por defecto
def crear_usuario(nombre, edad=18, ciudad="Desconocida"):
    """Crea un diccionario con información del usuario"""
    return {
        "nombre": nombre,
        "edad": edad,
        "ciudad": ciudad
    }

# Llamadas con diferentes argumentos
usuario1 = crear_usuario("Ana")
usuario2 = crear_usuario("Luis", 25)
usuario3 = crear_usuario("Sofía", 30, "Madrid")

print(f"Usuario 1: {usuario1}")
print(f"Usuario 2: {usuario2}")
print(f"Usuario 3: {usuario3}")`,
        result: `Usuario 1: {'nombre': 'Ana', 'edad': 18, 'ciudad': 'Desconocida'}
Usuario 2: {'nombre': 'Luis', 'edad': 25, 'ciudad': 'Desconocida'}
Usuario 3: {'nombre': 'Sofía', 'edad': 30, 'ciudad': 'Madrid'}`
      },
      {
        title: 'Funciones lambda',
        description: 'Funciones anónimas de una línea',
        code: `# Funciones lambda (anónimas)
cuadrado = lambda x: x ** 2
suma = lambda a, b: a + b

print(f"Cuadrado de 5: {cuadrado(5)}")
print(f"3 + 7 = {suma(3, 7)}")

# Usando lambda con map()
numeros = [1, 2, 3, 4, 5]
cuadrados = list(map(lambda x: x ** 2, numeros))
print(f"Números: {numeros}")
print(f"Cuadrados: {cuadrados}")

# Usando lambda con filter()
pares = list(filter(lambda x: x % 2 == 0, numeros))
print(f"Pares: {pares}")

# Usando lambda con sorted()
personas = [("Ana", 25), ("Carlos", 30), ("María", 22)]
ordenadas = sorted(personas, key=lambda x: x[1])
print(f"Ordenadas por edad: {ordenadas}")`,
        result: `Cuadrado de 5: 25
3 + 7 = 10
Números: [1, 2, 3, 4, 5]
Cuadrados: [1, 4, 9, 16, 25]
Pares: [2, 4]
Ordenadas por edad: [('María', 22), ('Ana', 25), ('Carlos', 30)]`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -50px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>

      <FloatingShapes />
      <Navigation />

      {/* Hero Section */}
      <section id="inicio" ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
        {/* Animated background lines */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
                transform: `translateY(${scrollY * (0.1 + i * 0.05)}px)`,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="relative inline-block mb-8 animate-slideUp">
            <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                <Code className="w-16 h-16 text-purple-400" />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="relative mb-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient">
                Python Friends
              </span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-white mt-2">School</h2>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-8 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            Aprende Python de forma <span className="text-purple-400">divertida</span> y <span className="text-pink-400">efectiva</span>
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 animate-slideUp" style={{ animationDelay: '0.6s' }}>
            {[
              { value: '50+', label: 'Lecciones', icon: Book },
              { value: '1000+', label: 'Estudiantes', icon: Users },
              { value: '24/7', label: 'Soporte', icon: Coffee },
            ].map((stat, index) => (
              <div key={index} className="text-center flex items-center gap-3">
                <stat.icon className="w-8 h-8 text-purple-400" />
                <div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => scrollToSection('variables')}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white overflow-hidden animate-slideUp"
            style={{ animationDelay: '0.8s' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Comenzar a Aprender
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Variables Section */}
      <section id="variables" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <FileCode className="w-4 h-4" />
              Lección 1
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Variables</span> en Python
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Las variables son la base de todo programa. Aprende cómo declarar, usar y manipular variables en Python.
            </p>
          </div>

          {/* Theory cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {variablesContent.theory.map((card, index) => (
              <TheoryCard key={index} {...card} />
            ))}
          </div>

          {/* Examples */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Ejemplos Prácticos
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {variablesContent.examples.map((example, index) => (
                <InteractiveExample key={index} {...example} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section id="metodos" className="relative py-24 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 text-pink-400 text-sm font-medium mb-4">
              <Cog className="w-4 h-4" />
              Lección 2
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">Métodos</span> en Python
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Los métodos son herramientas poderosas que vienen integradas en los tipos de datos de Python.
            </p>
          </div>

          {/* Theory cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {methodsContent.theory.map((card, index) => (
              <TheoryCard key={index} {...card} />
            ))}
          </div>

          {/* Examples */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Ejemplos Prácticos
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methodsContent.examples.map((example, index) => (
                <InteractiveExample key={index} {...example} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Functions Section */}
      <section id="funciones" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium mb-4">
              <FunctionSquare className="w-4 h-4" />
              Lección 3
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Funciones</span> en Python
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Las funciones te permiten organizar tu código, hacerlo reutilizable y más fácil de mantener.
            </p>
          </div>

          {/* Theory cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {functionsContent.theory.map((card, index) => (
              <TheoryCard key={index} {...card} />
            ))}
          </div>

          {/* Examples */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Ejemplos Prácticos
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {functionsContent.examples.map((example, index) => (
                <InteractiveExample key={index} {...example} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="comunidad" className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">
            Comunidad
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Únete a <span className="text-pink-400">Python Friends</span>
          </h3>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            Conecta con otros estudiantes, comparte tu código y aprende junto a una comunidad apasionada por Python
          </p>

          {/* Social buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href="#" className="group relative">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-xl">
                <Instagram className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 blur-lg opacity-0 group-hover:opacity-70 transition-opacity" />
              </div>
            </a>
            <a href="#" className="group relative">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-xl">
                <Twitter className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 blur-lg opacity-0 group-hover:opacity-70 transition-opacity" />
              </div>
            </a>
            <a href="#" className="group relative">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-600 via-pink-500 to-purple-600 transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-xl">
                <Youtube className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 via-pink-500 to-purple-600 blur-lg opacity-0 group-hover:opacity-70 transition-opacity" />
              </div>
            </a>
            <a href="#" className="group relative">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-xl">
                <Mail className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 blur-lg opacity-0 group-hover:opacity-70 transition-opacity" />
              </div>
            </a>
          </div>

          {/* Features checklist */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-gray-800 max-w-md mx-auto">
            <h4 className="text-xl font-bold mb-6">¿Qué incluye el curso?</h4>
            <div className="space-y-4 text-left">
              {[
                'Más de 50 lecciones interactivas',
                'Ejercicios prácticos con código real',
                'Proyectos paso a paso',
                'Certificado de finalización',
                'Acceso a la comunidad Discord',
                'Actualizaciones de por vida'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Python Friends School</span>
          </div>

          <p className="text-gray-500 text-sm">
            © 2024 Python Friends School. Hecho con <Heart className="w-4 h-4 inline text-pink-500" /> para la comunidad Python.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;