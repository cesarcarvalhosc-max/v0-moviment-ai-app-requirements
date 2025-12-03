export type Exercise = {
  id: string
  title: string
  category: string
  videoUrl: string
  description: string
  steps: string[]
  commonErrors: string[]
  breathing: string
  targetMuscles: string[]
}

export const EXERCISES: Exercise[] = [
  // PEITO
  {
    id: "chest-1",
    title: "Flexão clássica",
    category: "Peito",
    videoUrl: "/classic-push-up-exercise.jpg",
    description: "Exercício fundamental para desenvolver o peitoral, tríceps e core.",
    steps: [
      "Posicione-se em prancha com mãos na largura dos ombros",
      "Mantenha o corpo em linha reta da cabeça aos pés",
      "Desça o peito até próximo ao chão",
      "Empurre para cima até estender os braços",
    ],
    commonErrors: ["Deixar o quadril cair", "Não descer completamente", "Cabeça olhando para frente"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Peitoral maior", "Tríceps", "Core"],
  },
  {
    id: "chest-2",
    title: "Flexão diamante",
    category: "Peito",
    videoUrl: "/diamond-push-up-exercise.jpg",
    description: "Variação que enfatiza mais o tríceps e a parte interna do peitoral.",
    steps: [
      "Posicione as mãos próximas formando um diamante com os dedos",
      "Mantenha os cotovelos próximos ao corpo",
      "Desça controladamente",
      "Empurre para cima mantendo tensão no tríceps",
    ],
    commonErrors: ["Abrir muito os cotovelos", "Perder tensão no core"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Tríceps", "Peitoral interno"],
  },
  {
    id: "chest-3",
    title: "Flexão ampla",
    category: "Peito",
    videoUrl: "/wide-push-up-exercise.jpg",
    description: "Variação com mãos mais afastadas para enfatizar o peitoral.",
    steps: [
      "Posicione as mãos mais largas que os ombros",
      "Mantenha o core contraído",
      "Desça até o peitoral estar próximo ao chão",
      "Empurre explosivamente para cima",
    ],
    commonErrors: ["Mãos muito abertas", "Perder estabilidade"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Peitoral maior", "Deltoides anterior"],
  },

  // COSTAS
  {
    id: "back-1",
    title: "Superman",
    category: "Costas",
    videoUrl: "/superman-exercise-back.jpg",
    description: "Fortalece toda a cadeia posterior do corpo.",
    steps: [
      "Deite-se de bruços no chão",
      "Estenda braços à frente",
      "Levante simultaneamente braços e pernas",
      "Mantenha por 2-3 segundos e desça",
    ],
    commonErrors: ["Arquear demais a lombar", "Tensão no pescoço"],
    breathing: "Expire ao levantar, inspire ao descer",
    targetMuscles: ["Eretores da coluna", "Glúteos", "Trapézio"],
  },
  {
    id: "back-2",
    title: "Prancha invertida",
    category: "Costas",
    videoUrl: "/reverse-plank-exercise.jpg",
    description: "Trabalha posterior de ombros, lombar e glúteos.",
    steps: [
      "Sente-se com pernas estendidas",
      "Apoie as mãos atrás dos quadris",
      "Levante o quadril formando linha reta",
      "Mantenha a posição",
    ],
    commonErrors: ["Quadril muito baixo", "Ombros tensos"],
    breathing: "Respiração contínua e controlada",
    targetMuscles: ["Deltoides posterior", "Lombar", "Glúteos"],
  },
  {
    id: "back-3",
    title: "Ponte de ombros com uma perna",
    category: "Costas",
    videoUrl: "/single-leg-bridge-exercise.jpg",
    description: "Fortalece glúteos, lombar e isquiotibiais.",
    steps: [
      "Deite de costas com joelhos flexionados",
      "Estenda uma perna",
      "Levante o quadril com força dos glúteos",
      "Desça controladamente",
    ],
    commonErrors: ["Usar lombar em vez de glúteos", "Perder alinhamento"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Glúteos", "Lombar", "Isquiotibiais"],
  },

  // OMBROS
  {
    id: "shoulders-1",
    title: "Pike push-up",
    category: "Ombros",
    videoUrl: "/pike-push-up-exercise.jpg",
    description: "Trabalha intensamente os deltoides.",
    steps: [
      "Comece em posição de V invertido",
      "Dobre os cotovelos descendo a cabeça",
      "Mantenha quadril elevado",
      "Empurre para cima",
    ],
    commonErrors: ["Perder posição do quadril", "Cotovelos muito abertos"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Deltoides", "Tríceps"],
  },
  {
    id: "shoulders-2",
    title: "Flexão hindu",
    category: "Ombros",
    videoUrl: "/hindu-push-up-exercise.jpg",
    description: "Movimento fluido que trabalha ombros e alongamento.",
    steps: [
      "Inicie em V invertido",
      "Desça em arco passando próximo ao chão",
      "Finalize olhando para cima",
      "Retorne pelo mesmo caminho",
    ],
    commonErrors: ["Movimento muito rápido", "Perder fluidez"],
    breathing: "Coordenar com o movimento",
    targetMuscles: ["Deltoides", "Peitoral", "Core"],
  },
  {
    id: "shoulders-3",
    title: "Elevação lateral isométrica",
    category: "Ombros",
    videoUrl: "/lateral-raise-isometric.jpg",
    description: "Mantém tensão constante no deltoide lateral.",
    steps: [
      "Fique em pé com braços ao lado",
      "Eleve os braços até altura dos ombros",
      "Mantenha a posição isométrica",
      "Desça controladamente",
    ],
    commonErrors: ["Elevar ombros junto", "Balançar o corpo"],
    breathing: "Respiração contínua",
    targetMuscles: ["Deltoide lateral"],
  },

  // TRÍCEPS
  {
    id: "triceps-1",
    title: "Flexão diamante",
    category: "Tríceps",
    videoUrl: "/diamond-push-up-triceps.jpg",
    description: "Melhor exercício de peso corporal para tríceps.",
    steps: [
      "Mãos próximas formando diamante",
      "Cotovelos colados ao corpo",
      "Desça até o peito tocar as mãos",
      "Empurre com força do tríceps",
    ],
    commonErrors: ["Abrir cotovelos", "Não descer completamente"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Tríceps", "Peitoral interno"],
  },
  {
    id: "triceps-2",
    title: "Dips no chão",
    category: "Tríceps",
    videoUrl: "/floor-dips-exercise.jpg",
    description: "Isolamento do tríceps usando o chão.",
    steps: [
      "Sente com mãos apoiadas atrás",
      "Estenda as pernas",
      "Flexione os cotovelos descendo o quadril",
      "Empurre para cima",
    ],
    commonErrors: ["Usar muito os ombros", "Descer pouco"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Tríceps"],
  },
  {
    id: "triceps-3",
    title: "Dips entre cadeiras",
    category: "Tríceps",
    videoUrl: "/bench-dips-exercise.jpg",
    description: "Versão mais desafiadora dos dips.",
    steps: [
      "Use duas cadeiras ou banco",
      "Apoie as mãos atrás",
      "Pés elevados ou no chão",
      "Flexione até 90 graus e volta",
    ],
    commonErrors: ["Descer demais", "Ombros tensos"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Tríceps", "Peitoral inferior"],
  },

  // BÍCEPS
  {
    id: "biceps-1",
    title: "Flexão invertida isométrica",
    category: "Bíceps",
    videoUrl: "/isometric-biceps-hold.jpg",
    description: "Mantém tensão no bíceps sem equipamento.",
    steps: [
      "Posição de flexão invertida",
      "Flexione os braços a 90 graus",
      "Mantenha a posição",
      "Foque na contração do bíceps",
    ],
    commonErrors: ["Perder posição", "Tensionar demais o pescoço"],
    breathing: "Respiração contínua",
    targetMuscles: ["Bíceps", "Core"],
  },
  {
    id: "biceps-2",
    title: "Bíceps isométrico",
    category: "Bíceps",
    videoUrl: "/biceps-self-resistance.jpg",
    description: "Auto-resistência para trabalhar bíceps.",
    steps: [
      "Use uma mão contra a outra",
      "Faça força como se levantasse peso",
      "Mantenha tensão constante",
      "Alterne os braços",
    ],
    commonErrors: ["Pouca tensão", "Movimento muito rápido"],
    breathing: "Contínua e controlada",
    targetMuscles: ["Bíceps"],
  },
  {
    id: "biceps-3",
    title: "Rosca alternada com carga livre",
    category: "Bíceps",
    videoUrl: "/dumbbell-biceps-curl.jpg",
    description: "Com halteres ou qualquer peso disponível.",
    steps: [
      "Segure os pesos ao lado do corpo",
      "Flexione um braço por vez",
      "Mantenha cotovelo fixo",
      "Desça controladamente",
    ],
    commonErrors: ["Balançar o corpo", "Mover o cotovelo"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Bíceps"],
  },

  // ABDÔMEN
  {
    id: "abs-1",
    title: "Prancha padrão",
    category: "Abdômen",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Exercício fundamental para core.",
    steps: [
      "Apoie antebraços e pontas dos pés",
      "Corpo em linha reta",
      "Contraia abdômen e glúteos",
      "Mantenha a posição",
    ],
    commonErrors: ["Quadril caído", "Elevar muito o quadril"],
    breathing: "Respiração contínua",
    targetMuscles: ["Reto abdominal", "Core completo"],
  },
  {
    id: "abs-2",
    title: "Prancha lateral",
    category: "Abdômen",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Trabalha oblíquos e estabilização lateral.",
    steps: ["Apoie em um antebraço", "Corpo em linha reta lateral", "Contraia o oblíquo", "Mantenha quadril elevado"],
    commonErrors: ["Quadril caído", "Rotação do tronco"],
    breathing: "Respiração contínua",
    targetMuscles: ["Oblíquos", "Core lateral"],
  },
  {
    id: "abs-3",
    title: "Elevação de pernas deitado",
    category: "Abdômen",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Foca na parte inferior do abdômen.",
    steps: [
      "Deite de costas com pernas estendidas",
      "Mãos sob o quadril",
      "Eleve as pernas até 90 graus",
      "Desça sem tocar no chão",
    ],
    commonErrors: ["Arquear lombar", "Usar impulso"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Abdômen inferior"],
  },

  // QUADRÍCEPS & GLÚTEOS
  {
    id: "legs-1",
    title: "Agachamento livre",
    category: "Pernas",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Rei dos exercícios para pernas.",
    steps: [
      "Pés na largura dos ombros",
      "Desça como se fosse sentar",
      "Joelhos alinhados com os pés",
      "Empurre pelos calcanhares",
    ],
    commonErrors: ["Joelhos para dentro", "Não descer suficiente"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Quadríceps", "Glúteos"],
  },
  {
    id: "legs-2",
    title: "Agachamento búlgaro",
    category: "Pernas",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Unilateral para maior ativação e equilíbrio.",
    steps: [
      "Apoie um pé atrás elevado",
      "Desça flexionando a perna da frente",
      "Mantenha tronco ereto",
      "Empurre para cima",
    ],
    commonErrors: ["Joelho ultrapassar muito", "Perder equilíbrio"],
    breathing: "Inspire na descida, expire na subida",
    targetMuscles: ["Quadríceps", "Glúteos"],
  },
  {
    id: "legs-3",
    title: "Ponte de glúteo",
    category: "Pernas",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Isolamento e fortalecimento dos glúteos.",
    steps: [
      "Deite de costas, joelhos flexionados",
      "Pés próximos aos glúteos",
      "Eleve o quadril contraindo glúteos",
      "Desça controladamente",
    ],
    commonErrors: ["Usar lombar", "Não contrair glúteos"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Glúteos", "Isquiotibiais"],
  },

  // POSTERIOR & PANTURRILHA
  {
    id: "posterior-1",
    title: "Ponte com pernas esticadas",
    category: "Posterior",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Enfatiza isquiotibiais.",
    steps: [
      "Deite de costas, pernas semi-estendidas",
      "Apoie calcanhares",
      "Eleve quadril contraindo posterior",
      "Desça sem tocar no chão",
    ],
    commonErrors: ["Dobrar muito os joelhos", "Perder contração"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Isquiotibiais", "Glúteos"],
  },
  {
    id: "posterior-2",
    title: "Elevação de quadril com uma perna",
    category: "Posterior",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Unilateral para máxima ativação.",
    steps: [
      "Deite de costas",
      "Uma perna flexionada, outra estendida",
      "Eleve quadril com força do glúteo",
      "Mantenha no topo e desça",
    ],
    commonErrors: ["Rotação do quadril", "Usar impulso"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Glúteos", "Isquiotibiais"],
  },
  {
    id: "posterior-3",
    title: "Elevação de panturrilha em uma perna",
    category: "Posterior",
    videoUrl: "/placeholder.svg?height=400&width=600",
    description: "Fortalece panturrilhas de forma intensa.",
    steps: ["Apoie-se em uma perna", "Eleve-se na ponta do pé", "Mantenha equilíbrio", "Desça até alongar"],
    commonErrors: ["Não subir completamente", "Balançar"],
    breathing: "Expire ao subir, inspire ao descer",
    targetMuscles: ["Gastrocnêmio", "Sóleo"],
  },
]

export const CATEGORIES = Array.from(new Set(EXERCISES.map((e) => e.category)))

export const EXERCISES_DATA = EXERCISES.reduce(
  (acc, exercise) => {
    const category = exercise.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push({
      id: exercise.id,
      name: exercise.title,
      primaryMuscles: exercise.targetMuscles,
    })
    return acc
  },
  {} as Record<string, Array<{ id: string; name: string; primaryMuscles: string[] }>>,
)
