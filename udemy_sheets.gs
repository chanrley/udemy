// ============================================================
// CONFIGURAÇÕES — preencha com suas credenciais da Udemy
// udemy.com > Conta > Clientes de API > Criar cliente
// ============================================================
const UDEMY_CLIENT_ID     = 'SEU_CLIENT_ID_AQUI';
const UDEMY_CLIENT_SECRET = 'SEU_CLIENT_SECRET_AQUI';

// Nome da aba onde os dados serão escritos
const SHEET_NAME = 'Cursos Udemy';

// ============================================================

function fetchUdemyCourses() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clearContents();

  // Cabeçalho
  const headers = ['#', 'Título', 'Progresso (%)', 'Barra', 'Aulas', 'Status', 'Atualizado em'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);

  const token    = buildBasicToken();
  const courses  = getAllCourses(token);

  if (courses.length === 0) {
    sheet.getRange(2, 1).setValue('Nenhum curso encontrado. Verifique suas credenciais.');
    return;
  }

  // Ordena por progresso decrescente
  courses.sort((a, b) => b.completion_ratio - a.completion_ratio);

  const rows = courses.map((course, i) => {
    const pct    = Math.round(course.completion_ratio * 100);
    const status = pct === 100 ? '✅ Concluído' : pct === 0 ? '🔴 Não iniciado' : '🟡 Em andamento';

    return [
      i + 1,
      course.title,
      pct,
      '', // coluna da barra de progresso (preenchida abaixo)
      course.num_lectures || '-',
      status,
      new Date().toLocaleDateString('pt-BR')
    ];
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  // Formata coluna de progresso como porcentagem
  sheet.getRange(2, 3, rows.length, 1).setNumberFormat('0"%"');

  // Adiciona barras de progresso via fórmula REPT
  for (let i = 0; i < rows.length; i++) {
    const row    = i + 2;
    const pct    = rows[i][2];
    const filled = Math.round(pct / 5);  // cada bloco = 5%
    const empty  = 20 - filled;
    const bar    = '█'.repeat(filled) + '░'.repeat(empty);
    sheet.getRange(row, 4).setValue(bar);
  }

  applyConditionalFormatting(sheet, rows.length);
  autoResizeColumns(sheet, headers.length);

  SpreadsheetApp.getUi().alert(
    `✅ Concluído!\n${courses.length} cursos importados.\nAba: "${SHEET_NAME}"`
  );
}

// ============================================================
// Busca todas as páginas da API
// ============================================================
function getAllCourses(token) {
  const allCourses = [];
  let page         = 1;
  const pageSize   = 100;

  while (true) {
    const url = `https://www.udemy.com/api-2.0/users/me/subscribed-courses/`
      + `?fields[course]=title,completion_ratio,num_lectures`
      + `&ordering=-last_accessed`
      + `&page=${page}&page_size=${pageSize}`;

    const response = UrlFetchApp.fetch(url, {
      method      : 'GET',
      headers     : { Authorization: 'Basic ' + token },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      SpreadsheetApp.getUi().alert(
        `Erro na API (${response.getResponseCode()}):\n${response.getContentText()}`
      );
      return [];
    }

    const data = JSON.parse(response.getContentText());
    allCourses.push(...data.results);

    if (!data.next) break;
    page++;
  }

  return allCourses;
}

// ============================================================
// Helpers de autenticação e formatação
// ============================================================
function buildBasicToken() {
  return Utilities.base64Encode(`${UDEMY_CLIENT_ID}:${UDEMY_CLIENT_SECRET}`);
}

function formatHeader(sheet, numCols) {
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground('#1C3553');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function applyConditionalFormatting(sheet, numRows) {
  const range = sheet.getRange(2, 3, numRows, 1);
  const rules = [];

  // Verde — 100%
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberEqualTo(100)
    .setBackground('#C6EFCE')
    .setFontColor('#276221')
    .setRanges([range])
    .build());

  // Amarelo — entre 1 e 99%
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(1, 99)
    .setBackground('#FFEB9C')
    .setFontColor('#9C6500')
    .setRanges([range])
    .build());

  // Vermelho — 0%
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberEqualTo(0)
    .setBackground('#FFC7CE')
    .setFontColor('#9C0006')
    .setRanges([range])
    .build());

  sheet.setConditionalFormatRules(rules);
}

function autoResizeColumns(sheet, numCols) {
  for (let i = 1; i <= numCols; i++) {
    sheet.autoResizeColumn(i);
  }
  // Título um pouco mais largo
  sheet.setColumnWidth(2, 400);
  // Barra de progresso
  sheet.setColumnWidth(4, 180);
}

// ============================================================
// Menu personalizado
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎓 Udemy')
    .addItem('Importar cursos e progresso', 'fetchUdemyCourses')
    .addToUi();
}
