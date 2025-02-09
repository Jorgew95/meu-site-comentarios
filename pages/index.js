import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Conectar ao Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar comentários ao carregar a página
  useEffect(() => {
    async function fetchComentarios() {
      const { data } = await supabase.from("comentarios").select("*").order("id", { ascending: false });
      setComentarios(data || []);
      setLoading(false);
    }
    fetchComentarios();

    // ✅ Escutar novas inserções em tempo real
    const subscription = supabase
      .channel("comentarios")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comentarios" },
        (payload) => {
          setComentarios((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // Cleanup para evitar múltiplas assinaturas
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Enviar um novo comentário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !mensagem.trim()) return;

    const { error } = await supabase
      .from("comentarios")
      .insert([{ nome, mensagem }]);

    if (error) console.error("Erro ao enviar comentário:", error.message);

    setNome("");
    setMensagem("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", padding: "20px" }}>
      <h1>Comentários</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <textarea
          placeholder="Sua mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Enviar
        </button>
      </form>

      <h2>Últimos Comentários</h2>
      {loading ? (
        <p>Carregando comentários...</p>
      ) : (
        comentarios.map((c) => (
          <div key={c.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <strong>{c.nome}</strong>
            <p>{c.mensagem}</p>
          </div>
        ))
      )}
    </div>
  );
}
