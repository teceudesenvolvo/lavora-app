import React, { useState } from 'react';

const Cotacao = () => {
  const [produto, setProduto] = useState('Plano de Saude');
  const [detalhesProduto, setDetalhesProduto] = useState({});
  const [mensagem, setMensagem] = useState('');
  // Dados de exemplo para o histórico
  const [solicitacoes, setSolicitacoes] = useState([
    { id: 1, produto: 'Seguro Auto', data: '20/10/2025', status: 'Em Análise' },
    { id: 2, produto: 'Plano de Saúde', data: '15/09/2025', status: 'Concluída' },
  ]);

  const handleProdutoChange = (e) => {
    setProduto(e.target.value);
    setDetalhesProduto({}); // Reseta os detalhes ao trocar de produto
  };

  const handleDetalhesChange = (e) => {
    const { name, value } = e.target;
    setDetalhesProduto(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de envio para API (usando o ID do usuário logado)
    const dadosCotacao = {
      produto,
      detalhes: detalhesProduto,
      mensagem,
    };
    alert(`Solicitação de cotação para ${produto} enviada com sucesso!`);
    console.log('Dados da Cotação:', dadosCotacao);

    // Adiciona a nova solicitação ao histórico
    const novaSolicitacao = {
      id: solicitacoes.length + Date.now(), // ID simples para o exemplo
      produto: produto,
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'Enviada'
    };
    setSolicitacoes(prevSolicitacoes => [novaSolicitacao, ...prevSolicitacoes]);

    // Limpa os campos do formulário após o envio
    setDetalhesProduto({});
    setMensagem('');
  };

  const renderCamposProduto = () => {
    switch (produto) {
      case 'Plano de Saude':
        return (
          <>
            <div className="form-group">
              <label htmlFor="vidas">Número de Vidas</label>
              <input type="number" id="vidas" name="vidas" value={detalhesProduto.vidas || ''} onChange={handleDetalhesChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="idades">Idade dos Titulares</label>
              <input type="text" id="idades" name="idades" placeholder="Ex: 34, 28" value={detalhesProduto.idades || ''} onChange={handleDetalhesChange} required />
            </div>
          </>
        );
      case 'Seguro de Vida':
        return (
          <>
            <div className="form-group">
              <label htmlFor="dataNascimento">Data de Nascimento</label>
              <input type="date" id="dataNascimento" name="dataNascimento" value={detalhesProduto.dataNascimento || ''} onChange={handleDetalhesChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="profissao">Profissão</label>
              <input type="text" id="profissao" name="profissao" value={detalhesProduto.profissao || ''} onChange={handleDetalhesChange} required />
            </div>
          </>
        );
      case 'Seguro Auto':
        return (
          <>
            <div className="form-group">
              <label htmlFor="modeloVeiculo">Modelo do Veículo</label>
              <input type="text" id="modeloVeiculo" name="modeloVeiculo" value={detalhesProduto.modeloVeiculo || ''} onChange={handleDetalhesChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="anoVeiculo">Ano de Fabricação</label>
              <input type="number" id="anoVeiculo" name="anoVeiculo" placeholder="Ex: 2023" value={detalhesProduto.anoVeiculo || ''} onChange={handleDetalhesChange} required />
            </div>
          </>
        );
      case 'Seguro Viagem':
        return (
          <>
            <div className="form-group">
              <label htmlFor="destino">Destino</label>
              <input type="text" id="destino" name="destino" value={detalhesProduto.destino || ''} onChange={handleDetalhesChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="dataIda">Data de Ida</label>
              <input type="date" id="dataIda" name="dataIda" value={detalhesProduto.dataIda || ''} onChange={handleDetalhesChange} required />
            </div>
          </>
        );
      case 'Seguro Residencial':
        return (
          <div className="form-group full-width">
            <label htmlFor="enderecoImovel">Endereço do Imóvel (com CEP)</label>
            <input type="text" id="enderecoImovel" name="enderecoImovel" value={detalhesProduto.enderecoImovel || ''} onChange={handleDetalhesChange} required />
          </div>
        );
      case 'Consorcio':
        return (
          <div className="form-group">
            <label htmlFor="valorCredito">Valor do Crédito Desejado</label>
            <input type="number" id="valorCredito" name="valorCredito" placeholder="Ex: 100000" value={detalhesProduto.valorCredito || ''} onChange={handleDetalhesChange} required />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="cotacao-container">
        <h2 className="faturas-section-title">Solicitar Cotação</h2>
        <p className="cotacao-subtitle">Preencha o formulário abaixo e nossa equipe entrará em contato com a melhor proposta para você.</p>
        <form className="cotacao-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label htmlFor="produto">Produto de Interesse</label>
            <select id="produto" name="produto" value={produto} onChange={handleProdutoChange}>
              <option value="Plano de Saude">Plano de Saúde</option>
              <option value="Seguro de Vida">Seguro de Vida</option>
              <option value="Seguro Auto">Seguro Auto</option>
              <option value="Seguro Viagem">Seguro Viagem</option>
              <option value="Seguro Residencial">Seguro Residencial</option>
              <option value="Consorcio">Consórcio</option>
            </select>
          </div>
          {renderCamposProduto()}
          <div className="form-group full-width">
            <label htmlFor="mensagem">Mensagem (opcional)</label>
            <textarea id="mensagem" name="mensagem" rows="4" value={mensagem} onChange={(e) => setMensagem(e.target.value)}></textarea>
          </div>
          <button type="submit" className="btn-enviar-cotacao">Enviar Solicitação</button>
        </form>
      </div>

      <div className="solicitacoes-container">
        <h2 className="faturas-section-title">Minhas Cotações Solicitadas</h2>
        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Data da Solicitação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoes.map(sol => (
                <tr key={sol.id}>
                  <td>{sol.produto}</td>
                  <td>{sol.data}</td>
                  <td>
                    <span className={`status-badge status--${sol.status.toLowerCase().replace(' ', '-')}`}>{sol.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Cotacao;