import fs from 'node:fs'
import { parse } from 'csv-parse'

const csvPath = new URL('./tasks.csv', import.meta.url)

async function run() {
  const parser = fs
    .createReadStream(csvPath)
    .pipe(
      parse({
        delimiter: ',',
        skipEmptyLines: true,
        fromLine: 2,
      }),
    )

  for await (const line of parser) {
    const [title, description] = line

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        title,
        description,
      }),
    })
  }
}

run()