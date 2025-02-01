import { useState } from 'react'
import DynamicButton from './components/button/button'
import "./Login.css"

function Login() {
  const [pressed, setPressed] = useState(false);

  const onPressed = () => {
    setPressed(prevState => !prevState); 
  }

  return (
    <section className='containerLogin'>
      <div className={pressed ? "esqMovimentado" : "esq"}>
        <form action="" className='formLogin'>
          <h2>{pressed ? "Cadastro" : "Login"}</h2>
          <div>
            <label htmlFor="">Email</label>
            <input type="email" placeholder='Digite seu email'/>
          </div>
          <div>
            <label htmlFor="">Senha</label>
            <input type="password" placeholder='Digite sua senha'/>
          </div>

          <DynamicButton />
          <a href="#" onClick={onPressed}>Não tem uma conta? Clique aqui</a>
        </form>
      </div>

      <div className='dir'>
        <h1>Chat.io</h1>
        <p>Seu chat de confiança</p>
      </div>
    </section>  
  )
}

export default Login;
