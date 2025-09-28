import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../utils/supabase";

export const fetchPedidosPendenteFazer = async () => {
  // Busca pedidos com status 'pendente_fazer'
  const id = await AsyncStorage.getItem('id_aparelho');
  const adm = await AsyncStorage.getItem("adm");
  let query = supabase
      .from('pedidos')
      .select('*')
      .eq('status', 'pendente_fazer')
      .order('data', { ascending: true });

    // Adicione a condição de id_aparelho se o usuário não for admin
    if (!adm) {
      query = query.eq('id_aparelho', id);
    }

    // Execute a consulta
    const { data: pedidos, error: pedidosError } = await query;

  if (pedidosError) {
    console.error('Erro ao buscar pedidos:', pedidosError);
    return [];
  }

  // Para cada pedido, busca os itens, produtos e endereço relacionados
  const pedidosComDetalhes = await Promise.all(
    pedidos.map(async (pedido) => {
      // Busca itens do pedido
      const { data: itenspedido, error: itenspedidoError } = await supabase
        .from('itenspedido')
        .select('*')
        .eq('pedido_id', pedido.id);

      if (itenspedidoError) {
        console.error('Erro ao buscar itenspedido:', itenspedidoError);
        return { ...pedido, itenspedido: [], endereco: null };
      }

      // Busca o endereço relacionado ao pedido, se houver
      let endereco = null;
      if (pedido.id_endereco) {
        const { data: enderecoData, error: enderecoError } = await supabase
          .from('enderecos')
          .select('*')
          .eq('id', pedido.id_endereco)
          .single();

        if (enderecoError) {
          console.error('Erro ao buscar endereço:', enderecoError);
        } else {
          endereco = enderecoData;
        }
      }

      // Para cada item, busca o produto relacionado
      const itensComProdutos = await Promise.all(
        itenspedido.map(async (item) => {
          const { data: produto, error: produtoError } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', item.produto_id)
            .single();

          if (produtoError) {
            console.error('Erro ao buscar produto:', produtoError);
            return { ...item, produto: null };
          }

          return { ...item, produto };
        })
      );

      return { ...pedido, itenspedido: itensComProdutos, endereco };
    })
  );

  return pedidosComDetalhes;
};
