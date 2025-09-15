/*
  Ponto de entrada principal da aplicação React. 
  Renderiza o componente de roteamento da aplicação.
*/
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './routes/AppRouter.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppRouter />
)
