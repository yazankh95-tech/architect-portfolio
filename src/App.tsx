import { useState, useEffect } from 'react';
import { WebGLShader } from './components/WebGLShader';
import { ChevronDown, ArrowRight, Mail, MessageSquare } from 'lucide-react';
import './index.css';
import { projects } from './data/projectsData';
import type { Project } from './data/projectsData';
import ProjectModal from './components/ProjectModal';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the section is visible
        rootMargin: '-10% 0px -10% 0px' // Offset margins for better visual transitions
      }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  const openModal = (project: Project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <WebGLShader />

      <header>
        <div className="container nav-content">
          <div className="logo">YK <span className="text-accent">Design</span></div>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="#work">Work</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container hero" id="home">
          <div className="hero-content">
            <div className="hero-text">
              <h1 style={{ lineHeight: '1.2' }}>
                Hi, I'm Yazan<br />
                <span className="text-accent">Alkhawandi</span>
              </h1>
              <p className="hero-subtitle">
                An Architect crafting quiet, material-led interiors and residences. I work fluently across AutoCAD, Revit, SketchUp and Lumion — blending traditional drafting with AI-assisted design to compose spaces that feel both inevitable and human.
              </p>
              <a href="#work" className="glass-panel" style={{ padding: '1.5rem 3rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                Explore My Work <ArrowRight size={20} className="text-accent" />
              </a>
            </div>
            <div className="hero-image">
              <img src="/Personal Image/founder.jpeg" alt="Yazan Alkhawandi" />
            </div>
          </div>
          <div className="scroll-indicator">
            <ChevronDown size={32} />
          </div>
        </section>

        {/* Projects Section */}
        <section className="container" id="work">
          <h2>Selected <span className="text-accent">Works</span></h2>
          <div className="projects-grid">
            {projects.map((project, i) => (
              <div className="project-card" key={i} onClick={() => openModal(project)} style={{ cursor: 'pointer' }}>
                <img src={project.img} alt={project.title} />
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <p>{project.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="container" id="skills">
          <h2>My <span className="text-accent">Skills</span></h2>
          <div className="skills-grid">
            {[
              { name: 'AutoCAD', icon: '/icons/autocad.png' },
              { name: 'Lumion', icon: '/icons/lumion.png' },
              { name: 'SketchUp', icon: '/icons/sketchup.png' },
              { name: 'Revit', icon: '/icons/revit.png' },
              { name: 'AI', icon: '/icons/ai.png' }
            ].map((skill, i) => (
              <div className="glass-panel skill-card" key={i}>
                <div className="skill-icon">
                  <img src={skill.icon} alt={skill.name} />
                </div>
                <h3>{skill.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="container contact-section" id="contact">
          <h2>Let's build together.</h2>
          <div className="contact-actions" style={{ margin: '2rem 0' }}>
            <a href="mailto:yazankh.95@gmail.com?subject=Contact%20from%20Portfolio&body=Hi%20Yazan%2C%0A%0AI%20visited%20your%20portfolio%20and%20would%20like%20to%20get%20in%20touch.%0A%0A" className="contact-link contact-action" title="Send me an email">
              <Mail size={18} />
              <span>Contact by Email</span>
            </a>

            <a href="https://wa.me/966534782775" className="contact-link contact-action" target="_blank" rel="noreferrer">
              <MessageSquare size={18} />
              <span>Click Here to Contact By WhatsApp</span>
            </a>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Riyadh, Saudi Arabia</p>
        </section>
      </main>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={closeModal} />
      )}
    </>
  );
}

export default App;
