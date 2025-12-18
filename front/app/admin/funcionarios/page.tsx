'use client';
import { useState, useEffect } from 'react';
import { useFuncionarios } from '@/context/funcionarios-context';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function FuncionariosPage() {
  const {
    funcionario,
    carregarFuncionario,
    criarFuncionario,
    atualizarFuncionario,
    excluirFuncionario,
  } = useFuncionarios();

  const [modalCriar, setModalCriar] = useState(false);
  const { verificarUsuario, user } = useAuth();
  const router = useRouter();
  const [modalEditar, setModalEditar] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<any>(null);

  const [form, setForm] = useState({
    nome: '',
    tipo_user: '',
    telefone: '',
    cpf: '',
    senha: '',
  });
  useEffect(() => {
    const checarUsuario = async () => {
      const backendUser = await verificarUsuario(); // usa o cookie enviado automaticamente
      if (!backendUser || backendUser.tipo_user !== 'admin') {
        router.replace('/perfil'); // redireciona se não for autorizado
      } else {
        setIsAuthorized(true); // libera acesso à tela
      }
    };

    checarUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    const init = async () => {
      await carregarFuncionario();
    };

    init();
  }, [isAuthorized]);

  const abrirEditar = (f: any) => {
    setFuncionarioSelecionado(f);
    setForm({
      nome: f.nome,
      tipo_user: f.tipo_user,
      telefone: f.telefone,
      cpf: f.cpf,
      senha: f.senha || '',
    });
    setModalEditar(true);
  };
  const abrirModalCriar = () => {
    setForm({
      nome: '',
      tipo_user: 'Selecione o cargo',
      telefone: '',
      cpf: '',
      senha: '',
    });
    setModalCriar(true);
  };
  const handleCriar = async () => {
    await criarFuncionario(form);
    setModalCriar(false);
    setForm({ nome: '', tipo_user: '', telefone: '', cpf: '', senha: '' });
  };

  const handleEditar = async () => {
    if (!funcionarioSelecionado) return;
    await atualizarFuncionario(funcionarioSelecionado.id, form);
    setModalEditar(false);
    setFuncionarioSelecionado(null);
  };
  const handleConfirmarExclusao = async () => {
    if (!funcionarioSelecionado) return;
    await excluirFuncionario(funcionarioSelecionado.id);
    setConfirmandoExclusao(false);
    setModalEditar(false);
  };
  if (!isAuthorized) {
    return null; // ou um loading simples enquanto verifica
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Funcionários</h1>

      <div className="px-2 py-2 mt-4 flex rounded mb-4">
        <button
          onClick={() => abrirModalCriar()}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <PlusCircle size={20} />
          Adicionar Funcionario
        </button>
      </div>

      <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="p-3 text-left font-semibold">Nome</th>
            <th className="p-3 text-left font-semibold">Cargo</th>
            <th className="p-3 text-left font-semibold">Telefone</th>
            <th className="p-3 text-left font-semibold">CPF</th>
            <th className="p-3 text-left font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {funcionario.map((f) => (
            <tr
              key={f.id}
              className="border-b last:border-none hover:bg-gray-50 transition"
            >
              <td className="p-3 border border-gray-200 rounded-l-lg">
                {f.nome}
              </td>
              <td className="p-3 border border-gray-200">{f.tipo_user}</td>
              <td className="p-3 border border-gray-200">{f.telefone}</td>
              <td className="p-3 border border-gray-200">{f.cpf}</td>
              <td className="p-3 border border-gray-200 rounded-r-lg">
                <div className="flex gap-2 justify-left">
                  <button
                    onClick={() => abrirEditar(f)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Criar / Editar */}
      {(modalCriar || modalEditar) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          {/* Confirmação de exclusão */}
          {confirmandoExclusao && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Tem certeza que deseja excluir este funcionário?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Esta ação não poderá ser desfeita.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setConfirmandoExclusao(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarExclusao}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal principal */}
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 relative z-40">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {modalEditar ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h2>

            {/* Campos */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <select
                value={form.tipo_user}
                onChange={(e) =>
                  setForm({ ...form, tipo_user: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-white text-gray-700"
              >
                <option value="">Selecione o cargo</option>
                <option value="admin">Admin</option>
                <option value="cozinha">Cozinha</option>
                <option value="atendente">Atendente</option>
              </select>
              <input
                type="text"
                placeholder="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="CPF"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Rodapé */}
            <div className="flex justify-between mt-6">
              {/* Botão de excluir aparece apenas no modo edição */}
              {modalEditar && (
                <button
                  onClick={() => setConfirmandoExclusao(true)}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  Excluir
                </button>
              )}

              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    setModalCriar(false);
                    setModalEditar(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={modalEditar ? handleEditar : handleCriar}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  {modalEditar ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
