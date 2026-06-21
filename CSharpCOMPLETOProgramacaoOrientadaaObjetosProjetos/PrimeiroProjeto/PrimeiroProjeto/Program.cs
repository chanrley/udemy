using System;

namespace MyApp
{
    internal class Program
    {
        static void Main(string[] args)
        {
            string nome = "Helena";
            Console.WriteLine("{0} tem 6 anos", nome); // com placeholders
            Console.WriteLine($"{ nome } tem 6 anos"); // interpolação de string, a partir do C# 6.0, usando o símbolo $ antes da string
            Console.WriteLine("Eu sou a " + nome + " e tenho 6 anos");



        }
    }
}