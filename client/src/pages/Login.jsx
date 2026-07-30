import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí conectarías con tu endpoint /api/Users/login
    console.log('Datos de login:', formData);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Campo Usuario / Email */}
          <div className="input-group">
            <User className="input-icon" size={18} />
            <input
              type="text"
              name="username"
              placeholder="Email"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <a href="#forgot" className="forgot-pass">
            Forgot password?
          </a>

          {/* Botón de envío */}
          <button type="submit" className="btn-signin">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;