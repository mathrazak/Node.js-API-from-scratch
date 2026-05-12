import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

function taskExists(id) {
  const tasks = database.select('tasks')

  return tasks.find(task => task.id === id)
}

export const routes = [
  // LISTAR TASKS
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select(
        'tasks',
        search
          ? {
              title: search,
              description: search,
            }
          : null,
      )

      return res.end(JSON.stringify(tasks))
    },
  },

  // CRIAR TASK
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      // VALIDAÇÃO
      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({
            error: 'title e description são obrigatórios',
          }),
        )
      }

      const task = {
        id: randomUUID(),

        title,
        description,

        completed_at: null,

        created_at: new Date(),

        updated_at: new Date(),
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    },
  },

  // ATUALIZAR TASK
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const { title, description } = req.body

      const task = taskExists(id)

      // VALIDA ID
      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: 'Task não encontrada',
          }),
        )
      }

      database.update('tasks', id, {
        title: title ?? task.title,

        description: description ?? task.description,

        updated_at: new Date(),
      })

      return res.writeHead(204).end()
    },
  },

  // DELETAR TASK
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const task = taskExists(id)

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: 'Task não encontrada',
          }),
        )
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    },
  },

  // COMPLETAR TASK
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const task = taskExists(id)

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: 'Task não encontrada',
          }),
        )
      }

      database.update('tasks', id, {
        completed_at: task.completed_at ? null : new Date(),

        updated_at: new Date(),
      })

      return res.writeHead(204).end()
    },
  },
]