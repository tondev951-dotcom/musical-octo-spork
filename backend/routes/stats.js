import { Router } from 'express'
import { getSession } from '../state/sessionStore.js'
import { statPoint } from '../utils/generate.js'

const router = Router()

router.get('/', (req, res) => {
  const { connected } = getSession()
  res.json(statPoint(connected))
})

export default router
