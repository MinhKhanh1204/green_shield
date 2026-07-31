import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Nav from '../components/Nav'
import LanguageToggle from '../components/LanguageToggle'
import logo from '../assets/logo.png'
import logolg from '../assets/logo-lg.png'

export default function MainLayout({ children }) {
  const location = useLocation()
  const headerClassName = location.pathname === '/map' ? 'header header--map' : 'header'

  return (
    <>
      <header className={headerClassName}>
        <Link to="/" className='header-logo'>
          <img src={logo} alt="greenshield logo" width="24" />
          <img className="logo-lg" src={logolg} alt="greenshield name" width="100" />
        </Link>

        <div className='header-nav'>
          <Nav />
        </div>

        <div className='header-lang'>
          <LanguageToggle />
        </div>
      </header>

      {children}
    </>
  )
}
