using System;

namespace PrimeiroProjeto
{
    internal class ExFixacao
    {
        static void Main(string[] args)
        {

            string produto1 = "Computador";
            string produto2 = "Mesa de escritório";

            byte idade = 30;
            int codigo = 5290;
            char genero = 'M';

            double preco1 = 2100.0;
            double preco2 = 650.50;
            double medida = 53.234567;


            //Produtos:
            Console.WriteLine($" {produto1} cujo preço é $ {preco1},00 ");
            Console.WriteLine($" {produto2} cujo preço é ${preco2},00 ");
            Console.WriteLine($" Registro: {idade} anos de idade, código {codigo} e gênero: {genero}");
            Console.WriteLine($" Medida: {medida} com oito casas decimais: {medida:F8} ");
            Console.WriteLine();
            Console.WriteLine($" Arredondado: (Três casas decimais {medida:F3} ");
            Console.WriteLine($" Separador decimal invariant culture: {
  medida.ToString("F3", 
  System.Globalization.CultureInfo.InvariantCulture) } ");







        }
    }
}
