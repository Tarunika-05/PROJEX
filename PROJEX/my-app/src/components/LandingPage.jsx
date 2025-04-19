import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";

import {
  ArrowRight,
  ChevronRight,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  MessageSquare,
  Bell,
  BarChart,
  Menu,
  X,
  ArrowUpRight,
  Shield,
  Globe,
  Zap,
  Star,
  DollarSign,
  CheckSquare,
  Cloud,
} from "lucide-react";
import { Camera } from "lucide-react";

const SaasLanding = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [graphData, setGraphData] = useState(
    Array(12)
      .fill(0)
      .map(() => Math.random() * 100)
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    const interval = setInterval(() => {
      setGraphData((prev) => [...prev.slice(1), Math.random() * 100]);
    }, 2000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  const FloatingCard = ({ style, children }) => (
    <div
      className="absolute bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 hidden md:block"
      style={{
        transform: `translate(${mousePosition.x * style.multiplier}px, ${
          mousePosition.y * style.multiplier
        }px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );

  const GraphCard = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Project Progress</h3>
        <Camera size={20} className="text-indigo-600" />
      </div>
      <div className="h-32 flex items-end space-x-1">
        {graphData.map((value, i) => (
          <div
            key={i}
            className="flex-1 bg-indigo-600 rounded-t transition-all duration-500"
            style={{ height: `${value}%`, opacity: 0.1 + i / graphData.length }}
          />
        ))}
      </div>
    </div>
  );

  const TaskCard = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg w-64">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">Current Tasks</span>
        <Camera size={16} className="text-indigo-600" />
      </div>
      {[
        { text: "Design Review", status: "completed" },
        { text: "Team Meeting", status: "pending" },
      ].map((task, i) => (
        <div key={i} className="flex items-center mb-2">
          <Camera
            size={16}
            className={
              task.status === "completed" ? "text-green-500" : "text-gray-300"
            }
          />
          <span className="ml-2 text-sm text-gray-700">{task.text}</span>
        </div>
      ))}
    </div>
  );

  const NavItem = ({ label, sectionId }) => (
    <a
      href={`#${sectionId}`}
      className="relative px-4 py-2 group cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100,
            behavior: "smooth",
          });
          setMobileMenuOpen(false);
        }
      }}
    >
      <span className="relative z-10 text-gray-700 group-hover:text-indigo-600 transition-colors">
        {label}
      </span>
      <div className="absolute inset-0 h-1 w-0 bg-indigo-100 group-hover:w-full transition-all duration-300 bottom-0 rounded-full" />
    </a>
  );

  <div className="hidden md:flex items-center space-x-2">
    <NavItem label="Features" sectionId="features" />
    <NavItem label="Pricing" sectionId="pricing" />
    <NavItem label="About" sectionId="dashboard" />
    <NavItem label="Contact" sectionId="faq" />

    <Link to="/signup" className="w-full">
      <button className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
        Get Started
      </button>
    </Link>
  </div>;

  const DashboardPreview = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-indigo-600 mb-2">
            Active Projects
          </h4>
          <p className="text-2xl font-bold text-gray-800">24</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-purple-600 mb-2">
            Team Members
          </h4>
          <p className="text-2xl font-bold text-gray-800">12</p>
        </div>
        <div className="bg-pink-50 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-pink-600 mb-2">
            Tasks Complete
          </h4>
          <p className="text-2xl font-bold text-gray-800">89%</p>
        </div>
      </div>
      <GraphCard />
    </div>
  );

  const TestimonialCard = ({ name, role, content }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {name[0]}
        </div>
        <div className="ml-3">
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 italic">{content}</p>
      <div className="flex mt-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={16} className="text-yellow-400 fill-current" />
        ))}
      </div>
    </div>
  );

  const PricingCard = ({ tier, price, features }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:scale-105 transition-all duration-300">
      <h3 className="text-xl font-semibold mb-2">{tier}</h3>
      <div className="flex items-baseline mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-600 ml-2">/month</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-600">
            <CheckSquare size={16} className="text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>

      <Link to="/signup" className="w-full">
        <button
          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "py-4 bg-white/80 backdrop-blur-lg shadow-sm" : "py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ScrollLink to="hero" smooth={true} duration={500}>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer">
                  PROJEX
                </span>
              </ScrollLink>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <NavItem label="Features" sectionId="features" />
              <NavItem label="Dashboard" sectionId="solutions" />
              <NavItem label="Testimonials" sectionId="users" />
              <NavItem label="Pricing" sectionId="pricing" />
              <NavItem label="FAQ" sectionId="faq" />
              <NavItem label="Contact" sectionId="contact" />

              <Link to="/signup" className="ml-4">
                <button className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
                  Get Started
                </button>
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <Camera size={24} /> : <Camera size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto relative">
            {/* Animated Blobs */}
            <div
              className="absolute top-0 -left-32 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
              style={{
                transform: `translate(${mousePosition.x * -1.2}px, ${
                  mousePosition.y * -1.2
                }px)`,
              }}
            />
            <div
              className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
              style={{
                transform: `translate(${mousePosition.x * 1.2}px, ${
                  mousePosition.y * -1.2
                }px)`,
              }}
            />
            <div
              className="absolute -bottom-32 left-32 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
              style={{
                transform: `translate(${mousePosition.x * -1.2}px, ${
                  mousePosition.y * 1.2
                }px)`,
              }}
            />

            {/* Floating Cards */}
            <FloatingCard
              style={{
                top: "10%",
                left: "-20%",
                multiplier: -1.5,
                width: "280px",
              }}
            >
              <TaskCard />
            </FloatingCard>

            <FloatingCard
              style={{
                top: "30%",
                right: "-20%",
                multiplier: 1.5,
                width: "300px",
              }}
            >
              <GraphCard />
            </FloatingCard>

            <FloatingCard
              style={{
                bottom: "20%",
                left: "-15%",
                multiplier: -1,
                width: "200px",
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800">
                  15 team members online
                </span>
              </div>
            </FloatingCard>

            <FloatingCard
              style={{
                bottom: "30%",
                right: "-15%",
                multiplier: 1,
                width: "200px",
              }}
            >
              <div className="flex items-center space-x-2">
                <Camera size={20} className="text-indigo-600" />
                <span className="text-sm font-medium text-gray-800">
                  Real-time collaboration
                </span>
              </div>
            </FloatingCard>

            {/* Hero Content */}
            <h1 className="px-10 text-6xl md:text-7xl font-bold mb-6 leading-tight relative ml-10">
              Project Management
              <span className="py-5 block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Harness the power of AI to streamline your workflow. Built for
              modern teams who demand excellence.
            </p>

            <div className="ml-12 px-10 py-2 flex flex-col sm:flex-row justify-center gap-2 relative z-10 p-15">
              <Link to="/signup" className="w-full ">
                <button className="ml-12 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center group">
                  Start Free Trial
                  <Camera
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </button>
              </Link>
              <Link to="/signup" className="w-full">
                <button className="ml-12 px-10 py-4 bg-white/50 backdrop-blur-sm rounded-xl font-medium text-gray-700 hover:bg-white/70 transition-all flex items-center justify-center ">
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-grid-slate-200/20 [mask-image:linear-gradient(0deg,transparent,black)] -z-10" />
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/30" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage projects efficiently and boost team
              productivity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Powerful Task Management",
                description:
                  "Organize projects with a Kanban board, timeline, and automated progress tracking.",
              },
              {
                icon: Globe,
                title: "Seamless Team Collaboration ",
                description:
                  "Real-time chat, AI-powered assistant, and smart notifications keep teams in sync.",
              },
              {
                icon: Cloud,
                title: "Scalable & Intelligent",
                description:
                  "Cloud-based, real-time updates with Firebase, automated reports, and AI-driven insights.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:scale-105 transition-all"
              >
                <feature.icon className="text-indigo-600 mb-4" size={24} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div
        className="py-20 bg-gradient-to-b from-white/30 to-indigo-50/30"
        id="solutions"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Intuitive Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a bird's eye view of your projects with our powerful dashboard
            </p>
          </div>
          <DashboardPreview />
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white/30" id="users">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied teams already using PROJEX
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Harshini"
              role="Product Manager at TechCorp"
              content="PROJEX has transformed how our team collaborates. The AI-powered insights have been a game-changer for our productivity."
            />
            <TestimonialCard
              name="Tarunika"
              role="CTO at StartupX"
              content="The best project management tool we've used. The interface is intuitive and the features are exactly what we needed."
            />
            <TestimonialCard
              name="Jayaram"
              role="Team Lead at DesignCo"
              content="Security was our top concern, and PROJEX delivered. Plus, the global collaboration features are outstanding."
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div
        className="py-20 bg-gradient-to-b from-white/30 to-indigo-50/30"
        id="pricing"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best fits your team's needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              tier="Starter"
              price="29"
              features={[
                "Up to 10 team members",
                "5 active projects",
                "Basic analytics",
                "24/7 support",
              ]}
            />
            <PricingCard
              tier="Professional"
              price="79"
              features={[
                "Up to 50 team members",
                "Unlimited projects",
                "Advanced analytics",
                "Priority support",
                "Custom integrations",
              ]}
            />
            <PricingCard
              tier="Enterprise"
              price="199"
              features={[
                "Unlimited team members",
                "Unlimited projects",
                "AI-powered insights",
                "Dedicated support",
                "Custom solutions",
                "SSO & advanced security",
              ]}
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white/30" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about PROJEX
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "How does the free trial work?",
                a: "Start with a 14-day free trial of our Professional plan. No credit card required. Cancel anytime.",
              },
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What kind of support do you offer?",
                a: "We provide 24/7 email support for all plans, with priority support and dedicated account managers for Professional and Enterprise plans.",
              },
              {
                q: "Is my data secure?",
                a: "We use bank-grade encryption and follow industry best practices for security. Your data is stored in secure, SOC 2 certified data centers.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div
        className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 relative overflow-hidden"
        id="contact"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxMyAwIDYtMi42ODcgNi02cy0yLjY4Ny02LTYtNi02IDIuNjg3LTYgNiAyLjY4NyA2IDYgNnptMCAwIiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==')] bg-repeat" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Project Management?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of teams already using PROJEX to boost their
              productivity
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="w-full">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium hover:bg-opacity-90 transition-all flex items-center justify-center group">
                  Start Free Trial
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/signup" className="w-full">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-all">
                  Schedule Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 md:mb-0">
                PROJEX
              </div>
              <div className="text-gray-400">
                © 2024 PROJEX. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaasLanding;
