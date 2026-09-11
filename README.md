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
