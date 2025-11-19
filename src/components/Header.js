import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/logo-GL-M.png';
import Button from '../pages/Button';

const Header = () => {
  const [navVisible, setNavVisible] = useState(false);

  const toggleNav = () => {
    setNavVisible(!navVisible);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <a href="/" className="logo-link"><img src={Logo} alt="Logo Grupo Lavoro" className="logo" /></a>
        <nav className={`nav ${navVisible ? 'nav--visible' : ''}`}>
          <Link className="nav-link" to="/#solutions" onClick={toggleNav}>Soluções</Link>
          <Link className="nav-link" to="/#about" onClick={toggleNav}>Sobre</Link>
          <Link className="nav-link" to="/#testimonials" onClick={toggleNav}>Depoimentos</Link>
          <Link className="nav-link" to="/#contact" onClick={toggleNav}>Contato</Link>
          <Button primary href="/login">Entrar</Button>
        </nav>
        <button className="nav-toggle" aria-label="toggle navigation" onClick={toggleNav}>
          <span className="hamburger"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;