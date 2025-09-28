import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as Print from 'expo-print';

const PrintExample = () => {

  const printHTML = async () => {
    try {
      await Print.printAsync({
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center;">
              <h1>Impressão para Impressora Térmica</h1>
              <p>Texto formatado para impressão em uma impressora térmica.</p>
              <!-- Adicione o conteúdo desejado aqui -->
            </body>
          </html>
        `,
        // Defina a orientação ou outras opções se necessário
        isLandscape: false,
        jobName: 'Documento de Impressão',
      });
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Imprimir Documento" onPress={printHTML} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

export default PrintExample;
