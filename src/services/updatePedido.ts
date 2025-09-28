import supabase from "../utils/supabase";

export const atualizarStatusPedido = async (
  pedidoId: number,
  novoStatus: string
): Promise<void> => {
  const { error } = await supabase
    .from("pedidos")
    .update({ status: novoStatus })
    .eq("id", pedidoId);

  if (error) {
    console.error("Erro ao atualizar o status do pedido:", error);
  }
};
