import express from 'express'
import cors from 'cors'
import routesGibi from './routes/gibi'
import routesNota from './routes/nota'
import routesUsuario from './routes/usuario'
import routesComentario from './routes/comentario'
import routesLogin from './routes/login'

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())

app.use("/gibi", routesGibi)
app.use("/nota", routesNota)
app.use("/usuario", routesUsuario)
app.use("/comentario", routesComentario)
app.use("/login", routesLogin)

app.get('/', (req, res) => {
  res.send('API: Reviews de Gibis')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})