import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nome, mensagem } = req.body;
    const { data, error } = await supabase
      .from("comentarios")
      .insert([{ nome, mensagem }]);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json(data);
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("comentarios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(data);
  }

  res.status(405).json({ error: "Método não permitido" });
}
