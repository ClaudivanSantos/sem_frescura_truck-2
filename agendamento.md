CREATE OR REPLACE FUNCTION delete_old_records() RETURNS void AS $$
BEGIN
  -- Excluir itens do pedido que estão associados a pedidos mais antigos do que um mês
  DELETE FROM itens_pedido
  WHERE pedido_id IN (
    SELECT id FROM pedidos WHERE data < NOW() - INTERVAL '1 month'
  );

  -- Excluir endereços somente se não estiverem mais associados a nenhum pedido
  DELETE FROM enderecos
  WHERE id IN (
    SELECT id_endereco FROM pedidos WHERE data < NOW() - INTERVAL '1 month'
  )
  AND id NOT IN (
    SELECT DISTINCT id_endereco FROM pedidos WHERE data >= NOW() - INTERVAL '1 month'
  );

  -- Excluir pedidos mais antigos do que um mês
  DELETE FROM pedidos
  WHERE data < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;


CREATE EXTENSION pg_cron;

SELECT cron.schedule('0 0 1 * *', 'SELECT delete_old_records();');

