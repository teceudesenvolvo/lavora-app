import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  UserCheck, 
  Database, 
  Mail, 
  ArrowLeft,
  ChevronRight,
  Info
} from 'lucide-react';

const App = () => {
  const [lastUpdate] = useState(new Date().toLocaleDateString('pt-PT'));
  
  // Exemplo de estado para simular navegação ou interatividade
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "Informações que Recolhemos",
      icon: <Database className="w-5 h-5" />,
      content: "Podemos recolher dados de identificação (Nome, e-mail, telefone), dados de localização (apenas com permissão) e dados de uso para melhorar a sua experiência no aplicativo."
    },
    {
      id: 2,
      title: "Finalidade do Tratamento",
      icon: <Eye className="w-5 h-5" />,
      content: "Os dados são utilizados para gestão de voluntários, envio de propostas, localização de zonas eleitorais e cumprimento de obrigações legais."
    },
    {
      id: 3,
      title: "Partilha de Dados",
      icon: <Lock className="w-5 h-5" />,
      content: "Não vendemos os seus dados. Partilhamos apenas com fornecedores de infraestrutura técnica necessários para o funcionamento do serviço."
    },
    {
      id: 4,
      title: "Os Seus Direitos (LGPD)",
      icon: <UserCheck className="w-5 h-5" />,
      content: "Tem direito a aceder, corrigir, eliminar ou revogar o consentimento do uso dos seus dados a qualquer momento."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header / Navigation Mock */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button className="flex items-center text-slate-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg tracking-tight">Privacidade</span>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            A sua privacidade é a nossa prioridade. Entenda como protegemos os seus dados de acordo com a LGPD.
          </p>
          <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
            Última atualização: {lastUpdate}
          </div>
        </header>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div 
              key={section.id}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                activeSection === section.id 
                  ? 'border-blue-400 shadow-lg ring-1 ring-blue-400' 
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              <button 
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full text-left p-6 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {section.icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{section.title}</h3>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
              </button>
              
              {activeSection === section.id && (
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4 animate-in fade-in slide-in-from-top-2">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Informações de Contacto */}
        <section className="mt-12 bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Dúvidas ou Pedidos?</h2>
              <p className="text-blue-100">
                A nossa equipa de proteção de dados está pronta para ajudar.
              </p>
            </div>
            <a 
              href="mailto:privacidade@campanha.com" 
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Contactar DPO</span>
            </a>
          </div>
        </section>

        {/* Footer Text */}
        <footer className="mt-12 text-center text-slate-400 text-sm space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Info className="w-4 h-4" />
            <span>Este documento segue as diretrizes da Lei Geral de Proteção de Dados (Brasil).</span>
          </div>
          <p>© {new Date().getFullYear()} Nome do Candidato/Partido. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;