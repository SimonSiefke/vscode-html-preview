const PERFORMANCE_MAP: {
  [key: string]: [number, number]
} = Object.create(null)

export const measureStart = (name: string) => {
  const start = process.hrtime()
  PERFORMANCE_MAP[name] = start
}

export const measureEnd = (name: string) => {
  const start = PERFORMANCE_MAP[name]
  const end = process.hrtime(start)
  console.info(`"${name}" took: ${(end[0] * 1000000000 + end[1]) / 1000000}ms`)
}
