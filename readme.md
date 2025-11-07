# Containor

Containor é uma biblioteca para JavaScript que fornece uma forma poderosa e flexível de organizar, armazenar e manipular pares de chave-valor. Ela inclui duas classes principais: **Containor** e **ContainorArray**, permitindo criar coleções avançadas e arrays com métodos adicionais para controle e transformação de dados.

> Containor é uma variação de Container, feita de propósito. A palavra 'contain' transmite a ideia de algo que guarda ou organiza coisas, e o sufixo '-or' dá a sensação de ação ou propósito. Ou seja, o Containor não é apenas um recipiente — ele contém com intenção, de forma ativa e controlada.

---

## Instalação

```bash
npm install containor
```

---

## Containor

A classe principal para armazenar pares chave-valor com métodos avançados inspirados em arrays e mapas.

### Exemplos de uso:

```js
import Containor from 'containor';

const myContainor = new Containor({ key1: 'value1', key2: 'value2', key3: 'value3' });
```

### Principais métodos:

- **set(key, value)**  
  Adiciona ou atualiza um par chave-valor.  
  ```js
  myContainor.set('key4', 'value4');
  ```

- **get(key)**  
  Retorna o valor associado a uma chave, ou `null` se não existir.  
  ```js
  myContainor.get('key1'); // 'value1'
  ```

- **has(...keys)**  
  Verifica se o containor possui as chaves fornecidas. Retorna booleano se uma chave, ou ContainorArray de booleanos com propriedades `hasAll` e `hasAny` se várias chaves.  
  ```js
  myContainor.has('key1'); // true
  myContainor.has('key1', 'missingKey'); // [true, false] com hasAll e hasAny
  ```

- **first(amount)** / **last(amount)**  
  Retorna os primeiros ou últimos pares chave-valor. Pode retornar um objeto único ou um novo Containor com múltiplos pares.  
  ```js
  myContainor.first(); // { key: "key1", value: "value1" }
  myContainor.last(2); // Containor { key2: "value2", key3: "value3" }
  ```

- **filter(func)** / **partition(func)**  
  Filtra ou divide o containor baseado em condições. Retorna novos containors sem alterar o original.  
  ```js
  const filtered = myContainor.filter((v, k) => v.startsWith('value'));
  const [matching, nonMatching] = myContainor.partition((v) => v.includes('value2'));
  ```

- **map(func)**  
  Retorna um **ContainorArray** com os valores transformados por uma função.  
  ```js
  const upper = myContainor.map(v => v.toUpperCase());
  ```

- **sort(func)**  
  Ordena os pares chave-valor com base em função de comparação. Modifica o containor original.  
  ```js
  myContainor.sort((a, b) => a.localeCompare(b));
  ```

- **delete(...keys)**  
  Remove pares do containor com base em chaves ou função de condição. Retorna o número de pares deletados.  
  ```js
  myContainor.delete('key1', 'key2');
  ```

- **toJSON()**  
  Converte o containor em um objeto JSON simples.  
  ```js
  const json = myContainor.toJSON();
  ```

---

##  ContainorArray

Extensão de **Array** com métodos adicionais para manipulação e análise de dados.

### Exemplos de uso:

```js
import { ContainorArray } from 'containor';

const arr = new ContainorArray(1, 2, 3, 4, 5);
```

### Principais métodos:

- **first() / last()**  
  Retorna o primeiro ou último item.  
  ```js
  arr.first(); // 1
  arr.last();  // 5
  ```

- **delete(...values) / deleteAt(...indices)**  
  Remove itens específicos ou por índice.  
  ```js
  arr.delete(2, 4);
  arr.deleteAt(0, 2);
  ```

- **shuffle()**  
  Retorna uma nova ContainorArray com os itens embaralhados.  
  ```js
  arr.shuffle();
  ```

- **average()**  
  Retorna a média dos valores numéricos.  
  ```js
  arr.average();
  ```

- **chunk(size)**  
  Divide a array em várias ContainorArrays menores de tamanho fixo.  
  ```js
  arr.chunk(2);
  ```

- **random(quantity)**  
  Retorna uma nova ContainorArray com elementos aleatórios.  
  ```js
  arr.random(3);
  ```

- **removeDuplicates(arrayDefault, ...ignore)**  
  Remove duplicados, podendo ignorar certos valores.  
  ```js
  arr.removeDuplicates(arr, 5);
  ```

- **map(func)**  
  Retorna uma ContainorArray com os valores transformados.  
  ```js
  arr.map(x => x * 2);
  ```

---

## - Recursos

- Armazenamento de pares chave-valor de forma flexível e inteligente
- Métodos inspirados em Map e Array
- Iteração customizável
- Transformações de dados avançadas
- Compatível com Node.js e navegadores modernos
- Fácil integração com NPM e bundlers

---

## 🧠 Inspeção customizada

O `Containor` implementa um `Symbol.for("nodejs.util.inspect.custom")` para exibir  
um preview bonito e limitado no console:

```
Containor {
  key1: 'value1',
  key2: 'value2',
  '+3 more': '...'
}
```

---

## 🧾 Licença

MIT © 2025 [Suouzuki](https://github.com/suouzuki)

---

## 💬 Créditos

> Desenvolvido com 💜, por **Suouzuki**, um projeto feito para aprendizado, desempenho e praticidade em estruturas de dados.

---

