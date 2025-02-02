import { useState } from 'react'
import DynamicButton from './components/button/button'
import { useNavigate } from 'react-router-dom';
import "./Login.css"

function Login() {
  const [pressed, setPressed] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('');

  const onPressed = () => {
    setPressed(prevState => !prevState); 
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = { name, email, password };

    try {
      const response = await fetch('http://localhost:8080/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Cadastro bem-sucedido:', result);
        localStorage.setItem('token', result.token);
        alert("Cadastro finalizado com sucesso! Você sera redirecionado para o chat.")
        navigate('/chat');
      } else {
        setErrorMessage(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setErrorMessage('Erro ao conectar ao servidor');
    } 
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = { email, password };

    try {
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Login bem-sucedido", result);
        localStorage.setItem('token', result.token);
        navigate('/chat');
      } else {
        setErrorMessage(result.error || 'Erro desconhecido');
      }
    } catch (error) {
        console.error("erro ao fazer login:", error);
        setErrorMessage('erro ao conectar ao servidor');
    }
  };

  return (
    <section className='containerLogin'>
      <div className={pressed ? "esqMovimentado" : "esq"}>
        {pressed ? 
          <form action="" className='formLogin'>
            <h2>Cadastro</h2>
            <div>
              <label htmlFor="">Nome</label>
              <input 
                type="text"
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Digite seu nome'
              />
            </div>
            <div>
              <label htmlFor="">Email</label>
              <input 
                type="email" 
                placeholder='Digite seu email'
                id='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="">Senha</label>
              <input 
                type="password" 
                placeholder='Digite sua senha'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <DynamicButton onClick={pressed ? handleRegister : handleLogin}/>
            <a href="#" onClick={onPressed}>Ja tem uma conta? Faça Login</a>
          </form>
          :
          <form action="" className='formLogin'>
            <h2>Login</h2>
            <div>
              <label htmlFor="">Email</label>
              <input 
                type="email" 
                placeholder='Digite seu email'
                id='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="">Senha</label>
              <input 
                type="password" 
                placeholder='Digite sua senha'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <DynamicButton onClick={pressed ? handleRegister : handleLogin}/>
            <a href="#" onClick={onPressed}>Não tem uma conta? Clique aqui</a>
          </form>
        } 
        
      </div>

      <div className={pressed ? "dirMovimentado animarEsquerda" : "dir animarDireita"}>
        <h1>
          <span className='c'>C</span>
          <span className='h'>h</span>
          <span className='a'>a</span>
          <span className='t'>t</span>
          <span className='ponto'>.</span>
          <span className='i'>i</span>
          <span className='o'>o</span>
        </h1>
        <p className="paragrafoAnimado">Seu chat de confiança</p>
      </div>
    </section>  
  )
}

export default Login;
