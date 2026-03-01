// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiUsers,
  FiLock,
  FiClock,
  FiShield,
  FiPieChart,
  FiMenu,
  FiX,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiInstagram,
  FiTrendingUp,
  FiStar,
  FiAward
} from 'react-icons/fi';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FiClock className="w-6 h-6" />,
      title: 'Automated Savings',
      description: 'Create daily, weekly, or monthly savings cycles with automatic tracking.',
      color: 'from-blue-500 to-cyan-400',
      stats: '100% automated'
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Smart Loans',
      description: 'Members can request loans with configurable interest and automated repayments.',
      color: 'from-purple-500 to-pink-400',
      stats: '0% defaults'
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'EMI Automation',
      description: 'Automated calculation of EMIs and penalties with instant notifications.',
      color: 'from-orange-500 to-red-400',
      stats: '99.9% accurate'
    },
    {
      icon: <FiPieChart className="w-6 h-6" />,
      title: 'Real-Time Tracking',
      description: 'Instant visibility of savings, loans, and available group funds.',
      color: 'from-green-500 to-emerald-400',
      stats: 'Live updates'
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Granular permissions for owners and members with distinct views.',
      color: 'from-indigo-500 to-blue-400',
      stats: 'Secure'
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />,
      title: 'Audit Reports',
      description: 'Complete financial audit trail with detailed reports and exports.',
      color: 'from-amber-500 to-orange-400',
      stats: '100% traceable'
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: FiUsers },
    { value: '₹5Cr+', label: 'Total Saved', icon: FiAward },
    { value: '98%', label: 'Satisfaction', icon: FiStar },
    { value: '24/7', label: 'Support', icon: FiClock },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Create Your Group",
      description: "Set up your savings group with custom rules in minutes",
      icon: "🚀"
    },
    {
      step: "02",
      title: "Add Members",
      description: "Invite members via email or link, define their roles",
      icon: "👥"
    },
    {
      step: "03",
      title: "Start Saving",
      description: "Begin automated savings with real-time tracking",
      icon: "💰"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav
        style={{ backgroundColor: headerBg }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-shadow ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo with Animation */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg sm:text-xl">P</span>
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                PundX
              </motion.span>
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

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md hover:shadow-lg"
                >
                  Get started
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-600" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <a 
                  href="#how-it-works" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-gray-600 hover:text-gray-900"
                >
                  How it works
                </a>
                <a 
                  href="#features" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-gray-600 hover:text-gray-900"
                >
                  Features
                </a>
                <a 
                  href="#security" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-gray-600 hover:text-gray-900"
                >
                  Security
                </a>
                <div className="pt-4 space-y-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                      Sign in
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md">
                      Get started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Digitize Your Group
              </span>
              <br />
              <span className="text-gray-900">Savings with Confidence</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
              PundX helps communities, families, and organizations manage collective savings
              with transparency and automation. Replace manual bookkeeping with intelligent tools.
            </p>

            {/* CTA Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  Start free trial
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Sign in
                </motion.button>
              </Link>
            </div>

          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30" />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Simple, transparent process for digital savings management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{step.icon}</div>
                <div className="text-xs sm:text-sm font-semibold text-blue-600 mb-2">{step.step}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Comprehensive tools for modern group financial management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group p-5 sm:p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{feature.description}</p>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {feature.stats}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 sm:py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">
              Bank-Grade Security
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-2xl mx-auto px-4">
              Your data is protected with enterprise-level security measures
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
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
                  className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-gray-800 rounded-lg"
                >
                  <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-4 sm:space-x-6 mb-3 sm:mb-4">
            {[
              { icon: FiMail, href: "mailto:darshan@pundx.com", label: "Email" },
              { icon: FiLinkedin, href: "https://linkedin.com/in/spdarshan", label: "LinkedIn" },
              { icon: FiGithub, href: "https://github.com/spdarshan", label: "GitHub" },
              { icon: FiInstagram, href: "https://instagram.com/spdarshan252", label: "Instagram" }
            ].map((social, index) => (
              <motion.a
                key={index}
                whileHover={{ scale: 1.1, y: -2 }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.a>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mb-1">
            Developed by <span className="font-medium text-gray-700">S P Darshan</span>
          </p>

          <p className="text-xs text-gray-400">
            © 2026 PundX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;