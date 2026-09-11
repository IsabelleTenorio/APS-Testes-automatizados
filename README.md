# Scholarship Eligibility Evaluator — Testes e Análise de Mutação (JavaScript)

## Estrutura do projeto
```
scholarship-js/
├── src/ScholarshipEligibilityEvaluator.js   # sistema-base (não alterar a lógica)
├── test/evaluate.test.js                    # suíte de testes Jest
├── package.json
├── stryker.conf.json                        # config da análise de mutação
└── README.md
```

## Pré-requisitos
- Node.js 18+ e npm instalados

## Instalação
```bash
cd scholarship-js
npm install
```

## Como rodar os testes
Comando principal:
```bash
npm test
```
Isso executa a suíte Jest com relatório de cobertura (`--coverage`).

Para rodar um único arquivo ou usar o watch mode:
```bash
npx jest test/evaluate.test.js
npx jest --watch
```

## Como rodar a análise de mutação
```bash
npm run mutation
```
(equivalente a `npx stryker run`)

O relatório é gerado em `reports/mutation/html/index.html` — abra no navegador
para ver, mutante a mutante, quais sobreviveram e o diff exato da mutação
aplicada em cada linha.

### Fluxo recomendado para a atividade
1. Rode `npm run mutation` e anote o **score inicial** (mostrado no terminal
   e no relatório HTML).
2. Abra o relatório e liste os mutantes sobreviventes (`Survived`).
3. Para cada um analisado, classifique como:
   - **Equivalente**: a alteração não muda a saída observável em nenhum
     cenário possível (explique por quê no relatório).
   - **Lacuna**: a suíte deveria matá-lo — escreva um novo teste em
     `test/evaluate.test.js` que force a diferença de comportamento
     (geralmente comparando a lista `reasons`, não só o `status`).
4. Rode `npm run mutation` novamente e registre o **score final**.
5. Copie os dois relatórios HTML (inicial e final) gerados — renomeie as
   pastas antes de rodar de novo, por exemplo `reports/mutation/html-inicial`
   e `reports/mutation/html-final`, para não sobrescrever.

### Observação sobre ruído
O Stryker também gera mutantes no bloco `if (require.main === module) { ... }`
no final de `ScholarshipEligibilityEvaluator.js` — esse trecho é só o exemplo
de uso manual (equivalente ao `__main__`/`main`), não faz parte da lógica de
negócio avaliada. Mutantes ali são ruído e podem ser descartados na análise,
com essa justificativa.

## Requisitos mínimos já cobertos pela suíte fornecida
- 1 caso APPROVED
- 2 casos MANUAL_REVIEW
- 6 casos REJECTED (motivos diferentes + prioridade rejeição/revisão)
- 4 casos de entrada inválida
- 13 casos de valor limite (idade, GPA, frequência)
- 4 casos de caminhos estruturais (combinações de regras booleanas)
- Todos os testes verificam `status` **e** `reasons`

Isso cobre os mínimos do enunciado, mas depois de rodar a mutação você
provavelmente vai precisar **adicionar mais testes** para matar os
sobreviventes classificados como lacuna — isso é esperado e faz parte da
atividade (itens 5.3 e "Requisitos mínimos: 3 mutantes analisados, 1
equivalente").
