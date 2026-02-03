
import 'dotenv/config'
import prisma from './lib/prisma.js'
import { fetchAll } from './lib/indexer-utils.js'

async function main() {
  console.log('Iniciando importação de ativos para a tabela stocks...')
  const data = await fetchAll()
  if (!data || !data.length) {
    console.log('Nenhum dado retornado.')
    return
  }

  let batch = []
  for (const item of data) {
    batch.push(item)
    if (batch.length >= 500) {
      await prisma.stocks.createMany({ data: batch, skipDuplicates: true })
      batch = []
    }
  }

  if (batch.length) {
    await prisma.stocks.createMany({ data: batch, skipDuplicates: true })
  }
  console.log('Importação concluída.')
}

main()
  .catch((err) => {
    console.error(err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
