import React from 'react';
import Logo from '../assets/images/logo-GL-M.png'; // Logo Grupo Lavoro

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <header className="privacy-header">
        <img src={Logo} alt="Logo Câmara Municipal de Pacatuba" className="logo" />
        <h1>Política de Privacidade</h1>
        <p>Última atualização: 03 de Novembro de 2025</p>
      </header>
      <div className="privacy-content">
        <p>
          A Câmara Municipal de Pacatuba (CM Pacatuba), responsável pelo desenvolvimento e manutenção deste aplicativo (doravante “Aplicativo”), reconhece a importância da sua privacidade e se compromete a proteger os dados pessoais de todos os usuários, em total conformidade com a legislação aplicável, incluindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
        </p>
        <p>
          Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar o Aplicativo CM Pacatuba.
        </p>

        <h2>1. Do Controlador de Dados</h2>
        <p>
          O controlador dos dados pessoais coletados ou processados através deste Aplicativo é a Lavoro Serviços, inscrita no CNPJ sob o nº 45.140.973/0001-64.
        </p>
        <p>
          <strong>Contato do Encarregado de Dados (DPO):</strong>
        </p>
        <ul>
          <li>E-mail: contatos@lavoroservicos.com.br</li>
        </ul>

        <h2>2. Tipos de Dados Coletados</h2>

        <h3>2.1. Dados Pessoais (Coleta Mínima ou Nula)</h3>
        <p>
          Este Aplicativo é primariamente informativo e não exige cadastro ou login. Não coletamos dados pessoais identificáveis (como nome, CPF, endereço ou telefone) para o uso da maioria de seus recursos.
        </p>
        <p>
          A coleta de dados pessoais só ocorrerá se e quando você optar por utilizar funcionalidades específicas que requeiram identificação, como:
        </p>
        <ul>
          <li>
            <strong>Canais de Contato/Ouvidoria:</strong> Se você enviar uma mensagem por formulários de contato ou ouvidoria, podemos coletar seu nome e e-mail (ou outro dado fornecido) para responder à sua solicitação. Estes dados serão usados apenas para a finalidade de comunicação e resposta.
          </li>
        </ul>

        <h3>2.2. Dados de Uso e Diagnóstico (Dados Não Pessoais)</h3>
        <p>
          Para fins de melhoria da performance e estabilidade do Aplicativo, podemos coletar automaticamente informações que não identificam o usuário diretamente. Estes dados incluem:
        </p>
        <ul>
          <li>Informações sobre o dispositivo (modelo do hardware, sistema operacional, versão do Aplicativo).</li>
          <li>Endereço IP (coletado de forma anonimizada pelos serviços de análise).</li>
          <li>Dados de uso (tempo de acesso, quais seções foram visitadas, cliques em recursos legislativos).</li>
          <li>Dados de diagnóstico e relatórios de falhas ("crashes").</li>
        </ul>
        <p>
          Estes dados são processados por ferramentas de análise de terceiros (como Google Analytics ou Firebase), estritamente para medir a eficácia e corrigir erros do Aplicativo.
        </p>

        <h2>3. Finalidade do Uso dos Dados</h2>
        <p>
          Os dados que porventura venham a ser coletados serão utilizados exclusivamente para os seguintes fins:
        </p>
        <ul>
          <li><strong>Comunicação:</strong> Para responder a solicitações, dúvidas ou sugestões enviadas pelo usuário.</li>
          <li><strong>Melhoria do Serviço:</strong> Para analisar o uso do Aplicativo, identificar falhas e aprimorar a experiência do usuário.</li>
          <li><strong>Segurança e Manutenção:</strong> Garantir a funcionalidade, segurança e desempenho técnico do Aplicativo.</li>
          <li><strong>Cumprimento Legal:</strong> Atender a obrigações legais ou requisições judiciais.</li>
        </ul>

        <h2>4. Compartilhamento de Dados com Terceiros</h2>
        <p>
          A Câmara Municipal de Pacatuba não vende, aluga ou transfere seus dados pessoais a terceiros.
        </p>
        <p>
          O compartilhamento de dados se limita a:
        </p>
        <ul>
          <li><strong>Provedores de Serviço:</strong> Empresas que nos auxiliam na operação, como plataformas de hospedagem e ferramentas de análise (Google/Firebase), que processam dados em nosso nome e estão sujeitas a obrigações contratuais de confidencialidade e segurança.</li>
          <li><strong>Obrigação Legal:</strong> Quando exigido por lei, ordem judicial ou regulamentação governamental.</li>
        </ul>

        <h2>5. Armazenamento e Segurança</h2>
        <p>
          Os dados coletados são armazenados em servidores seguros, em ambientes controlados, e a CM Pacatuba implementa medidas de segurança técnicas e administrativas razoáveis para proteger as informações contra acesso não autorizado, divulgação, alteração ou destruição.
        </p>
        <p>
          Os dados são mantidos apenas pelo tempo estritamente necessário para cumprir a finalidade para a qual foram coletados, ou para o cumprimento de obrigações legais.
        </p>

        <h2>6. Direitos do Titular de Dados (LGPD)</h2>
        <p>
          Em conformidade com a LGPD, você possui os seguintes direitos em relação aos seus dados pessoais, que podem ser exercidos mediante contato com o DPO (Seção 1):
        </p>
        <ul>
          <li><strong>Confirmação e Acesso:</strong> Obter a confirmação de que seus dados estão sendo tratados e acessá-los.</li>
          <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
          <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Requisitar que seus dados sejam anonimizados, bloqueados ou eliminados (quando não forem essenciais para a finalidade legal do Aplicativo).</li>
          <li><strong>Revogação do Consentimento:</strong> Retirar o consentimento para o tratamento de seus dados, se aplicável.</li>
        </ul>

        <h2>7. Alterações a Esta Política</h2>
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas de privacidade ou na legislação. A data da "Última atualização" no topo desta página será revisada. Recomendamos que você revise esta Política regularmente. Alterações significativas serão comunicadas através do Aplicativo ou de canais de comunicação oficiais da Câmara.
        </p>

        <h2>8. Consentimento</h2>
        <p>
          Ao utilizar o Aplicativo CM Pacatuba, você concorda com os termos desta Política de Privacidade.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;