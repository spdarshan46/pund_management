// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiUsers,
  FiLock,
  FiClock,
  FiFileText,
  FiShield,
  FiPieChart,
  FiMenu,
  FiX,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiInstagram
} from 'react-icons/fi';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  const features = [
    {
      icon: <FiClock className="w-6 h-6" />,
      title: 'Automated Saving Cycles',
      description: 'Create daily, weekly, or monthly savings cycles with automatic tracking and reminders.',
      color: 'from-blue-500 to-cyan-400',
      stats: '100% automation'
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Smart Loan Management',
      description: 'Members request loans with configurable interest and automated repayment schedules.',
      color: 'from-purple-500 to-pink-400',
      stats: '0% defaults'
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'EMI & Penalty Automation',
      description: 'Automated calculation of EMIs and penalties for missed payments with notifications.',
      color: 'from-orange-500 to-red-400',
      stats: '99.9% accuracy'
    },
    {
      icon: <FiPieChart className="w-6 h-6" />,
      title: 'Real-Time Monitoring',
      description: 'Instant visibility of total savings, active loans, and available group funds.',
      color: 'from-green-500 to-emerald-400',
      stats: 'Live updates'
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Granular permissions for owners and members with distinct operational views.',
      color: 'from-indigo-500 to-blue-400',
      stats: 'ISO certified'
    },
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: 'Audit Reports',
      description: 'Complete financial audit trail with detailed reports and export options.',
      color: 'from-amber-500 to-orange-400',
      stats: '100% traceable'
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Group",
      description: "Set up your savings group with custom rules and contribution structures in minutes",
      icon: "🚀"
    },
    {
      step: "02",
      title: "Add Members",
      description: "Invite members via email or link, define their roles and contribution limits",
      icon: "👥"
    },
    {
      step: "03",
      title: "Start Saving",
      description: "Begin automated savings cycles with real-time tracking and instant notifications",
      icon: "💰"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        style={{ backgroundColor: headerBg }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PundX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { name: 'How it works', href: '#how-it-works' },
                { name: 'Features', href: '#features' },
                { name: 'Security', href: '#security' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Get started
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-6 py-4 space-y-3">
              <a href="#how-it-works" className="block py-2 text-gray-600 hover:text-gray-900">How it works</a>
              <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900">Features</a>
              <a href="#security" className="block py-2 text-gray-600 hover:text-gray-900">Security</a>
              <div className="pt-4 space-y-3">
                <Link to="/login" className="block">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg">
                    Sign in
                  </button>
                </Link>
                <Link to="/register" className="block">
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    Get started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Digitize Your Group
              </span>
              <br />
              <span className="text-gray-900">Savings with Confidence</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              PundX helps communities, families, and organizations manage collective savings
              with transparency and automation. Replace manual bookkeeping with intelligent
              financial tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center min-w-[200px]"
                >
                  Start free trial
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all min-w-[200px]"
                >
                  Sign in
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30" />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, transparent process for digital savings management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-sm font-semibold text-blue-600 mb-2">{step.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for modern group financial management
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {feature.stats}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Bank-Grade Security
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Your data is protected with enterprise-level security measures
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                "256-bit encryption",
                "JWT authentication",
                "Role-based access",
                "Audit trails",
                "2FA support",
                "Real-time monitoring"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center space-x-2 p-3 bg-gray-800 rounded-lg"
                >
                  <FiCheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <a href="mailto:darshan@pundx.com" className="text-gray-400 hover:text-gray-600">
              <FiMail className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/in/spdarshan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
              <FiLinkedin className="w-5 h-5" />
            </a>
            <a href="https://github.com/spdarshan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
              <FiGithub className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/spdarshan252" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
              <FiInstagram className="w-5 h-5" />
            </a>
          </div>

          <p className="text-sm text-gray-500 mb-2">
            Developed by <span className="font-medium text-gray-700">S P Darshan</span>
          </p>

          <p className="text-sm text-gray-400">
            © 2026 PundX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;